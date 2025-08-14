#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");
const ORIGIN = process.env.ORIGIN || "https://goswd.com";

async function main() {
  await fs.ensureDir(distDir);
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap_index.xml\nSitemap: ${ORIGIN}/sitemap.xml\nSitemap: ${ORIGIN}/sitemap-images.xml\n`;
  await fs.writeFile(path.join(distDir, "robots.txt"), robots, "utf8");
  console.log("robots.txt generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
