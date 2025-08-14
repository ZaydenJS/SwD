# SEO_FIXLIST

Scope: Backend-only technical SEO and performance hardening for Netlify (goswd.com). No visual/UI changes. PR-based delivery.

## Top Issues (Found → Fix → Proof)

1) Mixed domain signals (og:url/robots/sitemap)
- Issue: index.html uses swd.design; robots/sitemap hard-coded to sharpswebdesign.com
- Fix: Build-time injection of rel=canonical and og:url to https://goswd.com; generate robots/sitemap with canonical origin
- File/Commit: build/build.js; netlify.toml; commit: PR1-01
- Proof: View-source shows canonical https://goswd.com/...; /robots.txt and /sitemap.xml contain goswd.com

2) Canonicalization & HTTPS
- Issue: No enforced HTTPS, non-www, trailing-slash policy
- Fix: netlify.toml redirects (HTTP→HTTPS, www→non-www, collapse //), trailingSlash=never
- File/Commit: netlify.toml; commit: PR1-02
- Proof: curl -I http://www.goswd.com/about.html → 301 Location: https://goswd.com/about

3) Preview noindex
- Issue: Previews might be indexable
- Fix: X-Robots-Tag noindex on preview context + meta robots noindex injected at build
- File/Commit: netlify.toml [context.deploy-preview]; build/build.js; commit: PR1-03
- Proof: curl -I <DEPLOY_PRIME_URL> shows X-Robots-Tag; HTML has meta robots

4) Security and caching headers
- Issue: No HSTS, nosniff, modern policies; weak caching strategy
- Fix: netlify.toml security headers; HTML revalidate; assets/fonts immutable
- File/Commit: netlify.toml; commit: PR1-04
- Proof: Response headers include HSTS, nosniff, Referrer-Policy, Permissions-Policy; caching matches rules

5) Structured data scaffolding (planned PR2)
- Issue: Partial Org schema only; missing WebSite/SearchAction, BreadcrumbList, FAQPage, Services
- Fix: Inject JSON-LD templates build-time (non-visual)
- File/Commit: build step additions; commit: PR2-01
- Proof: Rich Results test 0 errors

6) Performance (planned PR3)
- Issue: Render-blocking fonts, JS execution timing, images
- Fix: Preconnect/preload fonts, font-display swap, defer/async non-critical JS, lazy images + sizes, resource hints; optional self-host fonts
- File/Commit: head injections via build; commit: PR3-01
- Proof: Lighthouse ≥ 90 Perf/Best Practices; CWV goals on mobile preview

## Rollback Notes
- netlify.toml changes can be rolled back by reverting PRs
- build pipeline is additive and can be bypassed by changing build command to publish root


