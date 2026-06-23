# Data — History

## Seed (2026-06-22)

- **Project:** Apartasol 1104 Citadela DI Sole — premium family vacation landing page, Santa Fe de Antioquia, Colombia.
- **Stack:** Astro + Tailwind CSS, static, GitHub Pages, Cloudflare Web Analytics.
- **Languages:** Spanish, English, French.
- **Requested by:** mtamayoo
- **My role:** Lead / Architect — own structure, scope, code review.

## Sprint 1 — Scaffold + Base Architecture (2026-06-22T13:42:33+02:00)

**Task:** Full project scaffold per task brief (items 1–10). Mouth builds section content next.

### Stack choices
| Concern | Decision |
|---------|----------|
| Framework | Astro `^5` (pinned; avoids Astro 6 rolldown-vite incompatibility) |
| CSS | Tailwind v4 + `@tailwindcss/postcss` + `postcss.config.mjs` (no `@tailwindcss/vite`) |
| i18n | Astro built-in i18n, `prefixDefaultLocale: false` (es=`/`, en=`/en/`, fr=`/fr/`) |
| SEO | `@astrojs/sitemap`, per-locale hreflang, JSON-LD LodgingBusiness/Apartment |
| Security | CSP via `<meta>` (GitHub Pages) + `public/_headers` (CDN/Cloudflare) |
| Deploy | GitHub Actions → GitHub Pages (`configure-pages` + `upload-pages-artifact` + `deploy-pages`) |
| Base path | `/Web1104-1` (GitHub project page; documented as easy to change for custom domain) |

### Build result
- **`npm run build` → PASS** in 3.85 s
- 3 pages generated: `/`, `/en/`, `/fr/`
- Sitemap: `sitemap-index.xml` + `sitemap-0.xml` with all 3 locale entries
- Tailwind CSS output: 24 KB (tree-shaken)
- All SEO checks pass: hreflang ×4, og:title, twitter:card, JSON-LD, CSP meta, canonical, lang="es-CO"

### Files created
- `package.json`, `astro.config.mjs`, `tsconfig.json`, `postcss.config.mjs`
- `src/env.d.ts`, `src/styles/global.css`
- `src/i18n/es.json` (seeded), `en.json` (TODO), `fr.json` (TODO), `utils.ts`
- `src/config/site.ts` (booking/airbnb URLs as `#placeholder`, GeoCoords, site config)
- `src/layouts/Layout.astro` (full SEO head, CSP, JSON-LD, hreflang, OG, Twitter Card)
- `src/components/`: Nav, LanguagePicker, Hero, Apartment, Amenities, SantaFe, Gallery, Location, Materials, Booking, Footer (all stubs with TODO markers for Mouth)
- `src/pages/index.astro` (es), `en/index.astro`, `fr/index.astro`
- `public/robots.txt`, `public/_headers`, `public/galeria/` (README + 2 SVG placeholders), `public/materiales/` (README)
- `.github/workflows/deploy.yml`, `.github/dependabot.yml`

### Decisions logged
- `data-astro-tailwind-approach.md` — Astro 5 + Tailwind v4 PostCSS
- `data-i18n-routing.md` — Astro built-in i18n, prefixDefaultLocale false
- `data-base-path.md` — `/Web1104-1` base path, custom domain TODO
- `data-csp-policy.md` — meta CSP + _headers dual strategy
- `data-deploy-approach.md` — GitHub Actions deploy pipeline

### What Mouth needs to do next
- Implement visual design for all 11 stub components (Hero slideshow, Apartment icon grid, Amenities cards, Gallery lightbox, etc.)
- Fill `en.json` and `fr.json` translations (replace all `TODO:` values)
- Add real photos to `public/galeria/` (WebP/AVIF, per naming convention in README)
- Wire up real Booking.com and Airbnb URLs in `src/config/site.ts` (section 12 — pending)
- Deliver PDFs to `public/materiales/` and update hrefs in `Materials.astro`
- Add Cloudflare Analytics token to `src/config/site.ts` (CF_ANALYTICS_TOKEN)
- Create privacy policy and legal notice pages once owner provides legal text

