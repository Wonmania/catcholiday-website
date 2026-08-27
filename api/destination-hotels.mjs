const API_URL = 'https://www.searchapi.io/api/v1/search';
const destinations = new Map([
  ['bodrumun-en-iyi-10-oteli', 'Bodrum, Muğla'], ['alanyanin-en-iyi-10-oteli', 'Alanya, Antalya'],
  ['sidenin-en-iyi-10-oteli', 'Side, Manavgat, Antalya'], ['belekin-en-iyi-10-oteli', 'Belek, Serik, Antalya'],
  ['kemerin-en-iyi-10-oteli', 'Kemer, Antalya'], ['marmarisin-en-iyi-10-oteli', 'Marmaris, Muğla'],
  ['fethiyenin-en-iyi-10-oteli', 'Fethiye, Muğla'], ['manavgatin-en-iyi-10-oteli', 'Manavgat, Antalya'],
  ['laranin-en-iyi-10-oteli', 'Lara, Antalya'], ['cesmenin-en-iyi-10-oteli', 'Çeşme, İzmir'],
  ['alacatinin-en-iyi-10-oteli', 'Alaçatı, Çeşme, İzmir'], ['oludenizin-en-iyi-10-oteli', 'Ölüdeniz, Fethiye, Muğla'],
  ['fatihin-en-iyi-10-oteli', 'Fatih, İstanbul'], ['taksimin-en-iyi-10-oteli', 'Taksim, Beyoğlu, İstanbul'],
  ['kusadasinin-en-iyi-10-oteli', 'Kuşadası, Aydın'], ['goremenin-en-iyi-10-oteli', 'Göreme, Nevşehir'],
  ['kalkanin-en-iyi-10-oteli', 'Kalkan, Kaş, Antalya'], ['kasin-en-iyi-10-oteli', 'Kaş, Antalya'],
  ['didimin-en-iyi-10-oteli', 'Didim, Aydın'], ['yalikavakin-en-iyi-10-oteli', 'Yalıkavak, Bodrum, Muğla'],
  ['beyoglunun-en-iyi-10-oteli', 'Beyoğlu, İstanbul'], ['kapadokyanin-en-iyi-10-oteli', 'Kapadokya, Nevşehir'],
  ['urgupun-en-iyi-10-oteli', 'Ürgüp, Nevşehir'], ['dalyanin-en-iyi-10-oteli', 'Dalyan, Ortaca, Muğla'],
  ['sarigermenin-en-iyi-10-oteli', 'Sarıgerme, Ortaca, Muğla'], ['gumbetin-en-iyi-10-oteli', 'Gümbet, Bodrum, Muğla'],
  ['bitezin-en-iyi-10-oteli', 'Bitez, Bodrum, Muğla'], ['turgutreisin-en-iyi-10-oteli', 'Turgutreis, Bodrum, Muğla'],
  ['gumuslugun-en-iyi-10-oteli', 'Gümüşlük, Bodrum, Muğla'], ['torbanin-en-iyi-10-oteli', 'Torba, Bodrum, Muğla'],
  ['turkbukunun-en-iyi-10-oteli', 'Türkbükü, Bodrum, Muğla'], ['akyarlarin-en-iyi-10-oteli', 'Akyarlar, Bodrum, Muğla'],
  ['gocekin-en-iyi-10-oteli', 'Göcek, Fethiye, Muğla'], ['hisaronunun-en-iyi-10-oteli', 'Hisarönü, Fethiye, Muğla'],
  ['ovacikin-en-iyi-10-oteli', 'Ovacık, Fethiye, Muğla'], ['kabak-koyunun-en-iyi-10-oteli', 'Kabak Koyu, Fethiye, Muğla'],
  ['adrasanin-en-iyi-10-oteli', 'Adrasan, Kumluca, Antalya'], ['olymposun-en-iyi-10-oteli', 'Olympos, Kumluca, Antalya'],
  ['ciralinin-en-iyi-10-oteli', 'Çıralı, Kemer, Antalya'], ['tekirovanin-en-iyi-10-oteli', 'Tekirova, Kemer, Antalya'],
  ['goynukun-en-iyi-10-oteli', 'Göynük, Kemer, Antalya'], ['beldibinin-en-iyi-10-oteli', 'Beldibi, Kemer, Antalya'],
  ['kirisin-en-iyi-10-oteli', 'Kiriş, Kemer, Antalya'], ['kundunun-en-iyi-10-oteli', 'Kundu, Aksu, Antalya'],
  ['konyaaltinin-en-iyi-10-oteli', 'Konyaaltı, Antalya'], ['kaleicinin-en-iyi-10-oteli', 'Kaleiçi, Muratpaşa, Antalya'],
  ['muratpasanin-en-iyi-10-oteli', 'Muratpaşa, Antalya'], ['avsallarin-en-iyi-10-oteli', 'Avsallar, Alanya, Antalya'],
  ['mahmutlarin-en-iyi-10-oteli', 'Mahmutlar, Alanya, Antalya'], ['okurcalarin-en-iyi-10-oteli', 'Okurcalar, Alanya, Antalya'],
  ['incekumun-en-iyi-10-oteli', 'İncekum, Alanya, Antalya'], ['kestelin-en-iyi-10-oteli', 'Kestel, Alanya, Antalya'],
  ['obanin-en-iyi-10-oteli', 'Oba, Alanya, Antalya'], ['kizilotun-en-iyi-10-oteli', 'Kızılot, Manavgat, Antalya'],
  ['evrensekinin-en-iyi-10-oteli', 'Evrenseki, Manavgat, Antalya'], ['kumkoyun-en-iyi-10-oteli', 'Kumköy, Manavgat, Antalya'],
  ['colaklinin-en-iyi-10-oteli', 'Çolaklı, Manavgat, Antalya'], ['sorgunun-en-iyi-10-oteli', 'Sorgun, Manavgat, Antalya'],
  ['ilicanin-en-iyi-10-oteli', 'Ilıca, Çeşme, İzmir'], ['cesme-dalyaninin-en-iyi-10-oteli', 'Dalyan, Çeşme, İzmir'],
  ['urlanin-en-iyi-10-oteli', 'Urla, İzmir'],
]);
const safeUrl = (value) => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
const imageUrl = (item) => {
  const url = safeUrl(item?.thumbnail || item?.original || item);
  if (!url) return null;
  return url.replace(/=s\d+-w\d+-h\d+[^?]*$/i, '=w900-h600-k-no');
};
const date = (days) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
const score = (hotel) => { const rating = Number(hotel.rating || 0); const reviews = Number(hotel.reviews || 0); return rating * (reviews / (reviews + 300)) + 4.1 * (300 / (reviews + 300)); };

