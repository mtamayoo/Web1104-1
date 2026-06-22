# Squad Decisions

## Ledger Health

- **Pre-check timestamp:** 2026-06-22T13:42:33+02:00
- **Before merge:** `.squad\decisions.md` = 234 bytes; inbox = 18 files / 120,197 bytes.
- **Archive gate:** Not triggered before merge because `decisions.md` was below 20,480 bytes. No entries older than 30 days were present.
- **Merged inbox files:** 18 decision records from Data, Mouth, Sloth, and Chunk.

## Active Decisions — 2026-06-22 Apartasol 1104 Citadela DI Sole Website Build

### Data / Lead-Architect Decisions

#### 2026-06-22T13:42:33+02:00 — Astro version and Tailwind integration (superseded)

**By:** Data  
**What:** Initially scaffolded on Astro 5 with Tailwind CSS v4 through `@tailwindcss/postcss` and `postcss.config.mjs`, avoiding `@tailwindcss/vite`.  
**Why:** The initial choice avoided Astro 6 rolldown-vite incompatibility concerns while keeping Tailwind v4, Astro i18n, static output, and RF-10 future extensibility.  
**Requirement IDs:** Section 7, RF-10.  
**Status:** Superseded later in the same session by the Astro 7 security upgrade.

#### 2026-06-22T13:42:33+02:00 — Astro security upgrade 5→7 and Tailwind Vite migration

**By:** Data  
**What:** Upgraded `astro` from 5.18.2 to 7.0.0, installed `@tailwindcss/vite`, removed obsolete `@tailwindcss/postcss`, and moved Tailwind processing into `astro.config.mjs` Vite plugins while leaving `postcss.config.mjs` as an explanatory empty config.  
**Why:** Sloth Y1 and Chunk PRIV-11/SEC-05 found HIGH Astro/esbuild advisories, violating the no Critical/High release gate. Astro 7 closes GHSA-j687-52p2-xcff, GHSA-8hv8-536x-4wqp, GHSA-jrpj-wcv7-9fh9, GHSA-2pvr-wf23-7pc7, GHSA-xr5h-phrj-8vxv, and the transitive esbuild Windows dev-server advisory GHSA-g7r4-m6w7-qqqr.  
**Requirement IDs:** OBJ-SEC-05, ACC-DEPENDABOT, PRIV-11, SEC-05.  
**Validation:** `npm run build` passed for `/`, `/en/`, `/fr/`; `npm audit` showed 0 Critical / 0 High, with 5 Moderate devDependency `yaml` chain items accepted as not shipped.

#### 2026-06-22T13:42:33+02:00 — i18n routing strategy

**By:** Data  
**What:** Used Astro built-in i18n with `defaultLocale: 'es'`, locales `es/en/fr`, and `routing.prefixDefaultLocale: false`, producing Spanish at `/`, English at `/en/`, and French at `/fr/`.  
**Why:** Spanish is the primary/default locale and root URL for SEO; English and French follow standard localized subpaths. Astro i18n integrates with current-locale page rendering and sitemap generation.  
**Requirement IDs:** RF-02, section 8.1.

#### 2026-06-22T13:42:33+02:00 — GitHub Pages base path

**By:** Data  
**What:** Set the GitHub Pages project base path to `/Web1104-1` with site origin `https://mtamayoo.github.io`, yielding `https://mtamayoo.github.io/Web1104-1/`.  
**Why:** GitHub project pages are served under the repository-name subpath. The config keeps a documented path to switch to `/` when a custom domain is later configured.  
**Requirement IDs:** Section 7, section 12, RF-10.

#### 2026-06-22T13:42:33+02:00 — CSP and security headers delivery strategy

**By:** Data  
**What:** Delivered a CSP via `<meta http-equiv="Content-Security-Policy">` for GitHub Pages and prepared `public/_headers` for Cloudflare/Netlify/Cloudflare Pages with CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and clickjacking headers.  
**Why:** GitHub Pages cannot emit custom HTTP headers, so meta CSP gives basic protection while `_headers` enables Mozilla Observatory A/A+ when fronted by Cloudflare or equivalent. `frame-ancestors` and HSTS remain header-only. No anti-debugging/F12 blocking was implemented.  
**Requirement IDs:** OBJ-SEC-03, OBJ-SEC-07, CTRL-CSP, CTRL-HSTS, CTRL-CLICKJACKING, section 9, section 13.1.1, section 13.2, section 13.3, RF-10.

