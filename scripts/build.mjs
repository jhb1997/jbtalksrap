import { writeFile, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '../content/reviews.mjs';
import { OUT, ASSETS } from './lib/paths.mjs';
import { COVER_W } from './lib/util.mjs';
import { loadReviews } from './lib/content.mjs';
import { buildImages } from './lib/images.mjs';
import { buildAssets } from './lib/assets.mjs';
import { makeLayout } from './lib/layout.mjs';
import { homePage } from './lib/home.mjs';
import { reviewPages } from './lib/review.mjs';
import { notFoundPage } from './lib/not-found.mjs';

const { L, byScore, featured } = await loadReviews();
const { artSize, artSets } = await buildImages(L);
const { code, css } = await buildAssets();
const ctx = { L, byScore, featured, artSize, artSets, code, layout: makeLayout(css) };

const pages = new Map([['index.html', homePage(ctx)], ['404.html', notFoundPage(ctx)], ...reviewPages(ctx)]);
for (const f of await readdir(OUT)) if (f.endsWith('.html') && !pages.has(f)) await rm(path.join(OUT, f));
for (const [f, html] of pages) await writeFile(path.join(OUT, f), html);

await writeFile(
  path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`,
);
const sitemapUrls = ['', ...L.map(l => l.url)]
  .map(u => `  <url><loc>${SITE.origin}/${u}</loc></url>`)
  .join('\n');
await writeFile(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`,
);
const keepArt = new Set(
  Object.entries(artSets).flatMap(([n, set]) => [
    n + '.webp',
    ...set.split(', ').map(s => path.basename(s.split(' ')[0])),
  ]),
);
for (const f of await readdir(path.join(ASSETS, 'img/art')))
  if (!keepArt.has(f)) await rm(path.join(ASSETS, 'img/art', f));
const keepImg = new Set(L.flatMap(l => COVER_W.map(w => `${l.slug}-${w}.webp`)));
for (const f of await readdir(path.join(ASSETS, 'img/covers')))
  if (!keepImg.has(f)) await rm(path.join(ASSETS, 'img/covers', f));

async function du(dir) {
  let t = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    t += e.isDirectory() ? await du(p) : (await stat(p)).size;
  }
  return t;
}
const total = await du(OUT);
console.log(`built ${pages.size} pages into site/ · ${(total / 1048576).toFixed(2)} MiB total`);
