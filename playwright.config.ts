import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';
const local = /localhost|127\.0\.0\.1/.test(baseURL);

export default defineConfig({
  testDir: 'tests',
  reporter: 'list',
  use: { baseURL },
  // Build + preview locally only; a remote BASE_URL (Vercel preview) is tested as-is.
  // --ignore-lock keeps preview in the foreground (Astro auto-backgrounds under AI agents, which Playwright sees as an early exit).
  webServer: local
    ? {
        command: `npm run build && npm run preview -- --ignore-lock --port ${new URL(baseURL).port || 4321}`,
        url: baseURL,
        timeout: 180_000,
      }
    : undefined,
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true } },
  ],
});
