# METRICS

Goal (mobile): LCP ≤ 2.5s • INP ≤ 200ms • CLS < 0.1 • Lighthouse ≥ 90 (Performance & Best Practices)

## Baseline (pre-PR1)
- Lighthouse (home): TBD (to be measured on current production or Netlify preview)
- CWV field data: TBD
- Key notes: No canonical enforcement; hard-coded robots/sitemap; no HSTS/caching policy in Netlify.

## After PR1 (foundation)
- Expected: Correct canonicals/robots/sitemap; redirects and headers in place. Minor Perf gains from HTTP/redirect hygiene.

## After PR2 (structured data)
- Expected: 0 Rich Results errors; eligibility for Org, Website, Breadcrumb, FAQ, Services.

## After PR3 (performance)
- Expected: Lighthouse ≥ 90 Perf/Best Practices; CLS < 0.1; LCP ≤ 2.5s; INP ≤ 200ms on mobile Preview.

## Notes
- All metrics will be recorded on Netlify deploy previews and, where relevant, production after merge.
- GSC and GA4 integration are env-driven; add Measurement ID / verification tokens when available.

