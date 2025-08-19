#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

async function main(){
  const files = (await fs.readdir(distDir)).filter(f=>f.endsWith('.html'));
  let failed = false;
  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    $('link[rel="preload"]').each((_, el) => {
      const as = ($(el).attr('as') || '').toLowerCase();
      const href = $(el).attr('href') || '';
      if (!as || !href) { console.error(`[preload] ${f}: missing as/href`); failed = true; }
      if (as === 'style' && !href.endsWith('.css')) { console.error(`[preload] ${f}: as=style but not css`); failed = true; }
      if (as === 'script' && !href.endsWith('.js')) { console.error(`[preload] ${f}: as=script but not js`); failed = true; }
      if (as === 'image' && !/\.(png|jpe?g|webp|avif|svg)$/i.test(href)) { console.error(`[preload] ${f}: as=image but not image`); failed = true; }
    });
  }
  if (failed) process.exit(1);
  console.log('Preloads validated');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

