#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

async function main() {
  const files = (await fs.readdir(distDir)).filter((f) => f.endsWith('.html'));
  let hadError = false;
  for (const file of files) {
    const html = await fs.readFile(path.join(distDir, file), 'utf8');
    const $ = cheerio.load(html);

    // Required tags
    if ($('title').length !== 1) {
      console.error(`[html] ${file}: missing or multiple <title>`);
      hadError = true;
    }
    if ($('meta[name="description"]').length < 1) {
      console.error(`[html] ${file}: missing meta description`);
      hadError = true;
    }

    // Canonical
    if ($('link[rel="canonical"]').length !== 1) {
      console.error(`[html] ${file}: missing or multiple canonical`);
      hadError = true;
    }
  }
  if (hadError) process.exit(1);
  console.log('HTML validation passed');
}

main().catch((e) => { console.error(e); process.exit(1); });

