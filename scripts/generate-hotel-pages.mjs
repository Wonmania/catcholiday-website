import { readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('content/seo-publishing-manifest.json', 'utf8'));
const pages = Object.entries(manifest)
  .filter(([key, batch]) => key.startsWith('batch') && batch?.status === 'published')
  .flatMap(([, batch]) => batch.pages)
  .filter((page) => page.status === 'published');

const esc = (value = '') => String(value).replace(/[&<>\"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
}[char]));

const coastalTerms = /Bodrum|Alanya|Side|Belek|Kemer|Marmaris|Fethiye|Lara|Çeşme|Alaçatı|Ölüdeniz|Kuşadası|Kalkan|Kaş|Didim|Yalıkavak|Dalyan|Sarıgerme|Gümbet|Bitez|Turgutreis|Gümüşlük|Torba|Türkbükü|Akyarlar|Göcek|Kabak|Adrasan|Olympos|Çıralı|Tekirova|Göynük|Beldibi|Kiriş|Kundu|Konyaaltı|Kaleiçi|Avsallar|Mahmutlar|Okurcalar|İncekum|Kızılot|Evrenseki|Kumköy|Çolaklı|Sorgun|Ilıca|Urla|Sığacık|Seferihisar|Foça|Özdere|Gümüldür|Selçuk|Pamucak|Ayvalık|Cunda|Altınoluk|Akçay|Güre|Bozcaada|Gökçeada|Akyaka|Datça|Palamutbükü|Amasra/i;
const winterTerms = /Uludağ|Erciyes|Kartepe|Abant|Ayder|Çamlıhemşin|Uzungöl|Maşukiye/i;
const cultureTerms = /Kapadokya|Göreme|Ürgüp|Uçhisar|Avanos|Ortahisar|Pamukkale|Safranbolu|Sultanahmet|Fatih|Galata|Karaköy|Beyoğlu/i;

const contextFor = (page) => {
  if (winterTerms.test(page.name)) return {
    type: 'dağ ve doğa', season: 'Kış aylarında kar ve pist koşulları; bahar ile yaz döneminde ise yürüyüş rotaları ve doğa aktiviteleri talebi belirler.',
    location: 'Pistlere, yürüyüş başlangıçlarına veya merkez bağlantısına yakınlık; hava koşullarında ulaşımı kolaylaştırır.',
    audience: 'Kayak planlayanlar, doğa gezginleri ve sakin bir hafta sonu arayan çiftler',
    transport: 'Kış lastiği, zincir, transfer seçeneği ve otopark imkânı seyahatten önce doğrulanmalıdır.'
  };
  if (cultureTerms.test(page.name)) return {
    type: 'kültür ve şehir', season: 'İlkbahar ve sonbahar yürüyüş odaklı keşifler için dengeli hava sunarken resmî tatiller ve özel etkinlikler talebi artırabilir.',
    location: 'Tarihî noktalara, toplu taşımaya ve akşam yürüyüş rotalarına yakınlık günlük programı kolaylaştırır.',
    audience: 'Kültür gezginleri, kısa şehir kaçamağı planlayan çiftler ve fotoğraf meraklıları',
    transport: 'Toplu taşıma bağlantısı, yaya erişimi ve havalimanı transfer süresi birlikte değerlendirilmelidir.'
  };
  if (coastalTerms.test(page.name)) return {
    type: 'deniz tatili', season: 'Yaz ayları en yoğun dönemdir; mayıs-haziran ile eylül-ekim aralığı daha ılıman hava ve farklı fiyat seçenekleri sunabilir.',
    location: 'Plaja gerçek yürüme mesafesi, sahil tipi, merkeze ulaşım ve akşam hareketliliği konaklama deneyimini doğrudan etkiler.',
    audience: 'Deniz tatili planlayan aileler, çiftler ve arkadaş grupları',
    transport: 'Havalimanı transfer süresi, otopark ve bölge içi minibüs ya da taksi seçenekleri önceden kontrol edilmelidir.'
  };
  return {
    type: 'şehir ve çevre keşfi', season: 'Hafta sonları, resmî tatiller, fuarlar ve yerel etkinlikler talebi ve fiyatları kısa sürede değiştirebilir.',
    location: 'Merkeze, toplu taşımaya ve planlanan ziyaret noktalarına yakınlık ulaşım süresini azaltır.',
    audience: 'Kısa tatil planlayanlar, aileler ve iş seyahatini geziyle birleştiren ziyaretçiler',
    transport: 'Toplu taşıma, otopark ve terminal ya da havalimanı bağlantıları birlikte değerlendirilmelidir.'
  };
};

