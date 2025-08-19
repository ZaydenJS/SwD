#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");
const ORIGIN = process.env.ORIGIN || "https://goswd.com";

function setOnce($, sel, el) {
  if ($(sel).length === 0) $("head").append(el);
}

async function main() {
  const pages = (await fs.readdir(distDir)).filter((f) => f.endsWith(".html"));
  for (const f of pages) {
    const filePath = path.join(distDir, f);
    const html = await fs.readFile(filePath, "utf8");
    const $ = cheerio.load(html);

    // Base html lang + dir (align with hreflang)
    if ($("html").attr("lang") === undefined) $("html").attr("lang", "en-au");
    if ($("html").attr("dir") === undefined) $("html").attr("dir", "ltr");

    // Charset first
    if ($("meta[charset]").length === 0) {
      $("head").prepend('<meta charset="utf-8">');
    }

    // Viewport
    setOnce(
      $,
      'meta[name="viewport"]',
      '<meta name="viewport" content="width=device-width, initial-scale=1">'
    );

    // Theme color
    setOnce(
      $,
      'meta[name="theme-color"]',
      '<meta name="theme-color" content="#0B0E13">'
    );

    // Preload stylesheet for quicker First Paint (detect current stylesheet)
    const sheetHref = $('link[rel="stylesheet"]').first().attr("href");
    if (
      sheetHref &&
      $(`link[rel='preload'][as='style'][href='${sheetHref}']`).length === 0
    ) {
      $("head").prepend(`<link rel="preload" as="style" href="${sheetHref}">`);
    }

    // Open Graph baseline
    setOnce(
      $,
      'meta[property="og:type"]',
      '<meta property="og:type" content="website">'
    );
    setOnce(
      $,
      'meta[property="og:site_name"]',
      '<meta property="og:site_name" content="SwD - Sharpy\'s Web Designs">'
    );
    setOnce(
      $,
      'meta[property="og:image"]',
      `<meta property="og:image" content="${ORIGIN}/logo.png">`
    );
    setOnce(
      $,
      'meta[property="og:locale"]',
      '<meta property="og:locale" content="en_AU">'
    );

    // Twitter cards baseline
    setOnce(
      $,
      'meta[name="twitter:card"]',
      '<meta name="twitter:card" content="summary_large_image">'
    );
    setOnce(
      $,
      'meta[name="twitter:site"]',
      '<meta name="twitter:site" content="@">'
    );

    // Canonicals already set in build; ensure Apple touch icons & favicons
    const icons = [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ];
    for (const i of icons) {
      if ($(`link[rel='${i.rel}']`).length === 0) {
        const attrs = Object.entries(i)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        $("head").append(`<link ${attrs}>`);
      }
    }

    // Preload first in-document image as LCP hint
    const firstImg = $("img").first();
    const firstSrc = firstImg.attr("src");
    if (
      firstSrc &&
      !firstSrc.startsWith("http") &&
      $(`link[rel='preload'][as='image'][href='${firstSrc}']`).length === 0
    ) {
      $("head").append(`<link rel="preload" as="image" href="${firstSrc}">`);
    }

    await fs.writeFile(filePath, $.html(), "utf8");
  }
  console.log("Head enrichment complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
