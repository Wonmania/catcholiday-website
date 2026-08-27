import { readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('content/seo-publishing-manifest.json', 'utf8'));
const pages = Object.entries(manifest)
  .filter(([key, batch]) => key.startsWith('batch') && batch?.status === 'published')
  .flatMap(([, batch]) => batch.pages)
  .filter((page) => page.status === 'published');

const esc = (value = '') => String(value).replace(/[&<>\"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
}[char]));

const pageHtml = (page) => {
  const title = esc(page.title);
  const name = esc(page.name);
  const parent = esc(page.parent);
  const profile = esc(page.profile || `${page.name}, konumu ve farklı konaklama seçenekleriyle öne çıkan bir tatil bölgesidir.`);
  const canonical = `https://www.catcholiday.com/${page.slug}`;
  const cover = page.coverImage || '/assets/antalya-hero.png';
  return `<!doctype html>
<html lang="tr" data-slug="${page.slug}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#082c38"><meta name="description" content="${title}: puanlar, değerlendirmeler, fotoğraflar ve güncel konaklama seçenekleriyle ${name} otel rehberi."><link rel="canonical" href="${canonical}"><meta property="og:title" content="${title} | Catcholiday"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://www.catcholiday.com${cover}"><title>${title} | Catcholiday</title><link rel="icon" href="/favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/hotel-guide.css?v=4"></head>
<body class="hotel-page"><header class="nav-wrap scrolled"><nav class="nav container"><a class="brand" href="/"><span class="brand-mark"><span></span></span><span>Catcholiday</span></a><div class="nav-links"><a href="/">Ana sayfa</a><a href="#oteller">Oteller</a><a href="#rehber">Rehber</a></div><a class="button button-small button-dark" href="/#erken-erisim">Erken erişim</a></nav></header>
<main><section class="hotel-hero"><div class="container"><span class="hotel-kicker">${name.toUpperCase()} • OTEL REHBERİ</span><h1>${title}</h1><figure class="hotel-cover"><img id="destination-cover" data-static="true" src="${cover}" alt="${name} tatil görünümü" fetchpriority="high" decoding="async" width="1600" height="900"><figcaption class="hotel-cover-brand">Catcholiday • ${name} Rehberi</figcaption></figure></div></section>
<section class="hotel-content" id="oteller"><div class="container"><div class="hotel-intro"><p><strong>${title}</strong>, ${profile} Bu seçki; güçlü misafir puanı, yeterli değerlendirme sayısı ve bölgeyle ilişkili güncel tesis verileri birlikte değerlendirilerek hazırlanır.</p><p>${parent} çevresindeki fiyatlar tarih, doluluk, hafta sonu ve oda koşullarına göre değişebilir. Otelleri karşılaştırırken toplam fiyatı, vergi durumunu, pansiyon tipini ve ücretsiz iptal süresini aynı koşullarda kontrol edin.</p></div><div class="hotel-toolbar"><div><i></i><b>${title}</b></div><span>10 otel</span></div><div class="hotel-grid" id="hotel-list"><div class="hotel-loading">Otel seçkisi hazırlanıyor…</div></div>
<section class="hotel-editorial"><span class="hotel-kicker">CATCHOLIDAY FAVORİ SEÇİM</span><h2>${name} Otellerini Yakından Tanıyın</h2><div class="hotel-stories" id="hotel-stories"></div></section>
<article class="hotel-seo" id="rehber"><section><h2>${name}'da Nerede Kalınır?</h2><p>${profile} Seyahat planınızda merkeze, sahile ve görmek istediğiniz noktalara yakınlığı birlikte düşünmek günlük ulaşım süresini azaltır.</p><h3>${name} Oteli Seçerken Önemli Noktalar</h3><p>Aynı yıldız seviyesindeki tesisler oda büyüklüğü, manzara, yemek düzeni, plaja erişim ve iptal koşulları bakımından ayrışabilir. Yalnızca görünen gecelik fiyata değil, ödeme ekranındaki toplam tutara bakın.</p><h4>Konum ve ulaşım</h4><p>Araç kullanacaksanız otoparkı; toplu taşımayı tercih edecekseniz duraklara ve merkeze mesafeyi kontrol edin.</p><h4>Oda, pansiyon ve iptal koşulları</h4><p>Yatak tipi, kişi kapasitesi, öğün kapsamı, vergi ve ücretsiz iptal tarihi karar vermeden önce doğrulanmalıdır.</p></section><section><h2>${name} Otel Fiyatları Ne Zaman Değişir?</h2><p>Fiyatlar seyahat tarihi, kalan oda sayısı, hafta sonu, tatil dönemleri ve oda tipine göre değişir. Tek bir güne ait etiketi iyi fiyat kabul etmek yerine aynı koşullardaki geçmiş gözlemlerle karşılaştırmak daha sağlıklı sonuç verir.</p><h3>Rezervasyon Öncesi Son Kontrol</h3><p>Çocuk politikasını, giriş ve çıkış saatlerini, ödeme koşullarını ve sağlayıcıdaki son toplam tutarı yeniden doğrulayın. Geleceğe yönelik fiyat yorumlarının tahmin olduğunu unutmayın.</p></section></article></div></section></main>
<footer><div class="container footer-grid"><div><a class="brand footer-brand" href="/"><span class="brand-mark"><span></span></span><span>Catcholiday</span></a><p>Catch the drop. Take the holiday.</p></div><div><b>Keşfet</b><a href="#oteller">${name} otelleri</a><a href="/#tatil-rehberi">Tatil rehberi</a></div><div><b>Yasal</b><a href="/gizlilik-kvkk">Gizlilik ve KVKK</a><a href="/kullanim-kosullari">Kullanım koşulları</a></div></div></footer><script src="/assets/hotel-guide.js?v=4" defer></script></body></html>`;
};

for (const page of pages) await writeFile(`dist/${page.slug}.html`, pageHtml(page));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const existing = new Set([...sitemap.matchAll(/<loc>https:\/\/www\.catcholiday\.com\/([^<]*)<\/loc>/g)].map((match) => match[1]));
const urls = pages.filter((page) => !existing.has(page.slug)).map((page) => `  <url><loc>https://www.catcholiday.com/${page.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n');
await writeFile('dist/sitemap.xml', sitemap.replace('</urlset>', `${urls ? `${urls}\n` : ''}</urlset>`));
