#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { generate } from 'critical';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main() {
  const pages = [
    { in: path.join(distDir, 'index.html'), out: path.join(distDir, 'index.html') },
    { in: path.join(distDir, 'about.html'), out: path.join(distDir, 'about.html') },
    { in: path.join(distDir, 'services.html'), out: path.join(distDir, 'services.html') },
    { in: path.join(distDir, 'portfolio.html'), out: path.join(distDir, 'portfolio.html') },
    { in: path.join(distDir, 'contact.html'), out: path.join(distDir, 'contact.html') },
  ];

  for (const p of pages) {
    try {
      await generate({
        base: distDir,
        src: p.in,
        target: p.out,
        inline: true,
        minify: true,
        width: 390,
        height: 844,
        rebase: ({ url }) => url,
      });
      console.log('Inlined critical CSS for', path.basename(p.out));
    } catch (e) {
      console.warn('Critical CSS error for', path.basename(p.out), e.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

