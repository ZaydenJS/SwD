#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PurgeCSS } from 'purgecss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'dist');

async function main() {
  const purgeCSSResult = await new PurgeCSS().purge({
    content: [path.join(distDir, '*.html'), path.join(distDir, '*.js')],
    css: [path.join(distDir, 'styles.css')],
    safelist: {
      standard: [
        // Animation/visibility classes used dynamically
        'fade-in', 'visible', 'active',
        // Navigation/menu states
        'nav-link', 'nav-menu',
        // Utility and grid classes
        'grid', 'grid-2', 'grid-3', 'grid-4',
        // Buttons and states
        'btn', 'btn-primary', 'btn-secondary', 'btn-outline', 'btn-small',
        // Sections and cards
        'card', 'section', 'bg-gradient', 'page-hero', 'booking-section',
        // FAQ
        'faq-item', 'faq-question', 'faq-answer', 'faq-toggle',
        // Portfolio
        'portfolio-item', 'portfolio-grid', 'portfolio-overlay',
      ],
      deep: [/^hero-/, /^service-/, /^tech-/, /^feature-/, /^industry-/, /^process-/, /^stat-/, /^testimonial-/, /^cta-/],
    },
    defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || []
  });

  const result = purgeCSSResult[0];
  if (result && result.css) {
    await fs.writeFile(path.join(distDir, 'styles.css'), result.css, 'utf8');
    console.log('PurgeCSS wrote optimized styles.css');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

