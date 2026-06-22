// astro.config.mjs
// DECISION: Astro 7 + Tailwind v4 via @tailwindcss/vite (Vite plugin).
// Migrated from @tailwindcss/postcss to @tailwindcss/vite as part of the
// Astro 5→7 security upgrade (OBJ-SEC-05). In Astro 7 (rolldown), the
// @tailwindcss/postcss PostCSS approach breaks CSS @import resolution;
// the Vite plugin is the official recommended path.
// See .squad/decisions/inbox/data-astro-tailwind-approach.md
//
// DECISION: Base path set to '/Web1104-1' for GitHub Pages project-page deployment.
// If a custom domain is configured later, set BASE_PATH = '' and update SITE_URL.
// See .squad/decisions/inbox/data-base-path.md
//
// TODO: Update SITE_URL with the actual GitHub username before first deploy.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://mtamayoo.github.io'; // TODO: verify GitHub username
const BASE_PATH = '/Web1104-1';                 // TODO: remove if custom domain is used

export default defineConfig({
  site: `${SITE_URL}`,
  base: BASE_PATH,
  output: 'static',
  integrations: [
    sitemap({
      // i18n sitemap entries: all three locales
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-CO',
          en: 'en-US',
          fr: 'fr-FR',
        },
      },
    }),
  ],
  // DECISION: Astro built-in i18n routing; Spanish is default (no prefix).
  // See .squad/decisions/inbox/data-i18n-routing.md
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'fr'],
    routing: {
      prefixDefaultLocale: false, // / = es, /en/ = en, /fr/ = fr
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
