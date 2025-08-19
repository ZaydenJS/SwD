#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import cheerio from "cheerio";
import globby from "globby";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");

async function processHtml(filePath) {
  const html = await fs.readFile(filePath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });

  // Prioritize the first in-document image as likely LCP
  let isFirstImage = true;

  $("img").each((_, img) => {
    const $img = $(img);
    const src = $img.attr("src");
    if (!src || src.startsWith("data:") || src.startsWith("http")) return;

    const ext = path.extname(src).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) return;

    const avif = src.replace(ext, ".avif");
    const webp = src.replace(ext, ".webp");

    // Preserve dimensions and attributes
    const attrs = Object.entries($img.attr())
      .filter(([k]) => !["src", "srcset", "loading", "decoding"].includes(k))
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");

    const priorityAttrs = isFirstImage
      ? 'fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"';

    const picture = `
<picture>
  <source srcset="${avif}" type="image/avif"></source>
  <source srcset="${webp}" type="image/webp"></source>
  <img src="${src}" ${attrs} ${priorityAttrs} />
</picture>`;

    $img.replaceWith(picture);
    if (isFirstImage) isFirstImage = false;
  });

  await fs.writeFile(filePath, $.html(), "utf8");
}

async function main() {
  const files = await globby([`${distDir}/*.html`]);
  for (const f of files) await processHtml(f);
  console.log("Rewrote <img> to <picture> with AVIF/WebP fallbacks");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
