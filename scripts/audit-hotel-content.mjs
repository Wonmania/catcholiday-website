import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('content/seo-publishing-manifest.json', 'utf8'));
const pages = Object.entries(manifest)
  .filter(([key, batch]) => key.startsWith('batch') && batch?.status === 'published')
  .flatMap(([, batch]) => batch.pages)
  .filter((page) => page.status === 'published')
  .slice(-90);

const failures = [];
const wordCounts = [];
for (const page of pages) {
  const html = await readFile(`dist/${page.slug}.html`, 'utf8');
  const plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = (plain.match(/[A-Za-zÇĞİÖŞÜçğıöşü]+/g) || []).length;
  wordCounts.push(words);
  const checks = {
    singleH1: (html.match(/<h1>/g) || []).length === 1,
    h2: (html.match(/<h2>/g) || []).length >= 6,
    h3: (html.match(/<h3>/g) || []).length >= 6,
    h4: (html.match(/<h4>/g) || []).length >= 3,
    canonical: html.includes(`rel="canonical" href="https://www.catcholiday.com/${page.slug}"`),
    articleSchema: html.includes('application/ld+json'),
    updated: html.includes('Son güncelleme:'),
    related: html.includes('hotel-related'),
    wordDepth: words >= 850
  };
  if (Object.values(checks).some((value) => !value)) failures.push({ slug: page.slug, words, checks });
}

const result = {
  tested: pages.length,
  minWords: Math.min(...wordCounts),
  maxWords: Math.max(...wordCounts),
  averageWords: Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length),
  failureCount: failures.length,
  failures: failures.slice(0, 10)
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
