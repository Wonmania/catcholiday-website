import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'hakkimizda.html', 'iletisim.html', 'gizlilik-kvkk.html',
  'kullanim-kosullari.html', 'affiliate-aciklamasi.html', 'styles.css', 'script.js',
  'favicon.png', 'robots.txt', 'sitemap.xml', 'netlify.toml']) {
  await cp(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
await cp('bodrum', 'dist/bodrum', { recursive: true });
await cp('bodrum/en-iyi-restoranlar.html', 'dist/bodrumun-en-iyi-10-restorani.html');
const manifest = JSON.parse(await readFile('content/seo-publishing-manifest.json', 'utf8'));
const publishedGuides = Object.entries(manifest)
  .filter(([key, batch]) => key.startsWith('batch') && batch?.status === 'published')
  .flatMap(([, batch]) => batch.pages)
  .filter((page) => page.status === 'published');
const guides = [
  { title: "Bodrum'un En İyi 10 Restoranı", slug: 'bodrumun-en-iyi-10-restorani', name: 'Bodrum', parent: 'Muğla', image: '/assets/bodrum-guide-hero-v1.jpg' },
  ...publishedGuides.map((page, index) => ({ ...page, image: page.coverImage || ['/assets/bodrum.png', '/assets/antalya-hero.png', '/assets/kapadokya.png', '/assets/bodrum-guide-hero-v1.jpg'][index % 4] }))
];
const guideCard = (guide, index) => `<a class="travel-guide-card" href="/${guide.slug}" aria-label="${guide.title}"><img src="${guide.image}" alt="${guide.name} tatil rehberi" loading="lazy" decoding="async" width="480" height="300"><span class="travel-guide-shade"></span><span class="travel-guide-number">${String(index + 1).padStart(2, '0')}</span><span class="travel-guide-copy"><small>${guide.parent || 'Tatil Rehberi'}</small><strong>${guide.title}</strong><em>Rehberi aç <b>→</b></em></span></a>`;
const visibleGuides = guides.slice(0, 8).map(guideCard).join('');
const moreGuides = guides.slice(8).map((guide, index) => guideCard(guide, index + 8)).join('');
const guideSection = `<section class="section travel-guides-section" id="tatil-rehberi"><div class="container"><div class="section-heading split travel-guides-heading"><div><span class="kicker">CATCHOLIDAY SEÇKİSİ</span><h2>Tatil Rehberi</h2></div><p>Türkiye'nin en sevilen tatil bölgelerini keşfet; nerede kalacağını, öne çıkan otelleri ve lezzet duraklarını tek yerde incele.</p></div><div class="travel-guide-grid">${visibleGuides}</div>${moreGuides ? `<details class="travel-guide-more"><summary><span>Tüm tatil rehberlerini göster</span><small>${guides.length} içerik</small></summary><div class="travel-guide-grid travel-guide-grid-more">${moreGuides}</div></details>` : ''}</div></section>`;
const indexPath = 'dist/index.html';
const indexHtml = await readFile(indexPath, 'utf8');
await writeFile(indexPath, indexHtml.replace(/<!-- TRAVEL_GUIDES_START -->[\s\S]*?<!-- TRAVEL_GUIDES_END -->/, `<!-- TRAVEL_GUIDES_START -->\n${guideSection}\n<!-- TRAVEL_GUIDES_END -->`));
await import('./scripts/generate-hotel-pages.mjs');
