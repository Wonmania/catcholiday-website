const API_URL = 'https://www.searchapi.io/api/v1/search';

const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const imageUrl = (value) => {
  const url = safeUrl(value);
  if (!url) return null;
  return url.replace(/=w\d+-h\d+-k-no(?:-[a-z]+)?$/i, '=w900-h600-k-no');
};

const mapUrl = (place) => {
  const query = encodeURIComponent([place.title, place.address].filter(Boolean).join(' '));
  const id = place.place_id ? `&query_place_id=${encodeURIComponent(place.place_id)}` : '';
  return `https://www.google.com/maps/search/?api=1&query=${query}${id}`;
};

const qualityScore = (place) => {
  const rating = Number(place.rating || 0);
  const reviews = Number(place.reviews || 0);
  const confidence = reviews / (reviews + 350);
  return (confidence * rating) + ((1 - confidence) * 4.2);
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SEARCHAPI_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'Service unavailable' });

  const params = new URLSearchParams({
    engine: 'google_maps',
    q: 'Bodrum restoranları',
    ll: '@37.0344,27.4305,13z',
    hl: 'tr',
    gl: 'tr',
    api_key: apiKey,
  });

  try {
    const upstream = await fetch(`${API_URL}?${params}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error(`Search provider returned ${upstream.status}`);
    const payload = await upstream.json();
    const rows = Array.isArray(payload.local_results) ? payload.local_results : [];
    const restaurants = rows
      .filter((item) => Number(item.rating) >= 4 && Number(item.reviews) >= 50)
      .sort((a, b) => qualityScore(b) - qualityScore(a))
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        name: item.title || 'Restoran',
        category: item.type || (Array.isArray(item.types) ? item.types[0] : '') || 'Restoran',
        rating: Number(item.rating || 0),
        reviews: Number(item.reviews || 0),
        price: item.price || null,
        address: item.address || 'Bodrum, Muğla',
        openState: item.open_state || item.hours || null,
        website: safeUrl(item.website),
        image: imageUrl(item.thumbnail) || imageUrl(Array.isArray(item.images) ? item.images[0] : null),
        mapUrl: mapUrl(item),
      }));

    if (!restaurants.length) throw new Error('No restaurants found');
    response.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return response.status(200).json({ restaurants });
  } catch (error) {
    console.error('Bodrum restaurant lookup failed', error);
    return response.status(502).json({ error: 'Restaurants unavailable' });
  }
}