#### 2026-06-22T13:42:33+02:00 — Deployment pipeline to GitHub Pages

**By:** Data  
**What:** Added a GitHub Actions workflow to build Astro with Node 20 and deploy `dist/` to GitHub Pages using the official configure/upload/deploy Pages action pattern; added Dependabot for npm and GitHub Actions.  
**Why:** This is the official Astro/GitHub Pages deployment path, supports reproducible `npm ci`, manual dispatch, controlled Pages permissions, deployment concurrency, and continuous dependency monitoring.  
**Requirement IDs:** Section 7, OBJ-SEC-04, OBJ-SEC-06, section 13.2.

#### 2026-06-22T13:42:33+02:00 — GitHub Actions SHA pinning

**By:** Data  
**What:** Replaced floating major-version tags in `.github\workflows\deploy.yml` with verified full commit SHAs while retaining version comments: checkout v4.2.2, setup-node v4.4.0, configure-pages v5.0.0, upload-pages-artifact v3.0.1, deploy-pages v4.0.5.  
**Why:** Sloth Y4 identified mutable tags as a supply-chain risk. SHA pinning satisfies security-by-design and NIST SA-12 expectations while Dependabot remains configured to propose updates.  
**Requirement IDs:** OBJ-SEC-01, SA-12, ACC-DEPENDABOT.  
**Residual risk:** None beyond normal trust in official GitHub-maintained actions.

#### 2026-06-22T13:42:33+02:00 — `.gitignore` expansion

**By:** Data  
**What:** Added standard Node/Astro ignores for `dist/`, `.astro/`, `node_modules/`, `.env`, `.env.*`, `!.env.example`, `*.local`, npm logs, `.DS_Store`, `Thumbs.db`, and `ehthumbs.db`; preserved existing squad entries.  
**Why:** Sloth Y2 flagged the previous file as too narrow for preventing accidental build output, dependency, OS cruft, and environment-file commits. `CF_ANALYTICS_TOKEN` is explicitly documented as a public site token, not a secret.  
**Requirement IDs:** CTRL-SECRETS.

### Mouth / Frontend Decisions

#### 2026-06-22T13:42:33+02:00 — CSS-only hero crossfade

**By:** Mouth  
**What:** Implemented the hero photo montage with pure CSS `@keyframes hero-crossfade`, staggered slide delays, eager/high-priority first image, lazy subsequent images, and no JS carousel.  
**Why:** CSS animation protects LCP/CWV and avoids JS jank. Reduced-motion users are respected through global `prefers-reduced-motion` handling. The structure allows easy replacement with real photos.  
**Requirement IDs:** RF-03, NF-CWV-01, NF-CWV-02, NF-CWV-03, WCAG 2.3, section 6.5.

#### 2026-06-22T13:42:33+02:00 — Native gallery lightbox

**By:** Mouth  
**What:** Implemented RF-05 gallery fullscreen viewing with native `<dialog>`, `showModal()/close()`, previous/next controls, ArrowLeft/ArrowRight navigation, Esc close, focus trap, live counter, category filtering, context-menu prevention, drag prevention, and DI Sole watermark overlays.  
**Why:** Native dialog provides accessible modal behavior without an external lightbox library, keeping JS small and keyboard support strong while meeting content-protection requirements.  
**Requirement IDs:** RF-05, RF-06, PI-02, NF-A11Y-02, NF-A11Y-06, IA-08, section 13.1.

#### 2026-06-22T13:42:33+02:00 — Browser language detection

**By:** Mouth  
**What:** Added one-time browser-language detection using `navigator.language` and `sessionStorage` flag `dis-lang-detected`, redirecting first-time Spanish-root visitors to `/en/` or `/fr/` when appropriate.  
**Why:** This satisfies automatic language selection without cookies or personal-data storage. It preserves manual language choice and degrades to visible language links when JS is disabled.  
**Requirement IDs:** RF-02, S9-06, section 9.

