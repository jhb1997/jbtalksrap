import { stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 8);
const fmtDate = iso =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
const fail = msg => {
  console.error('BUILD FAILED: ' + msg);
  process.exit(1);
};
const newer = async (src, dst) => {
  try {
    return (await stat(src)).mtimeMs > (await stat(dst)).mtimeMs;
  } catch {
    return true;
  }
};
const meter = s => {
  const v = +s;
  return (
    '<span class="meter" aria-hidden="true">' +
    Array.from({ length: 10 }, (_, k) => `<i class="${v >= k + 1 ? 'on' : v > k ? 'half' : ''}"></i>`).join(
      '',
    ) +
    '</span>'
  );
};
const chip = t => `<span class="chip chip--${t.toLowerCase()}">${t}</span>`;

const pageOf = album =>
  album
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-review';
const cover = (slug, w) => `assets/img/covers/${slug}-${w}.webp`;
const COVER_W = [240, 480, 1200];

const coverSet = (slug, ws) => ws.map(w => `${cover(slug, w)} ${w}w`).join(', ');
const KEYS = '1234QWERASDF';
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export { esc, attr, hash, fmtDate, fail, newer, meter, chip, pageOf, cover, COVER_W, coverSet, KEYS, reEsc };
