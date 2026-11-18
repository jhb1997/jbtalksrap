import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FEATURED, LOTS, tier } from '../../content/site.mjs';
import { CONTENT } from './paths.mjs';
import { fail, fmtDate, pageOf } from './util.mjs';

export async function loadReviews() {
  const manifest = JSON.parse(await readFile(path.join(CONTENT, 'manifest.json'), 'utf8'));
  if (manifest.length !== LOTS.length)
    fail(`manifest has ${manifest.length} reviews, data.mjs has ${LOTS.length}`);
  const L = [];
  for (const lot of LOTS) {
    const m = manifest.find(x => x.slug === lot.slug);
    if (!m) fail(`no manifest entry for ${lot.slug}`);
    const md = (await readFile(path.join(CONTENT, 'reviews', lot.slug + '.md'), 'utf8')).replace(/\r/g, '');
    const lines = md.split('\n');
    const heading = lines[0].replace(/^#\s*/, '').trim();
    if (heading !== m.title)
      console.warn(
        `note: ${lot.slug}: heading "${heading}" differs from manifest title "${m.title}" (using manifest)`,
      );
    const paras = lines
      .slice(1)
      .map(s => s.trim())
      .filter(Boolean);
    const text = paras.join('\n');
    if (!text.includes(lot.quote))
      fail(`quote for ${lot.album} is not verbatim in the review: "${lot.quote}"`);
    if (!/^\d+\.\d$/.test(lot.score)) fail(`score for ${lot.album} must look like 7.0`);
    const first = (paras[0].match(/^.+?[.!?](?=\s|$)/) || [paras[0]])[0];
    L.push({
      ...lot,
      title: m.title,
      iso: m.date,
      date: fmtDate(m.date),
      paras,
      description: lot.summary || first,
      tier: tier(lot.score),

      page: pageOf(lot.album),
      url: pageOf(lot.album) + '.html',
    });
  }
  L.sort((a, b) => a.n.localeCompare(b.n));
  const byScore = [...L].sort((a, b) => +b.score - +a.score || a.album.localeCompare(b.album));
  const featured = L.find(l => l.n === FEATURED) || fail('featured pad not found');
  return { L, byScore, featured };
}
