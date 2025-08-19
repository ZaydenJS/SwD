#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

function validateJsonLd(obj) {
  const errors = [];
  if (!obj['@context']) errors.push('Missing @context');
  if (!obj['@graph']) errors.push('Missing @graph');
  if (Array.isArray(obj['@graph'])) {
    const types = obj['@graph'].map((n) => n['@type']);
    if (!types.includes('Organization')) errors.push('Missing Organization type');
    if (!types.includes('WebSite')) errors.push('Missing WebSite type');
    if (!types.includes('BreadcrumbList')) errors.push('Missing BreadcrumbList type');
    if (!types.includes('LocalBusiness')) errors.push('Missing LocalBusiness type');
  }
  return errors;
}

async function main() {
  const htmlFiles = (await fs.readdir(distDir)).filter((f) => f.endsWith('.html'));
  let hadError = false;
  for (const f of htmlFiles) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const blocks = $('script[type="application/ld+json"]').toArray();
    if (blocks.length === 0) {
      console.error(`[schema] ${f}: No JSON-LD found`);
      hadError = true;
      continue;
    }
    for (const b of blocks) {
      try {
        const json = JSON.parse($(b).text());
        const errs = validateJsonLd(json);
        if (errs.length) {
          hadError = true;
          console.error(`[schema] ${f}: ${errs.join(', ')}`);
        }
      } catch (e) {
        console.error(`[schema] ${f}: Invalid JSON-LD`);
        hadError = true;
      }
    }
  }
  if (hadError) process.exit(1);
  console.log('Schema validation passed');
}

main().catch((e) => { console.error(e); process.exit(1); });

