#!/usr/bin/env node
import fetch from 'node-fetch';

const ORIGIN = process.env.ORIGIN || 'https://goswd.com';
const PAGES = ['/', '/about', '/services', '/portfolio', '/contact'];

const REQUIRED = {
  'strict-transport-security': /max-age=31536000/,
  'x-content-type-options': /^nosniff$/i,
  'content-security-policy': /default-src 'self'/,
  'referrer-policy': /(strict-origin-when-cross-origin|no-referrer)/i,
};

async function main() {
  let hadError = false;
  for (const p of PAGES) {
    const res = await fetch(ORIGIN + p, { method: 'HEAD' });
    const h = Object.fromEntries(res.headers);
    for (const [k, regex] of Object.entries(REQUIRED)) {
      if (!h[k] || !regex.test(h[k])) {
        console.error(`[headers] ${ORIGIN + p} missing ${k}`);
        hadError = true;
      }
    }
  }
  if (hadError) process.exit(1);
  console.log('Required headers present and valid');
}

main().catch((e) => { console.error(e); process.exit(1); });