#### 2026-06-22T13:42:33+02:00 — Conditional Cloudflare analytics injection

**By:** Mouth  
**What:** Emitted the Cloudflare Web Analytics script only when `CF_ANALYTICS_TOKEN` in `src\config\site.ts` is non-empty; otherwise no analytics script is rendered.  
**Why:** Keeps dev/preview and placeholder builds analytics-free, avoids cookies, aligns with CSP sources, and prevents test traffic or accidental token confusion. The token is public by Cloudflare design.  
**Requirement IDs:** Section 8.3, S9-06, OBJ-SEC-09, CTRL-CSP.

#### 2026-06-22T13:42:33+02:00 — EN/FR translation completeness

**By:** Mouth  
**What:** Replaced all EN/FR TODO translation placeholders and added missing keys across ES/EN/FR for nav, apartment rules, Santa Fe activities/distances, gallery controls, location directions, privacy, and legal text.  
**Why:** Full locale parity prevents Spanish fallback bleed-through, preserves approved CT-13..CT-19 content and slogans, and provides localized SEO terms and legal/privacy language.  
**Requirement IDs:** RF-02, CT-13, CT-14, CT-15, CT-16, CT-17, CT-18, CT-19, section 4.2, section 8.2, S9-04, PI-07.

#### 2026-06-22T13:42:33+02:00 — Frontend YELLOW fix sprint

**By:** Mouth  
**What:** Applied six post-review fixes: added localized skip-to-main link; added `srcset`/`sizes` and owner comments for future Astro `<Picture>` pipeline; generated branded `public\og-image.png` and updated OG/Twitter references; removed robots.txt TODO; standardized HTML/sitemap hreflang to `es-CO/en-US/fr-FR`; changed privacy analytics wording to conditional.  
**Why:** Addressed Chunk and Sloth YELLOW items affecting WCAG 2.4.1, responsive images, social previews, production polish, hreflang consistency, and analytics-policy accuracy.  
**Requirement IDs:** NF-A11Y-01, NF-A11Y-02, NF-A11Y-06, WCAG 2.4.1, NF-IMG-06, SEO-02, SEO-04, SEO-05, SEO-06, PI-04, S9-04, Y5, Y7.  
**Validation:** `npm run build` passed cleanly with 3 pages, skip links in all locales, `og-image.png` present, no TODO in robots/dist HTML, 10 `srcset` occurrences per locale page, and conditional privacy text in ES/EN/FR.

### Sloth / Security Review Decisions

#### 2026-06-22T13:42:33+02:00 — Anticipatory security checklist

**By:** Sloth  
**What:** Created a security, privacy, and content-protection checklist for the static Astro/Tailwind GitHub Pages site, proportional to a public marketing site with no auth, forms, direct payments, reservations, or personal-data storage.  
**Why:** Captured acceptance criteria before implementation so final review could verify repo/build/published evidence without over-implementing harmful content protection.  
**Requirement IDs:** S9-01..S9-10, PI-01..PI-07, OBJ-SEC-01..OBJ-SEC-10, CTRL-HTTPS, CTRL-HSTS, CTRL-CSP, CTRL-XSS, CTRL-CLICKJACKING, CTRL-MIXED-CONTENT, CTRL-DEPENDENCIES, CTRL-SECRETS, ACC-MOZILLA, ACC-DEPENDABOT, ACC-HTTPS-MIXED, ACC-HEADERS, ACC-CONTENT, ACC-PRIVACY, ACC-REPOSITORY, section 13.1.1.

#### 2026-06-22T13:42:33+02:00 — Security review verdict: YELLOW

