import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ART } from '../../content/reviews.mjs';
import { ASSETS, OUT, MEDIA } from './paths.mjs';
import { newer, cover, COVER_W } from './util.mjs';

export async function buildImages(L) {
  await mkdir(path.join(ASSETS, 'fonts'), { recursive: true });
  await mkdir(path.join(ASSETS, 'img/covers'), { recursive: true });
  await mkdir(path.join(ASSETS, 'img/art'), { recursive: true });
  await mkdir(path.join(ASSETS, 'og'), { recursive: true });
  const imgJobs = [];
  const webp = (src, dst, w, opts = {}) =>
    imgJobs.push(
      (async () => {
        if (!(await newer(src, dst))) return;
        let p = sharp(src).rotate();
        p = opts.square ? p.resize(w, w, { fit: 'cover' }) : p.resize({ width: w, withoutEnlargement: true });
        await p.webp({ quality: opts.q || 80, effort: 6 }).toFile(dst);
      })(),
    );
  for (const l of L)
    for (const w of COVER_W)
      webp(path.join(MEDIA, 'covers', l.slug + '.jpg'), path.join(OUT, cover(l.slug, w)), w, {
        square: true,
        q: w > 500 ? 80 : 78,
      });
  webp(path.join(MEDIA, 'textures/brushed.jpg'), path.join(ASSETS, 'img/brushed.webp'), 1600, { q: 72 });
  webp(path.join(MEDIA, 'textures/brushed.jpg'), path.join(ASSETS, 'img/brushed-phone.webp'), 1000, {
    q: 72,
  });
  webp(path.join(MEDIA, 'textures/pave.jpg'), path.join(ASSETS, 'img/pave.webp'), 300, { q: 80 });
  const artNames = new Set(
    Object.values(ART).flatMap(o =>
      Object.values(o)
        .flat()
        .map(p => p.src),
    ),
  );

  const ART_W = { note: [320, 600], wide: [600, 1200] };
  const artSrc = {},
    artWide = {};
  for (const name of artNames) {
    const wide = Object.values(ART).some(o =>
      Object.values(o)
        .flat()
        .some(p => p.src === name && p.type === 'wide'),
    );
    artWide[name] = wide;
    const src = (artSrc[name] = ['.jpg', '.png']
      .map(e => path.join(MEDIA, 'art', name + e))
      .find(f => existsSync(f)));
    webp(src, path.join(ASSETS, 'img/art', name + '.webp'), wide ? 1800 : 900, { q: 80 });
  }
  await Promise.all(imgJobs);
  imgJobs.length = 0;
  const artSize = {},
    artSets = {};
  for (const name of artNames) {
    const m = await sharp(path.join(ASSETS, 'img/art', name + '.webp')).metadata();
    artSize[name] = [m.width, m.height];
    const ws = ART_W[artWide[name] ? 'wide' : 'note'].filter(w => w < m.width);
    for (const w of ws) webp(artSrc[name], path.join(ASSETS, 'img/art', `${name}-${w}.webp`), w, { q: 80 });
    artSets[name] = [
      ...ws.map(w => `assets/img/art/${name}-${w}.webp ${w}w`),
      `assets/img/art/${name}.webp ${m.width}w`,
    ].join(', ');
  }
  await Promise.all(imgJobs);

  const IVORY = '#f2eee5';
  const padSvg = (s, r) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s + 10}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#333336"/><stop offset="1" stop-color="#202022"/></linearGradient></defs><rect y="10" width="${s}" height="${s}" rx="${r}" fill="#0d0d0e"/><rect width="${s}" height="${s}" rx="${r}" fill="url(#g)"/></svg>`,
    );
  const rounded = async (file, s, r) =>
    sharp(file)
      .resize(s, s, { fit: 'cover' })
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}"/></svg>`,
          ),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
  async function og(dst, slugs) {
    const srcs = slugs.map(s => path.join(MEDIA, 'covers', s + '.jpg'));
    if (!(await Promise.all([...srcs, fileURLToPath(import.meta.url)].map(s => newer(s, dst)))).some(Boolean))
      return;
    const n = slugs.length,
      s = n === 1 ? 500 : 340,
      gap = 40,
      inner = Math.round(s * 0.88),
      off = Math.round((s - inner) / 2);
    const total = n * s + (n - 1) * gap,
      x0 = Math.round((1200 - total) / 2),
      y0 = Math.round((630 - s) / 2) - 5;
    const layers = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (s + gap);
      layers.push(
        { input: padSvg(s, Math.round(s * 0.06)), left: x, top: y0 },
        { input: await rounded(srcs[i], inner, Math.round(s * 0.03)), left: x + off, top: y0 + off },
      );
    }
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: IVORY } })
      .composite(layers)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(dst);
  }
  for (const l of L) await og(path.join(ASSETS, 'og', l.slug + '.jpg'), [l.slug]);

  await copyFile(path.join(MEDIA, 'og-home.jpg'), path.join(ASSETS, 'og', 'home.jpg'));
  {
    const W = 600,
      H = 60,
      px = Buffer.alloc(W * H * 4);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const f = x / W,
          t = Math.min(1, Math.max(0, (f - 0.36) / 0.22)),
          on = t === 0 || rnd() < Math.pow(1 - t, 1.5),
          i = (y * W + x) * 4;
        px[i] = 227;
        px[i + 1] = 36;
        px[i + 2] = 43;
        px[i + 3] = on ? 255 : 0;
      }
    await sharp(px, { raw: { width: W, height: H, channels: 4 } })
      .png()
      .toFile(path.join(ASSETS, 'img/spray-sweep.png'));
  }
  return { artSize, artSets };
}
