#!/usr/bin/env node
import fetch from 'node-fetch';

const ORIGIN = process.env.ORIGIN || 'https://goswd.com';
const PAGES = ['/', '/about', '/services', '/portfolio', '/contact'];

async function main() {
  let hadError = false;
  for (const p of PAGES) {
    const res = await fetch(ORIGIN + p, { method: 'HEAD' });
    const h = Object.fromEntries(res.headers);
    const required = {
      'strict-transport-security': /max-age=31536000/,
      'x-content-type-options': /^nosniff$/i,
      'referrer-policy': /(strict-origin-when-cross-origin|no-referrer)/i,
    };
    for (const [k, v] of Object.entries(required)) {
      if (!h[k] || !v.test(h[k])) {
        console.error(`[headers] ${ORIGIN + p} missing ${k}`);
        hadError = true;
      }
    }
  }
  if (hadError) process.exit(1);
  console.log('Headers check passed');
}

main().catch((e) => { console.error(e); process.exit(1); });

