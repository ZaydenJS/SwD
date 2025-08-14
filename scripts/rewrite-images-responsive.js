#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import globby from "globby";
import cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");

async function main() {
  const manifestPath = path.join(distDir, "images-manifest.json");
  if (!(await fs.pathExists(manifestPath))) {
    console.log(
      "images-manifest.json not found; run generate-responsive-images first"
    );
    process.exit(0);
  }
  const manifest = await fs.readJson(manifestPath);

  const files = await globby([`${distDir}/*.html`]);
  for (const f of files) {
    const html = await fs.readFile(f, "utf8");
    const $ = cheerio.load(html, { decodeEntities: false });

    $("img").each((_, img) => {
      const $img = $(img);
      const src = $img.attr("src");
      if (!src || !manifest[src]) return;
      const entry = manifest[src];

      const sizes = $img.attr("sizes") || "(min-width: 1024px) 50vw, 100vw";
      const avifSet = entry.variants.avif
        .map((v) => `${v.src} ${v.w}w`)
        .join(", ");
      const webpSet = entry.variants.webp
        .map((v) => `${v.src} ${v.w}w`)
        .join(", ");

      const attrs = Object.entries($img.attr())
        .filter(([k]) => !["src", "srcset", "width", "height"].includes(k))
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      const width = $img.attr("width") || entry.width;
      const height = $img.attr("height") || entry.height;
      const picture = `
<picture>
  <source type="image/avif" srcset="${avifSet}" sizes="${sizes}">
  <source type="image/webp" srcset="${webpSet}" sizes="${sizes}">
  <img src="${entry.original}" width="${width}" height="${height}" ${attrs} />
</picture>`;
      $img.replaceWith(picture);
    });

    await fs.writeFile(f, $.html(), "utf8");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