**By:** Sloth  
**What:** Completed the security review of source, built dist output, and npm audit results. Verdict was **YELLOW**: 33 PASS, 7 YELLOW, 0 RED.  
**Why:** The security architecture is sound, static, no-backend, no-PII, and mostly compliant; however, the site could not publish with the open HIGH Astro CVEs until Data upgraded Astro.  
**Requirement IDs:** S9-01..S9-10, PI-01..PI-07, OBJ-SEC-01..OBJ-SEC-10, CTRL-HTTPS, CTRL-HSTS, CTRL-CSP, CTRL-XSS, CTRL-CLICKJACKING, CTRL-MIXED-CONTENT, CTRL-DEPENDENCIES, CTRL-SECRETS, ACC-HTTPS-MIXED, ACC-CONTENT, ACC-PRIVACY, ACC-MOZILLA, ACC-DEPENDABOT.  
**Findings:** Y1 HIGH Astro audit item; Y2 narrow `.gitignore`; Y3 documented `unsafe-inline`; Y4 unpinned GitHub Actions; Y5 missing OG image; Y6 Cloudflare proxy required for full Observatory A/A+ headers; Y7 privacy wording should be conditional while analytics token is empty.  
**Outcome:** Y1, Y2, Y4 were routed to Data and fixed; Y5 and Y7 were routed to Mouth and fixed; Y3 remains future CSP nonce/hash work; Y6 remains owner action.

### Chunk / QA Decisions

#### 2026-06-22T13:42:33+02:00 — Anticipatory requirements traceability checklist

**By:** Chunk  
**What:** Created a 139-item functional/acceptance traceability checklist from the developer requirements for the Apartasol 1104 Citadela DI Sole website.  
**Why:** Provided an evidence map for the later QA review across functional requirements, information architecture, content correctness, non-functional targets, SEO, analytics, privacy, security, and final acceptance.  
**Requirement IDs:** RF-01..RF-10, IA-01..IA-11, CT-01..CT-19, NF-LH-01..NF-LH-04, NF-CWV-01..NF-CWV-04, NF-COMP-01..NF-COMP-11, NF-A11Y-01..NF-A11Y-06, NF-IMG-01..NF-IMG-06, SEO-01..SEO-16, PRIV-01..PRIV-12, MAT-01..MAT-08, SEC/SEC-FINAL acceptance IDs.

#### 2026-06-22T13:42:33+02:00 — Functional review verdict: YELLOW

**By:** Chunk  
**What:** Completed functional and acceptance review of the built Astro/Tailwind site across source and `dist/`. Verdict was **YELLOW** with roughly 52 pass, 12 partial, 4 fail, and Lighthouse numeric scoring blocked by missing Chrome.  
**Why:** Core architecture, i18n, all 8 sections, 6 slogans, CT-01..CT-19 content, Google Maps exact coords `6.5576942,-75.8321498`, Booking-primary CTA hierarchy, SEO metadata, canonical, hreflang, sitemap, JSON-LD, privacy, and content-protection basics were present. Remaining issues were owner-pending content and a small set of code/security gaps.  
**Requirement IDs:** RF-01..RF-10, IA-01..IA-11, CT-01..CT-19, NF-LH-01..NF-LH-04, NF-CWV-01..NF-CWV-04, NF-A11Y-01..NF-A11Y-06, NF-IMG-01..NF-IMG-06, SEO-01..SEO-16, PRIV-01..PRIV-12, PI-01..PI-07, SEC-04, SEC-05.  
**Findings:** PASS for RF-01..RF-08/RF-10 and all CT items; RF-09 partial because PDFs are owner-pending; NF-IMG responsive pipeline failed before Mouth fix; skip link failed before Mouth fix; Astro HIGH audit failed before Data fix; OG image and robots/hreflang/privacy wording were corrected by Mouth. Lighthouse could not run because Chrome/Chromium was unavailable and Edge was not recognized by `chrome-launcher`; static heuristic estimates were Performance medium risk (~85-92), Accessibility ~88-92, Best Practices ~92-96, SEO ~92-97.  
**Outcome:** Code-owned YELLOW issues were fixed by Data/Mouth; owner-pending launch inputs remain Booking URL, Airbnb URL, real photos, PDFs, Cloudflare Analytics token, distance data, and Cloudflare proxy for final header/Observatory validation.

## Governance

- All meaningful changes require team consensus.
- Document architectural decisions here.
- Keep history focused on work, decisions focused on direction.
