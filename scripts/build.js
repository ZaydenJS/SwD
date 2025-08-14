#!/usr/bin/env node
/*
  SwD backend-only SEO/perf build
  - Copies static site to dist/
  - Injects canonical, meta variants, JSON-LD, resource hints
  - Minifies HTML/CSS/JS
  - Adds defer to scripts
*/
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import cheerio from "cheerio";
import csso from "csso";
import { minify as minifyHtml } from "html-minifier-terser";
import terser from "terser";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const projectRoot = path.resolve(root, "..");
const distDir = path.join(projectRoot, "dist");

const ORIGIN = process.env.ORIGIN || "https://goswd.com";
const TRAILING = process.env.TRAILING || "never"; // never | always

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.ensureDir(distDir);

  // Files to copy directly
  const copyList = [
    "index.html",
    "about.html",
    "services.html",
    "portfolio.html",
    "contact.html",
    "styles.css",
    "script.js",
    "manifest.json",
    "robots.txt", // will be overwritten by generator
    "sitemap.xml", // will be overwritten by generator
    "README.md",
  ];

  for (const rel of copyList) {
    const src = path.join(projectRoot, rel);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(distDir, rel));
    }
  }

  // Copy assets folder(s)
  const assets = ["Recent Project Photos"];
  for (const a of assets) {
    const src = path.join(projectRoot, a);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(distDir, a));
    }
  }

  // Minify CSS
  const cssPath = path.join(distDir, "styles.css");
  if (await fs.pathExists(cssPath)) {
    const css = await fs.readFile(cssPath, "utf8");
    const min = csso.minify(css, { restructure: false });
    await fs.writeFile(cssPath, min.css, "utf8");
  }

  // Minify JS
  const jsPath = path.join(distDir, "script.js");
  if (await fs.pathExists(jsPath)) {
    const js = await fs.readFile(jsPath, "utf8");
    const min = await terser.minify(js, { compress: true, mangle: true });
    await fs.writeFile(jsPath, min.code || js, "utf8");
  }

  // Process HTML pages
  const pages = [
    { file: "index.html", slug: "" },
    { file: "about.html", slug: "about" },
    { file: "services.html", slug: "services" },
    { file: "portfolio.html", slug: "portfolio" },
    { file: "contact.html", slug: "contact" },
  ];

  for (const p of pages) {
    const filePath = path.join(distDir, p.file);
    if (!(await fs.pathExists(filePath))) continue;
    let html = await fs.readFile(filePath, "utf8");
    const $ = cheerio.load(html);

    // Compute canonical URL
    const pathPart = p.slug ? `/${p.slug}` : "/";
    const canonicalUrl =
      ORIGIN +
      (TRAILING === "always" && pathPart !== "/" ? `${pathPart}/` : pathPart);

    // Ensure <title> exists (keep original)
    if ($("title").length === 0) {
      $("head").prepend("<title>SwD - Sharpy's Web Designs</title>");
    }

    // Ensure meta description exists and include brand variants once
    const brandVariants =
      "SharpysWebDesigns, Sharp Web Designs, Sharpy's Web Designs, Sharps Web Design, SwD, Sharp Web Desings";
    const descTag = $('meta[name="description"]');
    if (descTag.length) {
      const desc = descTag.attr("content") || "";
      if (
        !/SharpysWebDesigns|Sharp Web Designs|Sharpy's Web Designs/i.test(desc)
      ) {
        descTag.attr("content", `${desc} | ${brandVariants}`.trim());
      }
    } else {
      $("head").append(`<meta name="description" content="${brandVariants}"/>`);
    }

    // Append/ensure meta keywords with brand variants
    const kwTag = $('meta[name="keywords"]');
    if (kwTag.length) {
      const kw = kwTag.attr("content") || "";
      if (!/SharpysWebDesigns/i.test(kw)) {
        kwTag.attr("content", `${kw}, ${brandVariants}`);
      }
    } else {
      $("head").append(`<meta name="keywords" content="${brandVariants}">`);
    }

    // Self-referential canonical
    if ($('link[rel="canonical"]').length) {
      $('link[rel="canonical"]').attr("href", canonicalUrl);
    } else {
      $("head").append(`<link rel="canonical" href="${canonicalUrl}"/>`);
    }

    // Set social tags
    const titleText = ($("title").text() || "").trim();
    const descText = (
      $('meta[name="description"]').attr("content") || ""
    ).trim();
    const ogUrl = $('meta[property="og:url"]');
    if (ogUrl.length) ogUrl.attr("content", canonicalUrl);
    else $("head").append(`<meta property="og:url" content="${canonicalUrl}">`);
    if ($('meta[property="og:title"]').length)
      $('meta[property="og:title"]').attr("content", titleText);
    else
      $("head").append(
        `<meta property="og:title" content="${escapeHtml(titleText)}">`
      );
    if ($('meta[property="og:description"]').length)
      $('meta[property="og:description"]').attr("content", descText);
    else
      $("head").append(
        `<meta property="og:description" content="${escapeHtml(descText)}">`
      );
    if ($('meta[name="twitter:title"]').length)
      $('meta[name="twitter:title"]').attr("content", titleText);
    else
      $("head").append(
        `<meta name="twitter:title" content="${escapeHtml(titleText)}">`
      );
    if ($('meta[name="twitter:description"]').length)
      $('meta[name="twitter:description"]').attr("content", descText);
    else
      $("head").append(
        `<meta name="twitter:description" content="${escapeHtml(descText)}">`
      );
    // Provide OG/Twitter image and alt fallbacks if missing
    if ($('meta[property="og:image"]').length === 0) {
      $("head").append(
        `<meta property="og:image" content="${ORIGIN}/logo.png">`
      );
    }
    if ($('meta[property="og:image:alt"]').length === 0) {
      $("head").append(
        `<meta property="og:image:alt" content="${escapeHtml(
          titleText || "Sharpy's Web Designs"
        )}">`
      );
    }
    if ($('meta[name="twitter:image"]').length === 0) {
      $("head").append(
        `<meta name="twitter:image" content="${ORIGIN}/logo.png">`
      );
    }

    // Robots meta default + advanced crawler directives
    if ($('meta[name="robots"]').length === 0) {
      $("head").append('<meta name="robots" content="index,follow">');
    }
    if ($('meta[name="googlebot"]').length === 0) {
      $("head").append(
        '<meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">'
      );
    }
    if ($('meta[name="bingbot"]').length === 0) {
      $("head").append(
        '<meta name="bingbot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">'
      );
    }

    // Hreflang (single locale + x-default)
    const hreflangs = [
      { lang: "en-au", href: canonicalUrl },
      { lang: "x-default", href: canonicalUrl },
    ];
    for (const h of hreflangs) {
      if ($(`link[rel='alternate'][hreflang='${h.lang}']`).length === 0) {
        $("head").append(
          `<link rel="alternate" hreflang="${h.lang}" href="${h.href}">`
        );
      }
    }

    // Resource hints
    const hints = [
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "//fonts.gstatic.com" },
      { rel: "dns-prefetch", href: "//fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://api.web3forms.com",
        crossorigin: "anonymous",
      },
      { rel: "dns-prefetch", href: "//api.web3forms.com" },
    ];
    for (const h of hints) {
      const exists = $(`link[rel='${h.rel}'][href='${h.href}']`).length > 0;
      if (!exists) {
        const attrs = Object.entries(h)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        $("head").append(`<link ${attrs}>`);
      }
    }

    // Defer/async non-critical scripts
    $("script[src]")
      .not('link[rel="preload"][as="script"]')
      .each((_, el) => {
        const $el = $(el);
        const src = $el.attr("src") || "";
        // Keep EmailJS SDK as async
        if (src.includes("emailjs")) {
          $el.attr("async", "");
        } else {
          $el.attr("defer", "");
        }
      });

    // JSON-LD graph
    const breadcrumb = [
      { name: "Home", url: ORIGIN + "/" },
      ...(p.slug ? [{ name: capitalize(p.slug), url: canonicalUrl }] : []),
    ];
    // Try to infer site navigation from in-page links
    const navLinks = Array.from($('a[href^="/"]').slice(0, 10)).map(
      (a, idx) => ({
        name: ($(a).text() || "").trim() || `Link ${idx + 1}`,
        url: new URL($(a).attr("href"), ORIGIN).toString(),
      })
    );

    const jsonld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "SwD - Sharpy's Web Designs",
          url: ORIGIN,
          logo: ORIGIN + "/logo.png",
          sameAs: [],
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+61 459 437 764",
              contactType: "sales",
              availableLanguage: ["en"],
            },
          ],
        },
        {
          "@type": "WebSite",
          url: ORIGIN,
          name: "SwD - Sharpy's Web Designs",
          potentialAction: {
            "@type": "SearchAction",
            target: `${ORIGIN}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
          hasPart: navLinks.map((l) => ({
            "@type": "SiteNavigationElement",
            name: l.name,
            url: l.url,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumb.map((b, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: b.name,
            item: b.url,
          })),
        },
        {
          "@type": "LocalBusiness",
          name: "SwD - Sharpy's Web Designs",
          url: ORIGIN,
          areaServed: {
            "@type": "AdministrativeArea",
            name: "Sydney, NSW, Australia",
          },
          image: ORIGIN + "/logo.png",
          telephone: "+61 459 437 764",
          priceRange: "$",
          sameAs: [],
        },
      ],
    };

    // Remove existing ld+json blocks to avoid duplicates, then insert our graph
    $('script[type="application/ld+json"]').remove();
    $("head").append(
      `<script type=\"application/ld+json\">${JSON.stringify(jsonld)}</script>`
    );

    // Add WebPage subtype schema
    const pageType = p.slug === "" ? "WebPage" : `${capitalize(p.slug)}Page`;
    const titleText = ($("title").text() || "").trim();
    const descText = (
      $('meta[name="description"]').attr("content") || ""
    ).trim();
    const webPage = {
      "@context": "https://schema.org",
      "@type": pageType,
      url: canonicalUrl,
      name: titleText,
      description: descText,
    };
    $("head").append(
      `<script type=\"application/ld+json\">${JSON.stringify(webPage)}</script>`
    );

    // Minify and save
    html = await minifyHtml($.html(), {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: false,
      minifyCSS: true,
      minifyJS: true,
      sortAttributes: true,
      sortClassName: false,
    });

    await fs.writeFile(filePath, html, "utf8");
  }

  console.log("Build complete at", distDir);
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function escapeHtml(s) {
  return s.replace(
    /[&<>"]+/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
