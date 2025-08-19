#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import globby from "globby";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");
const ORIGIN = process.env.ORIGIN || "https://goswd.com";

async function main() {
  const htmlFiles = await globby(["dist/*.html"], { cwd: projectRoot });
  const altMap = {};
  for (const hf of htmlFiles) {
    const html = await fs.readFile(path.join(projectRoot, hf), "utf8");
    const altMatches = Array.from(
      html.matchAll(
        /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi
      )
    );
    for (const m of altMatches) {
      const src = m[1].replace(/^[.\/]+/, "");
      const alt = m[2];
      altMap["/" + src] = alt;
    }
  }

  const imgs = await globby(["dist/**/*.{png,jpg,jpeg,webp,avif}"], {
    cwd: projectRoot,
  });
  const urls = imgs.map((p) => {
    const loc = `${ORIGIN}/${p.replace(/^dist\/?/, "")}`;
    const alt = altMap["/" + p.replace(/^dist\/?/, "")] || "";
    return `<url><loc>${loc}</loc><image:image><image:loc>${loc}</image:loc>${
      alt
        ? `<image:title>${alt}</image:title><image:caption>${alt}</image:caption>`
        : ""
    }</image:image></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join(
    "\n"
  )}\n</urlset>`;
  await fs.writeFile(path.join(distDir, "sitemap-images.xml"), xml, "utf8");
  console.log("Image sitemap generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
