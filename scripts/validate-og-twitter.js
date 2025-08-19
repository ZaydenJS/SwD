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
  let failed = false;
  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const errs = [];
    if ($('meta[property="og:title"]').length === 0) errs.push('missing og:title');
    if ($('meta[property="og:description"]').length === 0) errs.push('missing og:description');
    if ($('meta[property="og:url"]').length === 0) errs.push('missing og:url');
    if ($('meta[property="og:image"]').length === 0) errs.push('missing og:image');
    if ($('meta[name="twitter:card"]').length === 0) errs.push('missing twitter:card');
    if ($('meta[name="twitter:title"]').length === 0) errs.push('missing twitter:title');
    if ($('meta[name="twitter:description"]').length === 0) errs.push('missing twitter:description');
    if ($('meta[name="twitter:image"]').length === 0) errs.push('missing twitter:image');
    if (errs.length) { console.error(`[og/twitter] ${f}: ${errs.join(', ')}`); failed = true; }
  }
  if (failed) process.exit(1);
  console.log('OG/Twitter validation passed');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

