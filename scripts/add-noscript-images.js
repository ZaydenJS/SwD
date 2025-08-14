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

    $('img').each((_, img) => {
      const $img = $(img);
      // If a noscript sibling already exists, skip
      const next = $img.next();
      if (next && next[0] && next[0].name === 'noscript') return;

      // Build a plain <img> clone without lazy/decoding/fetchpriority (noscript)
      const attrs = { ...$img.attr() };
      delete attrs.loading; delete attrs.decoding; delete attrs.fetchpriority;
      const attrStr = Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
      const ns = `<noscript><img ${attrStr}></noscript>`;
      $img.after(ns);
    });

    await fs.writeFile(f, $.html(), 'utf8');
  }
  console.log('Added <noscript> fallbacks for images');
}

main().catch((e) => { console.error(e); process.exit(1); });

