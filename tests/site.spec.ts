import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { site } from '../src/data/site';

const slugs = readdirSync('src/content/blog')
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => f.replace(/\.mdx?$/, ''));
const pages = [
  '/',
  '/products/med-assist/', '/products/critical-protect-100/', '/products/all-in-one/',
  '/become-an-advisor/', '/contact/', '/blog/', '/privacy/',
  ...slugs.map((s) => `/blog/${s}/`),
];
const missing = '/this-page-does-not-exist/';
const banned = ['adsbygoogle', 'blogger.com', 'blogspot.com/'];

for (const path of pages) {
  test.describe(path, () => {
    test('1. 200, one h1, title, canonical, og:image', async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).trim()).not.toBe('');
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      expect(canonical).toMatch(/^https?:\/\/.+\/$/);
      expect(new URL(canonical!).pathname).toBe(path);
      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toMatch(/^https?:\/\//);
    });

    test('2. disclaimer matches site.disclaimer', async ({ page }) => {
      await page.goto(path);
      expect((await page.getByTestId('disclaimer').textContent())?.trim()).toBe(site.disclaimer);
    });

    test('3. no Blogger/AdSense leftovers', async ({ request }) => {
      const html = await (await request.get(path)).text();
      for (const bad of banned) expect(html, bad).not.toContain(bad);
    });

    test('4. axe WCAG 2.2 AA', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('.calendly-inline-widget')
        .exclude('[data-testid=jotform]')
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });

    test('7. no horizontal scroll at 360px', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'mobile project is the 360px viewport');
      await page.goto(path, { waitUntil: 'load' });
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
    });
  });
}

test('1/3. missing path returns the 404 page', async ({ page }) => {
  const res = await page.goto(missing);
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  expect((await page.title()).trim()).not.toBe('');
  const html = await page.content();
  for (const bad of banned) expect(html, bad).not.toContain(bad);
});

test('landmarks, anchors and third-party containers exist', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.locator('nav[aria-label=Main]').first()).toBeAttached();
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.locator('a[href="#main"]').first()).toBeAttached();
  await expect(page.locator('#book')).toBeAttached();
  await expect(page.locator('#message')).toBeAttached();
  await expect(page.getByTestId('calendly')).toBeAttached();
  await page.goto('/become-an-advisor/');
  await expect(page.locator('#apply')).toBeAttached();
  await expect(page.getByTestId('jotform')).toBeAttached();
  await page.goto('/products/med-assist/');
  await expect(page.locator('#faq')).toBeAttached();
});
