#!/usr/bin/env node
import fetch from 'node-fetch';

const ORIGIN = process.env.ORIGIN || 'https://goswd.com';
const PAGES = ['/', '/about', '/services', '/portfolio', '/contact'];

async function main(){
  let bad = false;
  for (const p of PAGES) {
    const res = await fetch(ORIGIN + p, { method: 'HEAD' });
    const csp = res.headers.get('content-security-policy') || '';
    if (!csp.includes("default-src 'self'")) { console.error(`[csp] ${p}: default-src missing 'self'`); bad = true; }
    if (!/img-src[^;]+https:/i.test(csp)) { console.error(`[csp] ${p}: img-src should allow https`); bad = true; }
    if (!/style-src[^;]+fonts\.googleapis\.com/i.test(csp)) { console.error(`[csp] ${p}: style-src missing fonts.googleapis.com`); bad = true; }
    if (!/font-src[^;]+fonts\.gstatic\.com/i.test(csp)) { console.error(`[csp] ${p}: font-src missing fonts.gstatic.com`); bad = true; }
  }
  if (bad) process.exit(1);
  console.log('CSP validated');
}

main().catch((e)=>{ console.error(e); process.exit(1); });

