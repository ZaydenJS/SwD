#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import cheerio from "cheerio";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");

function resolveImagePath(src) {
  const clean = src.replace(/^\//, "");
  const try1 = path.join(distDir, clean);
  const try2 = path.join(distDir, decodeURIComponent(clean));
  if (fs.existsSync(try1)) return try1;
  if (fs.existsSync(try2)) return try2;
  return null;
}

async function setImgDimensions($, img) {
  const $img = $(img);
  const src = $img.attr("src");
  if (!src || src.startsWith("http") || src.startsWith("data:")) return;
  const imgPath = resolveImagePath(src);
  if (!imgPath) return;
  try {
    const meta = await sharp(imgPath).metadata();
    if (meta.width && !$img.attr("width"))
      $img.attr("width", String(meta.width));
    if (meta.height && !$img.attr("height"))
      $img.attr("height", String(meta.height));
    if (!$img.attr("loading")) $img.attr("loading", "lazy");
    // decoding hint
    if (!$img.attr("decoding")) $img.attr("decoding", "async");
  } catch {}
}

async function processHtml(filePath) {
  const html = await fs.readFile(filePath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });

  const imgs = $("img").toArray();
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    // eslint-disable-next-line no-await-in-loop
    await setImgDimensions($, img);
    const $img = $(img);
    if (i === 0) {
      // Prioritize the first image for LCP
      $img.attr("loading", "eager");
      $img.attr("fetchpriority", "high");
    }
  }

  await fs.writeFile(filePath, $.html(), "utf8");
}

async function main() {
  const files = (await fs.readdir(distDir)).filter((f) => f.endsWith(".html"));
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    await processHtml(path.join(distDir, f));
  }
  console.log("Enforced width/height and lazy/decoding on images");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
