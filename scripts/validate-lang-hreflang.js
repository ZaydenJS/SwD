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
    const lang = $('html').attr('lang');
    if (!lang) { console.error(`[lang] ${f}: missing html[lang]`); failed = true; }

    const alts = new Map();
    $(`link[rel='alternate'][hreflang]`).each((_, el)=>{
      alts.set($(el).attr('hreflang'), $(el).attr('href'));
    });
    if (!alts.has('en-au')) { console.error(`[hreflang] ${f}: missing en-au`); failed = true; }
    if (!alts.has('x-default')) { console.error(`[hreflang] ${f}: missing x-default`); failed = true; }
  }
  if (failed) process.exit(1);
  console.log('Lang + hreflang validated');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

