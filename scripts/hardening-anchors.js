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

async function main() {
  const files = await globby([`${distDir}/*.html`]);
  for (const f of files) {
    const html = await fs.readFile(f, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });

    $('a[target="_blank"]').each((_, a) => {
      const $a = $(a);
      const rel = ($a.attr('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      $a.attr('rel', rel.join(' '));
    });

    await fs.writeFile(f, $.html(), 'utf8');
  }
  console.log('Hardened external anchors with rel=noopener noreferrer');
}

main().catch((e) => { console.error(e); process.exit(1); });

