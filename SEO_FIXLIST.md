# SEO_FIXLIST

Scope: Backend-only technical SEO + performance with automation. No visual changes.

Implemented:

1) Canonicals, Meta, and Brand Variants
- Build ensures unique <title>, meta description presence
- Appends brand variants and misspellings: "SharpysWebDesigns, Sharp Web Designs, Sharpy's Web Designs, Sharps Web Design, SwD, Sharp Web Desings"
- Self-referential canonical per page; og:url synced with canonical

2) Robots + Sitemaps
- robots.txt auto-generated with canonical origin and sitemap reference
- XML sitemap generated with proper lastmod
- submit to Google via ping API in CI (no manual steps)

3) Structured Data (JSON-LD)
- Injects Organization, WebSite+SearchAction, BreadcrumbList, LocalBusiness
- Repo script validates presence across pages; CI fails on errors

4) Performance (non-visual)
- Minify HTML/CSS/JS
- Defer/async non-critical scripts automatically; keeps EmailJS async
- Resource hints (preconnect/dns-prefetch for Google Fonts and Calendly)
- Image optimization script generates WebP/AVIF variants at build

5) Security & Headers
- _headers and _redirects generated for static hosts with HSTS, CSP, etc.
- Netlify-compatible file already present under dist/netlify.toml (left untouched)

6) CI/CD & Automation
- PR workflow: build + HTML/Schema checks
- Main: build, robots/sitemap, headers, schema validate, PSI budgets, sitemap submit
- Weekly: crawl prod, headers check, PSI budgets

Budgets (mobile): Perf ≥90, Best Practices ≥90, LCP ≤2.5s, INP ≤200ms, CLS <0.1

Notes:
- Set ORIGIN env or default is https://goswd.com
- To point to another domain, set ORIGIN in GitHub repo secrets or workflow env

