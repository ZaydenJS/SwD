#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import globby from 'globby';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

const TARGET_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536];

async function processImage(absPath, relPath) {
  const img = sharp(absPath);
  const meta = await img.metadata();
  const width = meta.width || 0;
  const base = path.basename(relPath, path.extname(relPath));
  const dir = path.dirname(absPath);
  const publicDir = path.posix.dirname('/' + relPath.replace(/\\/g, '/'));

  const widths = TARGET_WIDTHS.filter((w) => w < width && w >= 320);
  const variants = { avif: [], webp: [] };

  for (const w of widths) {
    const avifName = `${base}-w${w}.avif`;
    const webpName = `${base}-w${w}.webp`;
    await img.resize({ width: w }).avif({ quality: 50 }).toFile(path.join(dir, avifName));
    await img.resize({ width: w }).webp({ quality: 82 }).toFile(path.join(dir, webpName));
    variants.avif.push({ w, src: path.posix.join(publicDir, avifName) });
    variants.webp.push({ w, src: path.posix.join(publicDir, webpName) });
  }

  return {
    width,
    height: meta.height || 0,
    original: path.posix.join(publicDir, path.basename(relPath)),
    variants,
  };
}

async function main() {
  const files = await globby(['dist/**/*.{jpg,jpeg,png}'], { cwd: projectRoot });
  const manifest = {};
  for (const rel of files) {
    const abs = path.join(projectRoot, rel);
    const entry = await processImage(abs, rel.replace(/^dist\/?/, ''));
    manifest['/' + rel.replace(/^dist\/?/, '')] = entry;
  }
  await fs.writeJson(path.join(distDir, 'images-manifest.json'), manifest, { spaces: 2 });
  console.log('Generated responsive images and manifest');
}

main().catch((e) => { console.error(e); process.exit(1); });

