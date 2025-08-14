# Scripts Overview

- build.js
  - Copies static site to dist/
  - Injects canonical/meta variants, JSON-LD (Org, WebSite/SearchAction, BreadcrumbList, LocalBusiness)
  - Adds resource hints; defers non-critical scripts (EmailJS async)
  - Minifies HTML/CSS/JS

- generate-robots.js / generate-sitemap.js / generate-headers.js
  - robots.txt pointing to sitemap
  - XML sitemap with lastmod
  - _headers with HSTS, CSP, Security headers
  - _redirects enforcing HTTPS & non-www

- optimize-images.js
  - Creates .webp/.avif next to original images in dist

- rewrite-images.js
  - Rewrites <img> to <picture> with AVIF/WebP fallbacks; preserves width/height; adds loading="lazy"

- critical-css.js
  - Inlines critical CSS into HTML (mobile viewport baseline)

- purge-css.js
  - Purges unused CSS with safelist to avoid visual regressions

- validate-html.js / validate-schema.js
  - Ensures title/description/canonical per page
  - Validates required JSON-LD types

- headers-check.js / psi.js / crawl.js
  - Headers presence on prod
  - PSI budgets (mobile)
  - Weekly crawl for broken images/links and accessibility init

