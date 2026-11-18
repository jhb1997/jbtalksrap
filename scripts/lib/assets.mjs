import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { transform } from 'esbuild';
import { A, ROOT, SRC } from './paths.mjs';
import { hash } from './util.mjs';

const SHEETS = {
  'home.css': ['home-slab', 'home-machine', 'home-archive', 'home-narrow'],
  'review.css': ['review'],
  'lost.css': ['lost'],
};

export async function buildAssets() {
  const NM = path.join(ROOT, 'node_modules');
  const FONTS = {
    'anybody.woff2': '@fontsource-variable/anybody/files/anybody-latin-standard-normal.woff2',
    'newsreader.woff2': '@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2',
    'plex-mono-400.woff2': '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
    'plex-mono-500.woff2': '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
    'plex-mono-600.woff2': '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2',
    'tag.woff2': '@fontsource/sedgwick-ave-display/files/sedgwick-ave-display-latin-400-normal.woff2',
    'newsreader-italic.woff2': '@fontsource-variable/newsreader/files/newsreader-latin-standard-italic.woff2',
  };
  for (const [to, from] of Object.entries(FONTS))
    await copyFile(path.join(NM, from), path.join(A, 'fonts', to));
  await writeFile(
    path.join(A, 'img/wear.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 3.2 -1.95"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  );
  await writeFile(
    path.join(A, 'img/spray-grain.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="g" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 -2.1"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`,
  );

  const JB_PATH =
    'M30.8 20.57Q30.8 21.23 30.52 21.78Q30.19 22.58 29.6 23.19Q29.01 23.79 28.26 23.88Q26.88 24.07 26.33 24.15Q26.94 25.83 27.19 27.41Q27.52 29.26 27.54 29.83Q27.6 30.61 27.6 31.02Q27.6 31.41 27.54 32.23Q27.38 35.3 26.88 37.09Q26.47 38.58 26.03 39.43Q25.64 40.26 25.31 40.8Q24.98 41.34 24.54 41.75L23.77 42.47L23.24 42.77Q22.91 43.02 22.47 43.02Q22.3 43.08 22.19 43.08Q21.12 43.02 20.21 42.58Q19.49 42.19 18.86 41.68Q18.22 41.17 17.31 40.34L14.36 37.7Q14 37.37 14 36.79Q14 35.99 14.66 34.97Q15.35 33.92 16.15 33.59Q16.37 33.48 16.59 33.48Q16.84 33.48 17.03 33.59L19.19 35.63L19.85 36.23Q20.9 37.2 21.66 37.78Q22.41 38.36 23.3 38.69Q23.35 38.72 23.46 38.72Q23.63 38.33 23.68 38.11Q23.99 37.12 24.26 35.08Q24.4 33.75 24.4 32.68Q24.4 32.04 24.37 31.74L24.32 31.16Q24.15 29.45 23.99 28.57Q23.6 26.74 22.83 25.31Q22.72 25.12 22.72 24.79L22.33 24.84Q19.9 25.45 18.69 25.78Q18.61 25.81 18.51 25.83Q18.41 25.86 18.28 25.86Q17.92 25.86 17.72 25.5Q17.64 25.26 17.64 25.01Q17.64 24.87 17.7 24.59Q17.86 23.71 18.58 22.94Q18.97 22.52 19.46 22.3Q21.23 21.81 22.11 21.53Q22.72 21.34 22.91 21.31Q23.9 21.01 24.51 20.87Q27.3 20.23 30.06 19.71L30.17 19.68Q30.47 19.68 30.62 19.97Q30.77 20.26 30.8 20.57ZM47.05 30.99Q47.05 29.2 44.32 29.2Q43.05 29.2 41.57 29.57Q40.1 29.94 39.24 30.39Q37.75 31.13 37.05 31.83Q36.34 32.54 36.32 33.81Q36.29 35.74 36.21 37.19Q36.12 38.63 35.9 40.04Q39.24 38.8 42.08 36.9Q43.96 35.66 45.12 34.62Q46.28 33.59 46.77 32.23Q47.05 31.57 47.05 30.99ZM36.59 27.6Q36.54 28.15 36.54 28.48L37.72 26.94Q38.72 25.64 39.24 24.91Q39.77 24.18 40.21 23.32Q39.24 23.54 38.5 23.81Q37.75 24.07 37.14 24.48Q36.81 24.73 36.69 24.9Q36.57 25.06 36.57 25.26Q36.57 25.42 36.61 25.7Q36.65 25.97 36.65 26.25Q36.65 26.66 36.59 27.6ZM50 28.92Q50 29.92 49.59 31.24Q48.51 34.63 44.68 38Q41.67 40.57 38 42.44Q36.81 43.08 35.3 43.71Q33.78 44.34 32.7 44.34Q31.88 44.34 31.6 43.85Q31.49 43.66 31.49 43.41Q31.49 43.08 31.66 42.79Q31.82 42.5 32.18 41.97Q32.59 41.42 32.7 41.14Q32.95 40.43 32.95 39.16V38.5Q32.95 38.28 32.94 37.97Q32.92 37.67 32.95 37.31Q33.17 34.33 33.26 32.84Q33.26 32.46 33.28 32.17Q33.31 31.88 33.34 31.66Q33.37 31.38 33.39 30.97Q33.42 30.55 33.42 30Q33.42 29.42 33.34 28.9Q33.23 28.18 33.01 27.82Q32.98 27.74 32.74 27.5Q32.51 27.27 32.48 27.16Q32.46 27.05 32.46 26.86Q32.46 25.94 33.5 24.29Q33.81 23.82 34.11 23.49Q34.41 23.16 34.77 23.02Q34.88 22.97 35.13 22.97Q35.21 22.97 35.37 22.97Q35.52 22.97 35.6 22.94Q35.9 22.83 36.22 22.52Q36.54 22.22 36.59 22.17Q36.9 21.86 37.17 21.67Q38.06 21.03 39.49 20.34Q40.92 19.66 41.94 19.66Q42.94 19.66 43.21 20.46Q43.32 20.76 43.32 21.12Q43.32 22.17 42.61 23.39Q41.89 24.62 40.73 26.14Q40.57 26.39 40.18 26.91Q43.16 25.39 45.81 25.39Q46.52 25.39 47.1 25.5Q48.59 25.75 49.3 26.66Q50 27.57 50 28.92Z';
  const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#333336"/><stop offset="1" stop-color="#202022"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="13" fill="url(#g)"/><rect x="11" y="11" width="42" height="42" rx="7" fill="#e3242b"/><path d="${JB_PATH}" fill="#fff"/></svg>`;
  await writeFile(path.join(A, 'favicon.svg'), fav);
  await sharp(Buffer.from(fav.replace('viewBox="0 0 64 64"', 'viewBox="2 2 60 60" width="180" height="180"')))
    .flatten({ background: '#202022' })
    .png()
    .toFile(path.join(A, 'apple-touch-icon.png'));

  const code = {};
  for (const f of ['site.js', 'home.js', 'review.js']) {
    const s = (
      await transform(await readFile(path.join(SRC, 'js', f), 'utf8'), {
        loader: 'js',
        minifyWhitespace: true,
        minifyIdentifiers: true,
      })
    ).code;
    await writeFile(path.join(A, f), s);
    code[f] = `assets/${f}?v=${hash(s)}`;
  }
  const css = {};
  {
    const read = f => readFile(path.join(SRC, 'css', f + '.css'), 'utf8');
    const site = await read('site');
    for (const [f, parts] of Object.entries(SHEETS)) {
      const own = (await Promise.all(parts.map(read))).join('\n');
      const raw = (site + '\n' + own).replace(
        /url\((['"]?)(?!data:|#|%23|https?:|\/)([^'")]+)\1\)/g,
        'url($1assets/$2$1)',
      );
      css[f] = (await transform(raw, { loader: 'css', minifyWhitespace: true })).code.trim();
    }
  }
  return { code, css };
}
