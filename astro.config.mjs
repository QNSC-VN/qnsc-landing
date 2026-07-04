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
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
