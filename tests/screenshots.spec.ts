import { test } from '@playwright/test';
import { readdirSync } from 'node:fs';

// Not a check: saves review screenshots to .impeccable/review/qa/ (gitignored).
const slugs = readdirSync('src/content/blog')
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => f.replace(/\.mdx?$/, ''));
const pages = [
  '/', '/products/med-assist/', '/products/critical-protect-100/', '/products/all-in-one/',
  '/become-an-advisor/', '/contact/', '/blog/', ...slugs.map((s) => `/blog/${s}/`), '/this-page-does-not-exist/',
];

test.describe('screenshots', () => {
  test.skip(({ isMobile }) => isMobile, 'runs once, sets its own widths');
  for (const path of pages) {
    for (const width of [1280, 390]) {
      test(`${path} @${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path, { waitUntil: 'load' });
        const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_');
        await page.screenshot({ path: `.impeccable/review/qa/${name}-${width}.png`, fullPage: true });
      });
    }
  }
});
