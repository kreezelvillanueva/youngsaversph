import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const urlMap: Record<string, string> = JSON.parse(readFileSync('migration/url-map.json', 'utf8'));
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  redirects: { source: string; destination: string; statusCode?: number }[];
};

test('9. url-map.json keys and vercel.json exact sources are the same set', ({ isMobile }) => {
  test.skip(isMobile, 'viewport-independent');
  const sources = vercel.redirects.map((r) => r.source);
  // Pattern rules (/search, /search/label/:label, /feeds/:path*, year/month) are extra by design (§7).
  const exact = sources.filter((s) => s.endsWith('.html'));
  console.log(`url-map keys: ${Object.keys(urlMap).length}, vercel.json sources: ${sources.length} (${exact.length} exact + ${sources.length - exact.length} pattern)`);
  expect([...exact].sort()).toEqual(Object.keys(urlMap).sort());
  for (const r of vercel.redirects) {
    expect(r.statusCode, r.source).toBe(301);
    if (r.source in urlMap) expect(r.destination, r.source).toBe(urlMap[r.source]);
  }
});

const base = process.env.BASE_URL ?? '';
const remote = !!base && !/localhost|127\.0\.0\.1/.test(base);

test.describe('8. 301 redirects (Vercel preview only)', () => {
  test.skip(!remote, 'astro preview ignores vercel.json; set BASE_URL to a Vercel preview');
  test.skip(({ isMobile }) => isMobile, 'viewport-independent');

  const withM1 = (to: string) => {
    const u = new URL(to, 'http://x');
    u.searchParams.set('m', '1');
    return u.pathname + u.search + u.hash;
  };
  const cases: [string, string][] = [
    ...Object.entries(urlMap),
    ...Object.entries(urlMap).map(([from, to]): [string, string] => [`${from}?m=1`, withM1(to)]),
    ['/search/label/Health', '/blog/'],
    ['/feeds/posts/default', '/blog/'],
  ];

  for (const [from, to] of cases) {
    test(from, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      const loc = new URL(res.headers()['location'], base);
      expect(loc.pathname + loc.search + loc.hash).toBe(to);
    });
  }
});
