#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

function lengthInRange(str, min, max) {
  return str && str.length >= min && str.length <= max;
}

async function main() {
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith('.html'));
  let failed = false;
  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const errs = [];

    // Core tags
    const title = $('title').text().trim();
    if (!lengthInRange(title, 10, 60)) errs.push('Title length out of range (10-60)');
    const desc = $('meta[name="description"]').attr('content') || '';
    if (!lengthInRange(desc, 50, 160)) errs.push('Meta description length out of range (50-160)');

    // Canonical
    const can = $('link[rel="canonical"]').attr('href');
    if (!can) errs.push('Missing canonical');

    // Open Graph/Twitter
    if ($('meta[property="og:type"]').length === 0) errs.push('Missing og:type');
    if ($('meta[name="twitter:card"]').length === 0) errs.push('Missing twitter:card');

    // Lang/viewport
    if (!$('html').attr('lang')) errs.push('Missing html[lang]');
    if ($('meta[name="viewport"]').length === 0) errs.push('Missing viewport');

    // Icons/manifest
    if ($('link[rel="icon"]').length === 0 && $('link[rel="icon"][type="image/svg+xml"]').length === 0) errs.push('Missing favicon');
    if ($('link[rel="apple-touch-icon"]').length === 0) errs.push('Missing apple-touch-icon');
    if ($('link[rel="manifest"]').length === 0) errs.push('Missing manifest');

    // JSON-LD presence
    if ($('script[type="application/ld+json"]').length === 0) errs.push('Missing JSON-LD');

    if (errs.length) {
      failed = true;
      console.error(`[seo] ${f}: ${errs.join('; ')}`);
    }
  }
  if (failed) process.exit(1);
  console.log('Extended SEO validation passed');
}

main().catch((e) => { console.error(e); process.exit(1); });

