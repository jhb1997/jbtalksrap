import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FEATURED, REVIEWS, tier } from '../../content/reviews.mjs';
import { CONTENT } from './paths.mjs';
import { fail, fmtDate, pageOf } from './util.mjs';

export async function loadReviews() {
  const manifest = JSON.parse(await readFile(path.join(CONTENT, 'manifest.json'), 'utf8'));
  if (manifest.length !== REVIEWS.length)
    fail(`manifest has ${manifest.length} reviews, reviews.mjs has ${REVIEWS.length}`);
  const L = [];
  for (const r of REVIEWS) {
    const m = manifest.find(x => x.slug === r.slug);
    if (!m) fail(`no manifest entry for ${r.slug}`);
    const md = (await readFile(path.join(CONTENT, 'reviews', r.slug + '.md'), 'utf8')).replace(/\r/g, '');
    const lines = md.split('\n');
    const heading = lines[0].replace(/^#\s*/, '').trim();
    if (heading !== m.title)
      console.warn(
        `note: ${r.slug}: heading "${heading}" differs from manifest title "${m.title}" (using manifest)`,
      );
    const paras = lines
      .slice(1)
      .map(s => s.trim())
      .filter(Boolean);
    if (!/^\d+\.\d$/.test(r.score)) fail(`score for ${r.album} must look like 7.0`);
    const first = (paras[0].match(/^.+?[.!?](?=\s|$)/) || [paras[0]])[0];
    L.push({
      ...r,
      title: m.title,
      iso: m.date,
      date: fmtDate(m.date),
      paras,
      description: r.summary || first,
      tier: tier(r.score),

      page: pageOf(r.album),
      url: pageOf(r.album) + '.html',
    });
  }
  L.sort((a, b) => a.n.localeCompare(b.n));
  const byScore = [...L].sort((a, b) => +b.score - +a.score || a.album.localeCompare(b.album));
  const featured = L.find(l => l.n === FEATURED) || fail('featured pad not found');
  return { L, byScore, featured };
}
