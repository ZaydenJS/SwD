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
  const titles = new Map();
  const descs = new Map();
  let failed = false;

  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const t = ($('title').text() || '').trim();
    const d = ($('meta[name="description"]').attr('content') || '').trim();

    if (t) {
      if (titles.has(t)) { console.error(`Duplicate title: '${t}' in ${titles.get(t)} and ${f}`); failed = true; }
      else titles.set(t, f);
    }
    if (d) {
      if (descs.has(d)) { console.error(`Duplicate description in ${descs.get(d)} and ${f}`); failed = true; }
      else descs.set(d, f);
    }
  }

  if (failed) process.exit(1);
  console.log('No duplicate titles or descriptions');
}

main().catch((e) => { console.error(e); process.exit(1); });

