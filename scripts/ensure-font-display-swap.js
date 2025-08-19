#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main(){
  const cssPath = path.join(distDir, 'styles.css');
  if (!(await fs.pathExists(cssPath))) { console.log('No styles.css; skipping font-display swap'); return; }
  let css = await fs.readFile(cssPath, 'utf8');
  // Add font-display: swap to every @font-face block that lacks it
  css = css.replace(/@font-face\s*\{[^}]*\}/g, (block) => {
    if (/font-display\s*:\s*\w+/i.test(block)) return block; // already present
    return block.replace(/\}$/,'  font-display: swap;\n}');
  });
  await fs.writeFile(cssPath, css, 'utf8');
  console.log('Ensured font-display: swap in @font-face');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

