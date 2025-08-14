#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', '..', 'dist');

const requiredTypes = ['Organization', 'WebSite', 'BreadcrumbList'];

async function main(){
  const files = (await fs.readdir(distDir)).filter(f=>f.endsWith('.html'));
  let failed = false;
  for (const f of files) {
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    const $ = cheerio.load(html);
    const blocks = $('script[type="application/ld+json"]').toArray().map(s=>{
      try{ return JSON.parse($(s).text()); } catch{ return null; }
    }).filter(Boolean);

    const hay = JSON.stringify(blocks);
    for (const t of requiredTypes) {
      if (!hay.includes(`"@type":"${t}"`)) {
        console.error(`[schema] ${f}: missing ${t}`);
        failed = true;
      }
    }
  }
  if (failed) process.exit(1);
  console.log('Structured data presence validated');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

