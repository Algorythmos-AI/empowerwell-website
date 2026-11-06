// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Production origin. Keep in sync with SITE.websiteUrl in src/content/site.ts.
const SITE_URL = 'https://empowerwell.com.au';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // Matches vercel.json (cleanUrls + trailingSlash: false): /about is served from about.html.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
