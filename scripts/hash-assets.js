#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

function hashFileSync(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
}

async function main() {
  const cssPath = path.join(distDir, 'styles.css');
  const jsPath = path.join(distDir, 'script.js');
  const haveCss = await fs.pathExists(cssPath);
  const haveJs = await fs.pathExists(jsPath);

  let cssNew = null, jsNew = null;
  if (haveCss) {
    const h = hashFileSync(cssPath);
    cssNew = `styles.${h}.css`;
    await fs.copy(cssPath, path.join(distDir, cssNew));
  }
  if (haveJs) {
    const h = hashFileSync(jsPath);
    jsNew = `script.${h}.js`;
    await fs.copy(jsPath, path.join(distDir, jsNew));
  }

  // Rewrite HTML references
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith('.html'));
  for (const f of files) {
    const p = path.join(distDir, f);
    const $ = cheerio.load(await fs.readFile(p, 'utf8'));
    if (cssNew) {
      $('link[rel="stylesheet"][href$="styles.css"]').attr('href', `/${cssNew}`);
      // Update any preload reference as well
      $(`link[rel='preload'][as='style'][href='/styles.css']`).attr('href', `/${cssNew}`);
    }
    if (jsNew) {
      $(`script[src$='script.js']`).attr('src', `/${jsNew}`);
    }
    await fs.writeFile(p, $.html(), 'utf8');
  }

  // Optionally remove un-hashed originals later to force cache-bust
  console.log('Hashed assets:', { css: cssNew, js: jsNew });
}

main().catch((e) => { console.error(e); process.exit(1); });

