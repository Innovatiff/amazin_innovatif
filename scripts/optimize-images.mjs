#!/usr/bin/env node
/**
 * Turn full-size source images into the web-ready WebP files the site uses.
 *
 *   npm run images -- <source-folder> <section>
 *
 * Example: you have new product photos in ~/Downloads/new-prints and want them
 * on the printing page:
 *
 *   npm run images -- ~/Downloads/new-prints print
 *
 * For each source image (png / jpg / webp) this writes
 *   src/assets/img/<section>/<name>-640.webp
 *   src/assets/img/<section>/<name>-1280.webp
 * and, with --hero, an extra <name>-1920.webp for full-width banners.
 * Reference the image in the data files by "<section>/<name>".
 */
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hero = args.includes('--hero');
const [sourceDir, section] = args.filter((a) => !a.startsWith('--'));

if (!sourceDir || !section) {
  console.error('Usage: npm run images -- <source-folder> <section> [--hero]');
  process.exit(1);
}

const outDir = path.join(root, 'src', 'assets', 'img', section);
await mkdir(outDir, { recursive: true });

const widths = hero ? [640, 1280, 1920] : [640, 1280];
const files = (await readdir(sourceDir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();

if (!files.length) {
  console.error(`No images found in ${sourceDir}`);
  process.exit(1);
}

for (const file of files) {
  const name = path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  for (const width of widths) {
    const out = path.join(outDir, `${name}-${width}.webp`);
    const info = await sharp(path.join(sourceDir, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width <= 640 ? 76 : 78, effort: 6 })
      .toFile(out);
    console.log(`${section}/${name}-${width}.webp  ${(info.size / 1024).toFixed(0)} KB`);
  }
}
