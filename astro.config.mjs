// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.youngsaversph.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // Self-hosted at build time: no request to Google from visitors' browsers.
  fonts: [{ provider: fontProviders.google(), name: 'Onest', cssVariable: '--font-onest', weights: ['400 800'], subsets: ['latin'] }],
});
