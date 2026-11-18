import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const OUT = path.join(ROOT, 'site');
export const A = path.join(OUT, 'assets');
export const SRC = path.join(ROOT, 'src');
export const CONTENT = path.join(ROOT, 'content');
export const MEDIA = path.join(ROOT, 'media');
