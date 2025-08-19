#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main(){
  const cssPath = path.join(distDir, 'styles.css');
  if (!(await fs.pathExists(cssPath))) { console.log('No styles.css; skipping font preload'); return; }
  const css = await fs.readFile(cssPath, 'utf8');
  const fontUrls = Array.from(css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)).map(m=>m[1]);
  if (fontUrls.length === 0) { console.log('No Google font URLs found'); return; }
  const files = (await fs.readdir(distDir)).filter(f=>f.endsWith('.html'));
  for (const f of files) {
    const p = path.join(distDir, f);
    const $ = cheerio.load(await fs.readFile(p, 'utf8'));
    for (const u of fontUrls) {
      const exists = $(`link[rel='preload'][as='font'][href='${u}']`).length > 0;
      if (!exists) {
        $('head').append(`<link rel="preload" as="font" href="${u}" type="font/woff2" crossorigin>`);
      }
    }
    await fs.writeFile(p, $.html(), 'utf8');
  }
  console.log('Preloaded Google font files found in CSS');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

