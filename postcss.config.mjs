// postcss.config.mjs
// NOTE: Tailwind v4 is now handled by @tailwindcss/vite (astro.config.mjs).
// @tailwindcss/postcss was removed as part of the Astro 5→7 upgrade because
// in Astro 7 (rolldown), PostCSS import resolution breaks the @import "tailwindcss"
// directive. The Vite plugin approach is the official Astro 7 recommendation.
// See .squad/decisions/inbox/data-astro-security-upgrade.md
export default {
  plugins: {},
};
