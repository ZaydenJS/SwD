#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import globby from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main() {
  const imagePaths = await globby([
    'dist/**/*.{png,jpg,jpeg}',
    '!dist/**/favicon.*',
  ], { cwd: projectRoot });

  await Promise.all(imagePaths.map(async (rel) => {
    const imgPath = path.join(projectRoot, rel);
    const dir = path.dirname(imgPath);
    const base = path.basename(imgPath, path.extname(imgPath));

    // Generate WebP
    await sharp(imgPath).webp({ quality: 82 }).toFile(path.join(dir, base + '.webp'));
    // Generate AVIF
    await sharp(imgPath).avif({ quality: 50 }).toFile(path.join(dir, base + '.avif'));
  }));

  console.log('Image optimization complete (WebP/AVIF variants)');
}

main().catch((e) => { console.error(e); process.exit(1); });