export default async function handler(request, response) {
  const slug = String(request.query?.slug || '');
  const destination = destinations.get(slug);
  if (!destination) return response.status(404).json({ error: 'Destination not found' });
  const apiKey = process.env.SEARCHAPI_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'Service unavailable' });
  const params = new URLSearchParams({ engine: 'google_hotels', q: `${destination} otelleri`, check_in_date: date(30), check_out_date: date(32), property_type: 'hotel', sort_by: 'highest_rating', adults: '2', currency: 'TRY', hl: 'tr', gl: 'tr', api_key: apiKey });
  try {
    const upstream = await fetch(`${API_URL}?${params}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) throw new Error(`Provider ${upstream.status}`);
    const payload = await upstream.json();
    const hotels = (Array.isArray(payload.properties) ? payload.properties : [])
      .filter((item) => Number(item.rating) >= 4 && Number(item.reviews) >= 30)
      .sort((a, b) => score(b) - score(a)).slice(0, 10)
      .map((item, index) => ({ rank: index + 1, name: item.name || 'Otel', rating: Number(item.rating || 0), reviews: Number(item.reviews || 0), description: item.description || '', hotelClass: Number(item.hotel_class || 0), amenities: Array.isArray(item.amenities) ? item.amenities.slice(0, 4) : [], price: item.price_per_night?.price || item.total_price?.price || null, image: imageUrl(Array.isArray(item.images) ? item.images[0] : item.thumbnail), link: safeUrl(item.link), checkIn: params.get('check_in_date'), checkOut: params.get('check_out_date') }));
    if (hotels.length < 10 || hotels.some((hotel) => !hotel.image)) {
      throw new Error(`Quality gate failed: ${hotels.length}/10 hotels`);
    }
    response.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return response.status(200).json({ destination, hotels });
  } catch (error) {
    console.error('Hotel lookup failed', slug, error);
    return response.status(502).json({ error: 'Hotels unavailable' });
  }
}
