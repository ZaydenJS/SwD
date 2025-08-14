#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { SitemapStream, streamToPromise } from "sitemap";
import globby from "globby";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");
const ORIGIN = process.env.ORIGIN || "https://goswd.com";

async function main() {
  await fs.ensureDir(distDir);

  // Discover pages from dist (extensionless routes from *.html)
  const htmlFiles = (
    await globby(["dist/*.html"], { cwd: projectRoot })
  ).sort();
  const pages = htmlFiles.map((f) =>
    `/${path.basename(f, path.extname(f))}`.replace("/index", "/")
  );

  const smStream = new SitemapStream({ hostname: ORIGIN });
  const now = new Date().toISOString();
  for (const file of htmlFiles) {
    const url = `/${path.basename(file, path.extname(file))}`.replace(
      "/index",
      "/"
    );
    const stat = await fs.stat(path.join(projectRoot, file));
    smStream.write({
      url,
      lastmodISO: stat.mtime.toISOString(),
      changefreq: "monthly",
      priority: url === "/" ? 1.0 : 0.8,
    });
  }
  smStream.end();

  const data = await streamToPromise(smStream);
  await fs.writeFile(path.join(distDir, "sitemap.xml"), data.toString());

  // Create sitemap index to include image sitemap
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${ORIGIN}/sitemap.xml</loc><lastmod>${now}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/sitemap-images.xml</loc><lastmod>${now}</lastmod></sitemap>\n</sitemapindex>`;
  await fs.writeFile(path.join(distDir, "sitemap_index.xml"), indexXml, "utf8");

  console.log("Sitemaps generated (pages + index)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
