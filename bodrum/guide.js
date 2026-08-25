const list = document.querySelector('#restaurant-list');
const errorBox = document.querySelector('#restaurant-error');
const number = new Intl.NumberFormat('tr-TR');

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));

const safeHref = (value) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '#';
  } catch { return '#'; }
};

const stateLabel = (value) => {
  if (!value) return '';
  const lower = value.toLocaleLowerCase('tr-TR');
  if (lower.includes('open') || lower.includes('açık')) return '<span class="open-state">● Açık</span>';
  if (lower.includes('closed') || lower.includes('kapalı')) return '<span class="closed-state">● Kapalı</span>';
  return `<span class="neutral-state">${escapeHtml(value)}</span>`;
};

const card = (restaurant) => `<article class="restaurant-card">
  <div class="rank"><small>NO.</small><strong>${restaurant.rank}</strong></div>
  <div class="restaurant-main">
    <div class="restaurant-top"><span class="category">${escapeHtml(restaurant.category)}</span>${stateLabel(restaurant.openState)}</div>
    <h2>${escapeHtml(restaurant.name)}</h2>
    <p class="address">⌖ ${escapeHtml(restaurant.address)}</p>
    <div class="restaurant-meta"><span class="rating"><b>★ ${restaurant.rating.toFixed(1)}</b><small>${number.format(restaurant.reviews)} değerlendirme</small></span>${restaurant.price ? `<span class="price">${escapeHtml(restaurant.price)}</span>` : ''}</div>
  </div>
  <div class="restaurant-actions">
    ${restaurant.website ? `<a href="${safeHref(restaurant.website)}" target="_blank" rel="noopener noreferrer nofollow">Web sitesi <span>↗</span></a>` : ''}
    <a class="map-button" href="${safeHref(restaurant.mapUrl)}" target="_blank" rel="noopener noreferrer nofollow">Haritada gör <span>→</span></a>
  </div>
</article>`;

async function loadRestaurants() {
  errorBox.hidden = true;
  list.innerHTML = '<div class="restaurant-loading"><span></span><span></span><span></span><p>Restoranlar hazırlanıyor…</p></div>';
  try {
    const response = await fetch('/api/bodrum-restaurants', { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('request failed');
    const payload = await response.json();
    if (!Array.isArray(payload.restaurants) || !payload.restaurants.length) throw new Error('empty');
    list.innerHTML = payload.restaurants.map(card).join('');
  } catch {
    list.innerHTML = '';
    errorBox.hidden = false;
  }
}

document.querySelector('#retry').addEventListener('click', loadRestaurants);
loadRestaurants();
