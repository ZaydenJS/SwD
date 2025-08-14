#!/usr/bin/env node
import fetch from "node-fetch";

const ORIGIN = process.env.ORIGIN || "https://goswd.com";
const PAGES = ["/", "/about", "/services", "/portfolio", "/contact"];

async function runPsi(url) {
  const api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const res = await fetch(
    `${api}?url=${encodeURIComponent(url)}&strategy=MOBILE`
  );
  if (!res.ok) throw new Error(`PSI failed for ${url} ${res.status}`);
  const data = await res.json();
  const lighthouse = data.lighthouseResult;
  const scores = {
    performance: lighthouse.categories.performance.score * 100,
    bestPractices: lighthouse.categories["best-practices"].score * 100,
    seo: lighthouse.categories.seo.score * 100,
  };
  const audits = lighthouse.audits;
  const lcp = audits["largest-contentful-paint"].numericValue / 1000;
  const cls = audits["cumulative-layout-shift"].numericValue;
  const inp =
    (audits["interactive"]?.numericValue ||
      audits["total-blocking-time"].numericValue) / 1000;
  return { scores, lcp, cls, inp };
}

async function main() {
  for (const p of PAGES) {
    const url = ORIGIN + p;
    try {
      const r = await runPsi(url);
      console.log(`[PSI] ${url}`, r);
      if (
        r.scores.performance < 95 ||
        r.scores.bestPractices < 95 ||
        r.scores.seo < 95 ||
        r.lcp > 1.8 ||
        r.cls > 0.05 ||
        r.inp > 0.15
      ) {
        console.error("Budgets not met for", url);
        process.exitCode = 1;
      }
    } catch (e) {
      console.error("PSI error for", url, e.message);
      process.exitCode = 1;
    }
  }
  if (process.exitCode) process.exit(process.exitCode);
}

main();
