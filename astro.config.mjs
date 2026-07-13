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
// Production (custom domain disole1104.k.vu): served at root, so BASE_PATH defaults to ''.
// The deploy workflow (deploy.yml) does NOT set BASE_PATH, so it always uses the default.
// If a custom domain is configured later, set BASE_PATH='' as the new default here and
// update SITE_URL. See .squad/decisions/inbox/data-base-path.md and data-base-path-env-override.md
//
// TODO: Update SITE_URL with the actual GitHub username before first deploy.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://disole1104.k.vu'; // custom domain (GitHub Pages CNAME)
// Base path resolution:
//   - LOCAL=1            → '' (serve at root for local preview; robust because a
//                          non-empty sentinel propagates to child processes, unlike
//                          an empty-string BASE_PATH which shells silently drop).
//   - BASE_PATH defined  → use it verbatim (advanced/manual override).
//   - otherwise          → '' (custom domain disole1104.k.vu serves at root).
// Local preview (PowerShell):  $env:LOCAL='1'; npm run build; npm run preview
const BASE_PATH = process.env.LOCAL === '1' ? '' : (process.env.BASE_PATH ?? '');

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
    build: {
      // DECISION (OBJ-SEC-03): Force Astro to emit hoisted component scripts
      // (Nav, Hero, Gallery lightbox) as EXTERNAL files under /_astro/ instead
      // of inlining them. Astro inlines a script only when it has no imports AND
      // its size is below this limit; setting it to 0 disables inlining, so the
      // scripts are served from 'self' and satisfy a strict `script-src 'self'`
      // CSP with NO 'unsafe-inline' and no fragile per-script hashes.
      // Inlined scripts were being blocked by the strict meta CSP, which is why
      // the gallery lightbox stopped opening. See .squad/decisions/inbox/data-csp-policy.md.
      assetsInlineLimit: 0,
    },
  },
});
