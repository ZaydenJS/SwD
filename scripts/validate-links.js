#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

async function main() {
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith('.html'));
  const pages = new Set(files.map(f => '/' + f.replace(/\.html$/,'').replace(/^index$/,'')));
  let failed = false;

  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    $('a[href]').each((_, a) => {
      const href = $(a).attr('href') || '';
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
      const clean = href.replace(/\/$/, '');
      const candidate = clean === '' ? '/' : clean;
      if (!pages.has(candidate)) {
        console.error(`[link] ${f}: internal link not found ${href}`);
        failed = true;
      }
    });
  }
  if (failed) process.exit(1);
  console.log('Internal links validated');
}

main().catch((e) => { console.error(e); process.exit(1); });

