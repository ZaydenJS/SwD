#!/usr/bin/env node
import puppeteer from 'puppeteer';
import axe from '@axe-core/puppeteer';

const ORIGIN = process.env.ORIGIN || 'http://localhost:8080';
const PAGES = ['/', '/about', '/services', '/portfolio', '/contact'];

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const broken = [];

  for (const p of PAGES) {
    const url = ORIGIN + p;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Check images
    const imgErrors = await page.evaluate(async () => {
      const results = [];
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map(img => new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.addEventListener('error', () => results.push(img.src), { once: true });
        img.addEventListener('load', () => resolve(), { once: true });
        setTimeout(resolve, 3000);
      })));
      return results;
    });
    imgErrors.forEach(src => broken.push({ type: 'image', page: url, src }));

    // Check links (head requests)
    const links = await page.$$eval('a[href]', as => as.map(a => a.href));
    for (const l of links) {
      try {
        const res = await page.goto(l, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!res || res.status() >= 400) broken.push({ type: 'link', page: url, href: l, status: res?.status() });
        await page.goBack({ waitUntil: 'domcontentloaded' });
      } catch (e) {
        broken.push({ type: 'link', page: url, href: l, error: e.message });
      }
    }

    // Accessibility quick scan
    await axe(page).analyze();
  }

  await browser.close();

  if (broken.length) {
    console.error('Broken assets found:', broken);
    process.exit(1);
  }
  console.log('Crawl OK');
}

main().catch((e) => { console.error(e); process.exit(1); });