const relatedFor = (page, pages) => pages
  .filter((candidate) => candidate.slug !== page.slug && (candidate.parent === page.parent || candidate.parent.includes(page.name) || page.parent.includes(candidate.name)))
  .slice(0, 4);

const pageHtml = (page) => {
  const title = esc(page.title);
  const name = esc(page.name);
  const parent = esc(page.parent);
  const profile = esc(page.profile || `${page.name}, konumu ve farklı konaklama seçenekleriyle öne çıkan bir tatil bölgesidir.`);
  const canonical = `https://www.catcholiday.com/${page.slug}`;
  const cover = page.coverImage || '/assets/antalya-hero.png';
  const context = contextFor(page);
  const related = relatedFor(page, pages);
  const updated = page.validatedAt || '2026-09-02T09:00:00+03:00';
  const relatedLinks = related.length ? related.map((item) => `<a href="/${item.slug}"><span>${esc(item.parent)}</span><b>${esc(item.title)}</b> →</a>`).join('') : '<a href="/#tatil-rehberi"><span>Catcholiday</span><b>Diğer tatil rehberlerini keşfet</b> →</a>';
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: page.title, description: `${page.title}: konum, sezon, otel seçimi ve rezervasyon kontrol adımlarıyla kapsamlı rehber.`, image: `https://www.catcholiday.com${cover}`, datePublished: page.validatedAt || page.publishedAt || '2026-08-25T09:00:00+03:00', dateModified: '2026-09-02T09:00:00+03:00', author: { '@type': 'Organization', name: 'Catcholiday', url: 'https://www.catcholiday.com/' }, publisher: { '@type': 'Organization', name: 'Catcholiday', url: 'https://www.catcholiday.com/' }, mainEntityOfPage: canonical });
  return `<!doctype html>
<html lang="tr" data-slug="${page.slug}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#082c38"><meta name="description" content="${title}: konum, sezon, otel seçimi, ulaşım ve rezervasyon kontrol adımlarıyla kapsamlı ${name} rehberi."><link rel="canonical" href="${canonical}"><meta property="og:title" content="${title} | Catcholiday"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://www.catcholiday.com${cover}"><title>${title} | Catcholiday</title><link rel="icon" href="/favicon.png"><script type="application/ld+json">${schema.replace(/</g, '\\u003c')}</script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/hotel-guide.css?v=5"></head>
<body class="hotel-page"><header class="nav-wrap scrolled"><nav class="nav container"><a class="brand" href="/"><span class="brand-mark"><span></span></span><span>Catcholiday</span></a><div class="nav-links"><a href="/">Ana sayfa</a><a href="#oteller">Oteller</a><a href="#rehber">Rehber</a></div><a class="button button-small button-dark" href="/#erken-erisim">Erken erişim</a></nav></header>
<main><section class="hotel-hero"><div class="container"><span class="hotel-kicker">${name.toUpperCase()} • OTEL REHBERİ</span><h1>${title}</h1><figure class="hotel-cover"><img id="destination-cover" data-static="true" src="${cover}" alt="${name} tatil görünümü" fetchpriority="high" decoding="async" width="1600" height="900"><figcaption class="hotel-cover-brand">Catcholiday • ${name} Rehberi</figcaption></figure></div></section>
<section class="hotel-content" id="oteller"><div class="container"><div class="hotel-intro"><p><strong>${title}</strong>, ${profile} Bu kapsamlı rehber; konum, seyahat dönemi, misafir profili ve tesis özelliklerini birlikte değerlendirerek doğru bölge ile doğru oteli eşleştirmenize yardımcı olur.</p><p>${parent} çevresindeki fiyatlar tarih, doluluk, hafta sonu ve oda koşullarına göre değişebilir. Otelleri karşılaştırırken toplam fiyatı, vergi durumunu, pansiyon tipini ve ücretsiz iptal süresini aynı koşullarda kontrol edin.</p><div class="hotel-byline"><b>Catcholiday Editör Ekibi</b><span>Son güncelleme: ${esc(new Date(updated).toLocaleDateString('tr-TR'))}</span><span>Okuma süresi: 8 dakika</span></div></div><div class="hotel-toolbar"><div><i></i><b>${title}</b></div><span>10 otel</span></div><div class="hotel-grid" id="hotel-list"><div class="hotel-loading">Otel seçkisi hazırlanıyor…</div></div>
<section class="hotel-editorial"><span class="hotel-kicker">CATCHOLIDAY FAVORİ SEÇİM</span><h2>${name} Otellerini Yakından Tanıyın</h2><div class="hotel-stories" id="hotel-stories"></div></section>
<article class="hotel-seo" id="rehber">
<section><h2>${name}'da Nerede Kalınır?</h2><p>${profile} ${context.location} Konaklama bölgesini seçerken yalnızca haritadaki kuş uçuşu mesafeye bakmayın; yol yapısı, yokuş, servis sıklığı ve akşam dönüş imkânı gerçek seyahat süresini değiştirebilir.</p><p>${name}, ağırlıklı olarak ${context.type} deneyimi arayan ziyaretçilere hitap eder. ${context.audience} için doğru tesis seçimi; tatilin temposunu, ulaşım bütçesini ve tesiste geçirilecek süreyi doğrudan etkiler. Gün içinde sık sık dışarı çıkmayı planlıyorsanız merkezi konum, dinlenme odaklı bir program yapıyorsanız tesis olanakları daha fazla ağırlık kazanmalıdır.</p><h3>${name} Oteli Seçerken Önemli Noktalar</h3><p>Aynı yıldız seviyesindeki tesisler oda büyüklüğü, manzara, yemek düzeni, ortak alanlar ve iptal koşulları bakımından ciddi biçimde ayrışabilir. Fotoğrafların hangi oda kategorisine ait olduğunu kontrol edin ve yalnızca başlangıç fiyatına değil, ödeme ekranındaki toplam tutara bakın.</p><h4>Konum ve ulaşım</h4><p>${context.transport} Haritada yakın görünen iki otelden biri yürüyüş açısından daha zor olabilir. Günlük rotanızı önceden çıkararak konaklama boyunca gerekecek transfer sayısını ve tahmini ulaşım maliyetini hesaplayın.</p><h4>Oda, pansiyon ve iptal koşulları</h4><p>Yatak tipi, kişi kapasitesi, ek yatak politikası, öğün kapsamı, vergi ve ücretsiz iptal tarihi karar vermeden önce doğrulanmalıdır. “Kahvaltı dâhil” veya “her şey dâhil” ifadelerinin her tesiste aynı kapsamı taşımadığını unutmayın.</p></section>
<section><h2>${name}'a Ne Zaman Gidilir?</h2><p>${context.season} Seyahat tarihini seçerken yalnızca hava durumunu değil, bölgedeki etkinlikleri, okul tatillerini ve resmî tatil birleşimlerini de hesaba katın. Aynı otel hafta içi ve hafta sonunda farklı talep görebilir.</p><h3>Sakinlik mi, hareketlilik mi?</h3><p>Yoğun sezonda daha fazla işletme ve aktivite açık olur; buna karşılık trafik, kalabalık ve fiyat seviyesi artabilir. Sezonun omuz dönemleri daha sakin bir deneyim sağlayabilir, ancak bazı hizmetlerin sınırlı çalışması mümkündür. Beklentinizle seyahat dönemini eşleştirmek, yalnızca ucuz tarihi seçmekten daha doğru sonuç verir.</p><h4>Kaç gece ayırmalı?</h4><p>Kısa bir hafta sonu programında merkezi bir otel zaman kazandırır. Bölgeyi çevresiyle birlikte keşfetmek, dinlenme günleri eklemek veya günübirlik rotalar yapmak istiyorsanız daha uzun konaklama düşünün. Giriş ve çıkış saatlerini programın kullanılabilir gün sayısına dâhil edin.</p></section>
<section><h2>${name} Otel Fiyatları Neden Değişir?</h2><p>Fiyatlar seyahat tarihi, kalan oda sayısı, talep, hafta sonu, tatil dönemleri, oda tipi ve satış kanalına göre değişir. Tek bir güne ait üzeri çizili etiketi iyi fiyat kabul etmek yerine, aynı tarih ve aynı koşullardaki geçmiş gözlemlerle karşılaştırmak daha sağlıklı sonuç verir.</p><h3>Adil bir fiyat karşılaştırması nasıl yapılır?</h3><p>İki seçeneği karşılaştırırken giriş-çıkış tarihleri, kişi ve çocuk sayısı, oda kategorisi, pansiyon türü, iptal esnekliği, ödeme zamanı, para birimi ve vergilerin aynı olduğundan emin olun. İade edilemez bir oda ile ücretsiz iptalli oda arasındaki fark gerçek bir indirim olmayabilir.</p><h4>Toplam tutarı kontrol edin</h4><p>Gecelik fiyat yerine bütün konaklamanın toplamını inceleyin. Vergi, tesis ücreti, çocuk farkı, transfer, otopark veya zorunlu hizmetler son adımda toplamı değiştirebilir. Rezervasyonu tamamlamadan önce sağlayıcı ekranındaki nihai tutar esas alınmalıdır.</p></section>
<section><h2>Kimler İçin Hangi Otel Daha Uygun?</h2><h3>Çiftler ve sakin tatil arayanlar</h3><p>Oda mahremiyeti, yetişkinlere ayrılmış alanlar, akşam atmosferi ve çevredeki restoran seçenekleri öne çıkar. Manzara için ek ücret ödemeden önce balkon tipi ve görüş açısını oda açıklamasında doğrulayın.</p><h3>Çocuklu aileler</h3><p>Çocuk havuzu veya oyun alanının bulunması tek başına yeterli değildir. Yaş grubu, çalışma saatleri, gölgelik alanlar, aile odasının yerleşimi, çocuk menüsü ve sağlık hizmetlerine erişim birlikte değerlendirilmelidir.</p><h3>Aktif gezginler ve arkadaş grupları</h3><p>Merkezi konum, geç saat ulaşımı, ortak alanlar ve çevredeki aktivitelere erişim daha önemli olabilir. Tesiste az zaman geçirecekseniz kullanmayacağınız hizmetler için daha yüksek paket ücreti ödemek yerine konum avantajına odaklanın.</p></section>
<section><h2>Rezervasyon Öncesi Kontrol Listesi</h2><ul><li>Oda adını ve fotoğrafların seçilen kategoriye ait olduğunu kontrol edin.</li><li>Vergi ve ek ücretler dâhil toplam konaklama tutarını karşılaştırın.</li><li>Ücretsiz iptalin son tarihini ve iade süresini okuyun.</li><li>Çocuk, ek yatak ve evcil hayvan politikasını doğrulayın.</li><li>Havalimanı, terminal, merkez ve planlanan rotalara gerçek ulaşım süresine bakın.</li><li>Son dönem misafir yorumlarında temizlik, gürültü ve hizmet tutarlılığını inceleyin.</li></ul><h3>Catcholiday yaklaşımı</h3><p>Catcholiday bir rezervasyon satıcısı değildir. Amacımız karşılaştırılabilir koşullardaki fiyatları görünür kılmak, geçmiş değişimleri izlemek ve anlamlı düşüşleri fark etmenizi kolaylaştırmaktır. Fiyat ve müsaitlik hızla değişebileceği için nihai bilgi her zaman yönlendirildiğiniz sağlayıcıda doğrulanmalıdır.</p></section>
<section><h2>${name} Hakkında Sık Sorulan Sorular</h2><h3>${name}'da otel seçerken önce neye bakılmalı?</h3><p>İlk adım tatilden beklediğiniz deneyimi netleştirmektir. ${context.audience} için konum, tesis kapsamı ve ulaşım ihtiyacı farklı ağırlıklar taşıyabilir. Gününüzün çoğunu dışarıda geçirecekseniz merkezi ulaşım; tesiste dinlenecekseniz oda ve ortak alan kalitesi öncelikli olmalıdır.</p><h3>${name} için erken rezervasyon her zaman avantajlı mı?</h3><p>Erken rezervasyon daha geniş oda seçeneği ve esnek planlama sağlayabilir, ancak her tarih için en düşük fiyat garantisi değildir. İptal koşulu uygunsa erken seçeneği güvenceye alıp aynı oda koşullarındaki değişimi takip etmek daha dengeli bir yöntemdir.</p><h3>${name}'da araç gerekli mi?</h3><p>Bu karar seçilen otelin konumuna ve gezi programına bağlıdır. Tek merkezde kalıp yakın çevreyi keşfedecekseniz toplu taşıma veya kısa transferler yeterli olabilir. Çevre rotalarını programa ekliyorsanız araç zaman kazandırabilir; otopark ve yoğun dönem trafiğini de hesaba katın.</p><h3>Otel puanı tek başına yeterli mi?</h3><p>Hayır. Puanın yanında değerlendirme sayısını, yorumların güncelliğini ve sizin için önemli konuların yorumlarda ne sıklıkla geçtiğini inceleyin. Çocuklu bir ailenin önceliği ile kısa bir çift tatilinin beklentisi aynı olmayacağından yorumları kendi seyahat profilinize göre okuyun.</p></section>
<section class="hotel-related"><h2>${name} Çevresindeki Diğer Rehberler</h2><p>Seyahat planınızı tek bir bölgeyle sınırlamak zorunda değilsiniz. Yakındaki alternatifleri konum, tatil tarzı ve ulaşım süresi açısından karşılaştırın.</p><div>${relatedLinks}</div></section>
</article></div></section></main>
<footer><div class="container footer-grid"><div><a class="brand footer-brand" href="/"><span class="brand-mark"><span></span></span><span>Catcholiday</span></a><p>Catch the drop. Take the holiday.</p></div><div><b>Keşfet</b><a href="#oteller">${name} otelleri</a><a href="/#tatil-rehberi">Tatil rehberi</a></div><div><b>Yasal</b><a href="/gizlilik-kvkk">Gizlilik ve KVKK</a><a href="/kullanim-kosullari">Kullanım koşulları</a></div></div></footer><script src="/assets/hotel-guide.js?v=5" defer></script></body></html>`;
};

for (const page of pages) await writeFile(`dist/${page.slug}.html`, pageHtml(page));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const existing = new Set([...sitemap.matchAll(/<loc>https:\/\/www\.catcholiday\.com\/([^<]*)<\/loc>/g)].map((match) => match[1]));
const urls = pages.filter((page) => !existing.has(page.slug)).map((page) => `  <url><loc>https://www.catcholiday.com/${page.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n');
await writeFile('dist/sitemap.xml', sitemap.replace('</urlset>', `${urls ? `${urls}\n` : ''}</urlset>`));
