#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';
import globby from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

function friendlyAltFromSrc(src){
  const base = path.basename(src, path.extname(src));
  return base.replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
}

async function main() {
  const files = await globby([`${distDir}/*.html`]);
  for (const f of files) {
    const html = await fs.readFile(f, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    $('img').each((_, img) => {
      const $img = $(img);
      if ($img.attr('alt') === undefined) {
        const src = $img.attr('src') || '';
        const alt = src ? friendlyAltFromSrc(src) : '';
        $img.attr('alt', alt);
      }
    });
    await fs.writeFile(f, $.html(), 'utf8');
  }
  console.log('Ensured alt attributes on images');
}

main().catch((e) => { console.error(e); process.exit(1); });

