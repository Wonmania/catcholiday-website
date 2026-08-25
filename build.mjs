import { cp, mkdir, rm } from 'node:fs/promises';

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
