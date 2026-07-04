// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://qnsc.vn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', vi: 'vi-VN' },
      },
      // /vi/why-quy-nhon is a redirect stub (no Vietnamese translation of the
      // article exists yet) — exclude it so the sitemap never advertises a
      // vi-VN URL that just bounces to English.
      filter: (page) => page !== 'https://qnsc.vn/vi/why-quy-nhon/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
