#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main() {
  await fs.ensureDir(distDir);
  const logo = path.join(distDir, 'logo.png');
  const hasLogo = await fs.pathExists(logo);
  if (!hasLogo) {
    console.warn('logo.png not found in dist; skipping icon generation');
    return;
  }

  await sharp(logo).resize(180, 180).png().toFile(path.join(distDir, 'apple-touch-icon.png'));
  await sharp(logo).resize(32, 32).png().toFile(path.join(distDir, 'favicon-32x32.png'));
  await sharp(logo).resize(16, 16).png().toFile(path.join(distDir, 'favicon-16x16.png'));

  const manifest = {
    name: "SwD - Sharpy's Web Designs",
    short_name: 'SwD',
    icons: [
      { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    theme_color: '#0B0E13',
    background_color: '#0B0E13',
    display: 'standalone'
  };
  await fs.writeFile(path.join(distDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Generated icons and manifest');
}

main().catch((e) => { console.error(e); process.exit(1); });

