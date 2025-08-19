#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');
const ORIGIN = process.env.ORIGIN || 'https://goswd.com';
const TRAILING = process.env.TRAILING || 'never';

function slugForFile(file) {
  const base = file.replace(/\.html$/, '');
  return base === 'index' ? '' : base;
}

function expectedCanonical(slug) {
  const pathPart = slug ? `/${slug}` : '/';
  return ORIGIN + (TRAILING === 'always' && pathPart !== '/' ? `${pathPart}/` : pathPart);
}

async function main() {
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith('.html'));
  let failed = false;
  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const can = $('link[rel="canonical"]').attr('href') || '';
    const exp = expectedCanonical(slugForFile(f));
    if (!can) { console.error(`[canonical] ${f}: missing canonical`); failed = true; continue; }
    if (!can.startsWith('http')) { console.error(`[canonical] ${f}: canonical must be absolute`); failed = true; }
    if (can !== exp) { console.error(`[canonical] ${f}: canonical mismatch -> ${can} != ${exp}`); failed = true; }
  }
  if (failed) process.exit(1);
  console.log('Canonical validation passed');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

