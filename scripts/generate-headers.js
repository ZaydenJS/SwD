#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.join(projectRoot, "dist");

async function main() {
  await fs.ensureDir(distDir);
  const headers = `
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), fullscreen=*, payment=()
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 0
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-site
  X-Permitted-Cross-Domain-Policies: none
  X-Download-Options: noopen
  X-DNS-Prefetch-Control: on
  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://api.web3forms.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests

  # HTML should be revalidated to always reflect the latest build
  Cache-Control: no-cache

/assets/*
  # Long-term caching for static assets; filenames should change on content updates
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=2592000

/*.js
  Cache-Control: public, max-age=2592000

/*.(png|jpg|jpeg|webp|avif|svg)
  Cache-Control: public, max-age=31536000, immutable
`;
  await fs.writeFile(
    path.join(distDir, "_headers"),
    headers.trimStart(),
    "utf8"
  );

  const redirects = `
# Force HTTPS
http://* https://:splat 301!
# Force non-www
https://www.:host/* https://:host/:splat 301
`;
  await fs.writeFile(
    path.join(distDir, "_redirects"),
    redirects.trimStart(),
    "utf8"
  );
  console.log(
    "Generated _headers and _redirects for static hosts (e.g., Cloudflare Pages)"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
