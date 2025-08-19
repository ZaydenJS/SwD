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

function hostFromUrl(u){
  try { return new URL(u, 'https://example.com').host || ''; } catch { return ''; }
}

async function main(){
  const files = await globby([`${distDir}/*.html`]);
  for (const f of files) {
    const html = await fs.readFile(f, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });

    $('iframe').each((_, el) => {
      const $el = $(el);
      if (!$el.attr('loading')) $el.attr('loading', 'lazy');
      if (!$el.attr('referrerpolicy')) $el.attr('referrerpolicy', 'no-referrer-when-downgrade');
      if (!$el.attr('title')) {
        const src = $el.attr('src') || '';
        const host = hostFromUrl(src);
        if (host) $el.attr('title', `Embedded content from ${host}`);
      }
    });

    await fs.writeFile(f, $.html(), 'utf8');
  }
  console.log('Transformed iframes: loading=lazy, referrerpolicy set, title fallback');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

