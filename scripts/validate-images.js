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
    $('img').each((_, img) => {
      const $img = $(img);
      const src = $img.attr('src') || '';
      if (!src) { console.error(`[img] ${f}: img without src`); failed = true; }
      if (!$img.attr('alt')) { console.error(`[img] ${f}: missing alt for ${src}`); failed = true; }
      if (!$img.attr('width') || !$img.attr('height')) { console.error(`[img] ${f}: missing dimensions for ${src}`); failed = true; }
      if (!$img.attr('loading')) { console.error(`[img] ${f}: missing loading attribute for ${src}`); failed = true; }
    });
  }
  if (failed) process.exit(1);
  console.log('Images validated');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

