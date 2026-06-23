// astro.config.mjs
// DECISION: Astro 7 + Tailwind v4 via @tailwindcss/vite (Vite plugin).
// Migrated from @tailwindcss/postcss to @tailwindcss/vite as part of the
// Astro 5→7 security upgrade (OBJ-SEC-05). In Astro 7 (rolldown), the
// @tailwindcss/postcss PostCSS approach breaks CSS @import resolution;
// the Vite plugin is the official recommended path.
// See .squad/decisions/inbox/data-astro-tailwind-approach.md
//
// DECISION: Base path is env-overridable for local preview vs GitHub Pages production.
// Local preview:  set BASE_PATH to empty string so assets resolve at root.
//   PowerShell:   $env:BASE_PATH=''; npm run dev    (or npm run build)
//   bash:         BASE_PATH='' npm run dev
// Production/GitHub Pages: leave BASE_PATH unset → defaults to '/Web1104-1'.
// The deploy workflow (deploy.yml) does NOT set BASE_PATH, so it always uses the default.
// If a custom domain is configured later, set BASE_PATH='' as the new default here and
// update SITE_URL. See .squad/decisions/inbox/data-base-path.md and data-base-path-env-override.md
//
// TODO: Update SITE_URL with the actual GitHub username before first deploy.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://mtamayoo.github.io'; // TODO: verify GitHub username
// Base path resolution:
//   - LOCAL=1            → '' (serve at root for local preview; robust because a
//                          non-empty sentinel propagates to child processes, unlike
//                          an empty-string BASE_PATH which shells silently drop).
//   - BASE_PATH defined  → use it verbatim (advanced/manual override).
//   - otherwise          → '/Web1104-1' (GitHub Pages production default).
// Local preview (PowerShell):  $env:LOCAL='1'; npm run build; npm run preview
const BASE_PATH = process.env.LOCAL === '1' ? '' : (process.env.BASE_PATH ?? '/Web1104-1');

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