---

## Sprint 2 — Security & Infrastructure Hardening (2026-06-22T13:42:33+02:00)

**Task:** Post-review fixes from Sloth (security, YELLOW) and Chunk (functional, YELLOW). Infrastructure/dependency fixes only — no frontend component touches.

### Changes made

| Item | Change | Decision file |
|------|--------|---------------|
| OBJ-SEC-05: astro HIGH CVEs | Upgraded astro `5.18.2` → `7.0.0`; migrated Tailwind from `@tailwindcss/postcss` → `@tailwindcss/vite` (Astro 7/rolldown requires Vite plugin) | `data-astro-security-upgrade.md` |
| CTRL-SECRETS: .gitignore | Added `dist/`, `.astro/`, `node_modules/`, `.env`, `.env.*`, `!.env.example`, `*.local`, `npm-debug.log*`, `.DS_Store`, `Thumbs.db` | `data-gitignore-expand.md` |
| OBJ-SEC-01: GitHub Actions | SHA-pinned all 5 actions in `deploy.yml` (checkout v4.2.2, setup-node v4.4.0, configure-pages v5.0.0, upload-pages-artifact v3.0.1, deploy-pages v4.0.5) — SHAs verified via GitHub API | `data-actions-sha-pin.md` |
| CTRL-SECRETS: CF_ANALYTICS_TOKEN | Added clarifying comment in `src/config/site.ts` confirming the token is a PUBLIC site token by design, not a secret | (inline comment) |

### Build result
- **`npm run build` → PASS** in 1.31 s
- 3 pages generated: `/index.html`, `/en/index.html`, `/fr/index.html`
- `npm audit`: **0 Critical, 0 High** — 5 Moderate (yaml chain in @astrojs/check devDep, not shipped)
- OBJ-SEC-05 acceptance criteria MET.

### Residual risk
- 5 Moderate vulnerabilities in `@astrojs/check` devDep (yaml stack overflow) — devDep only, no fix available without breaking `@astrojs/check`. Not exploitable in deployed output.
- `unsafe-inline` in CSP (Y3 from Sloth) — documented as future work pending Astro nonce support (RF-10).
- Cloudflare proxy not yet activated (Y6 from Sloth) — owner action required for full Mozilla Observatory A/A+.


## 2026-06-22T16:22:37+02:00 — BASE_PATH env-override for local preview

- Made `BASE_PATH` in `astro.config.mjs` read from `process.env.BASE_PATH ?? '/Web1104-1'` — nullish coalescing so `BASE_PATH=''` serves at root locally while unset env (CI/production) keeps `/Web1104-1` default. `deploy.yml` unchanged. Both builds verified: production keeps `/Web1104-1/_astro/…` prefix, local root removes it. Decision logged: `data-base-path-env-override.md`.

## 2026-06-22T16:38:51+02:00 — Single source of truth for base path (bug fix)

- Replaced hardcoded `export const BASE_PATH = '/Web1104-1' as const` in `src/config/site.ts` with a value derived from `import.meta.env.BASE_URL` so component links always follow Astro's active base. Fixes language switcher 404s locally. Decision logged: `data-base-path-single-source.md`.

---

Scribe merged the session decision inbox into `.squad\decisions.md`, archived no old decisions, and recorded orchestration/session logs. Data and Mouth resolved the code-owned YELLOW items from Sloth and Chunk: Astro HIGH audit item, .gitignore, SHA-pinned actions, skip link, responsive image attributes, OG image, robots cleanup, hreflang consistency, and privacy wording. Final build is clean with npm audit at 0 Critical / 0 High; owner-pending items remain Booking/Airbnb URLs, real photos, PDFs, Cloudflare Analytics token, distance data, and Cloudflare proxy for Observatory validation.
