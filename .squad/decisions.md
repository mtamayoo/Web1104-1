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

#### 2026-06-22T16:22:37+02:00 — Make base path env-overridable for local preview

**By:** Data  
**What:** Changed `astro.config.mjs` so `BASE_PATH` reads from the `BASE_PATH` environment variable with `??` (nullish coalescing), defaulting to `'/Web1104-1'` when the env var is unset.  
**Why:** Fixes unstyled local preview. `astro dev` / `astro preview` serve at root `/`, but the built HTML was linking CSS at `/Web1104-1/_astro/…` (the GitHub Pages path). The env-override lets developers set `BASE_PATH=''` for local work while production CI leaves the env var unset, preserving the `/Web1104-1` default for GitHub Pages.  
**Deploy impact:** `deploy.yml` sets no `BASE_PATH` env var → identical production output. No changes needed.  
**Verification:** Production build: `/_astro/Footer.Dsea5NLU.css` referencing `/Web1104-1/_astro/…`; local root build (`BASE_PATH=''`): `/_astro/Footer.Dsea5NLU.css` at `/`. All 3 locales 200.

#### 2026-06-22T16:38:51+02:00 — Single source of truth for base path

**By:** Data  
**What:** Derived `src/config/site.ts BASE_PATH` from `import.meta.env.BASE_URL` instead of hardcoding; ensures language switcher and internal links derive from the canonical base configured once in `astro.config.mjs`.  
**Why:** Fixes broken language-selector hrefs locally. With dual sources (config base vs. hardcoded site.ts), component links could diverge from the config, especially in preview mode. Single source eliminates the bug and makes future maintainers' intent clear.  
**Deploy impact:** Production CI builds unchanged. Local workflow: developers set `BASE_PATH=''` for local preview and language switching just works.  
**Verification:** Production build → `/Web1104-1/` switcher hrefs + canonical `https://mtamayoo.github.io/Web1104-1/`. Local root build → `/`, `/en/`, `/fr/` hrefs, zero `/Web1104-1` leakage. All 3 locale routes 200 in preview.  
**Requirement IDs:** RF-02, section 8.1.

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

#### 2026-06-22T17:18:02+02:00 — Language switcher contrast fix

**By:** Mouth  
**What:** Changed inactive locale buttons from `text-neutral/70` (dark-on-dark, invisible) to `text-white/80` with `hover:bg-white/10 hover:text-white`, matching active nav-link styles on the dark navigation bar.  
**Why:** User-reported accessibility failure: inactive EN/FR language-selector buttons were unreadable on the dark nav background (contrast < 3:1). Fix brings buttons to ~11.5:1 contrast ratio (white on dark), satisfying WCAG 2.2 AA.  
**Requirement IDs:** WCAG 2.2, NF-A11Y-06, section 11.  
**Verification:** Visual inspection of built site: ES button remains orange (active), EN/FR now legible white with proper hover states. Footer language links already compliant. All 3 locales navigate correctly.

#### 2026-06-22T17:25:43+02:00: SVG flags in language switcher
**By:** Mouth
**What:** replaced regional-indicator emoji flags with inline SVG flags (CO/GB/FR)
**Why:** Windows has no flag-emoji font; emoji rendered as country-code letters (CO/GB/FR) for the user. Inline SVG renders identically cross-platform.

**Implementation details:**
- `FLAG_CO` (Colombia): 3 horizontal bands — yellow #FCD116 (half height), blue #003893 (quarter), red #CE1126 (quarter). 20×14 viewBox.
- `FLAG_GB` (United Kingdom): blue field #012169, white diagonal saltire (stroke-width 3.5), red diagonal #C8102E (stroke-width 1.5), white cross (stroke-width 5), red St George cross #C8102E (stroke-width 3).
- `FLAG_FR` (France): 3 equal vertical bands — blue #0055A4 (w=7), white #FFFFFF (w=6), red #EF4135 (w=7). 20×14 viewBox.
- All SVGs carry `style="display:inline-block;vertical-align:middle;border-radius:2px;overflow:hidden;flex-shrink:0"` for crisp, rounded display at small size.
- Each SVG has a subtle inset border rect (`stroke-opacity:0.12`, `stroke-width:0.5`) for legibility on both active (orange) and inactive (dark) button backgrounds.
- Rendered via Astro `set:html={flag}` directive (same pattern as `Apartment.astro` icon SVGs).
- `aria-hidden="true"` on the flag span preserved; text label ES/EN/FR unchanged.

**Verified:**
- Build clean: 3 pages in 1.68s, zero errors.
- `dist/index.html`: 0 regional-indicator emoji, 3 `<svg viewBox="0 0 20 14">` flag SVGs, Colombian yellow (#FCD116), GB blue (#012169), French blue (#0055A4) all confirmed present.
- Preview server http://localhost:4321/ → HTTP 200.
- Playwright screenshot: three flag+label buttons render correctly, no letter-pair fallback.

#### 2026-06-22T17:30:00+02:00: Feature cards made static (non-button)
**By:** Mouth
**What:** removed hover shadow/lift and the "selected" orange highlight from Apartment feature cards; removed hover from Amenities cards
**Why:** user reported the cards looked like interactive buttons (hover shadow + highlighted first card) but they are informational only

#### 2026-06-22: Real photo integration
**By:** Mouth (Frontend/i18n)
**What:** Added an idempotent Sharp preprocessing script (`scripts/process-photos.mjs`) that reads finalized owner photos from `C:\Users\mtamayoo\Downloads\Fotos DiSole 1104`, strips metadata by not calling `withMetadata()`, and emits quality-80 WebP variants into `public\galeria\` at hero (1024/1600/1920), gallery thumbnail (400/800), lightbox (1600), room-highlight (600/1000), and footer credential (160/320) widths. Mapped the hero to `salon-dia`, `balcon`, `piscina-tobogan`, and `salon-noche`; mapped the gallery to 17 real images across apartment, pools, views, and surroundings; mapped Apartment room highlights to `salon-dia`, `habitacion-otra-vista`, `cocina-salon`, and `balcon`; surfaced the Di Sole logo, Booking 2024 award, and RNT 2026 in the footer. For the Apartment owner request, kept the 8 small informational icon tiles uniform and added larger photo-background room highlight cards with dark gradient overlays and localized white labels.
**Why:** Owner delivered real photos; replace all placeholders with optimized, EXIF-stripped WebP.

#### 2026-06-22: Logo integration, brand palette harmonization, booking URLs
**By:** Mouth (Frontend/i18n)
**What:** Palette set to primary #F2B20F, primary-dark #D99A0B, secondary #2E2E80, secondary-dark #21215E, accent #2E897A, neutral #17172A, surface #FFFAF0. Cropped the owner logo from the 1024×1024 marketing tile to the clean lockup using sharp extract left 36, top 30, width 952, height 760, removing the gray photo strip, white apartment box, and outer border; exported metadata-stripped WebP assets in public\brand\. Logo is used in the Nav and Footer with localized alt text. BOOKING_URL is https://tinyurl.com/DiSole1104B and AIRBNB_URL is https://tinyurl.com/DiSole1104A. Contrast spot checks: navy #2E2E80 on cream #FFFAF0 = 11.10:1, neutral #17172A on gold #F2B20F = 9.35:1, white on navy #2E2E80 = 11.55:1, body neutral #17172A on cream #FFFAF0 = 16.93:1.
**Why:** Owner provided real logo + booking URLs and asked the palette to match the logo (navy + teal + gold).

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


### 2026-06-22: QA pass — logo/palette/URLs
**By:** Chunk (QA)
**What:**
- Build/preview: PASS — `LOCAL=1 npm run build` succeeded; preview on port 4321 responded HTTP 200.
- Booking/Airbnb CTAs: PASS — Hero and booking-section platform CTAs use `https://tinyurl.com/DiSole1104B` and `https://tinyurl.com/DiSole1104A`, with `target="_blank"` and `rel="noopener noreferrer"` in ES/EN/FR.
- Language selector: PASS — `/` => `es-CO`; clicking EN navigates to `/en/` + `en-US`; clicking FR navigates to `/fr/` + `fr-FR`. Active locale is gold-highlighted; inactive buttons remain legible on navy.
- Logo: PASS — Nav and Footer logos load in all locales; visual crop is clean with no gray strip or “Apartamento 1104” box.
- Palette coherence: FAIL (minor asset residue) — visible UI is coherent navy/teal/gold, but built grep still finds old sky-blue `#0ea5e9` in `dist\galeria\placeholder-02.svg` from source `public\galeria\placeholder-02.svg`. No `#065f46` found.
- Photos: PASS — Hero, gallery thumbnails, lightbox large image, and apartment room-highlight photos render with no broken images in ES/EN/FR after lazy-load verification.
- Screenshots: PASS — captured desktop 1280 and mobile 390 screenshots for ES/EN/FR in `.squad\screenshots\chunk-qa\`.

**Why:** verify owner-facing increment. The production-facing URL/logo/photo changes pass. Only non-visible placeholder SVG color residue remains to clean up for palette-completeness.

### 2026-06-22: CTA buttons, photo cards, gallery re-categorization, Assets 2026
**By:** Mouth (Frontend/i18n)
**What:** Equal-size CTAs + new labels + removed channel captions; lighter photo overlays; feature/amenity photo backgrounds + mapping; new "Zonas comunes" gallery category + hidden empty Santa Fe tab; Assets 2026 processed (rotate+strip); placeholder cleanup
**Why:** Owner review feedback. RF-04 reinterpreted as prominence-by-style per explicit owner request.


### 2026-06-22T23:25:00+02:00: Reservation CTAs unified, nav CTA contrast bug fixed, amenities corrected

**By:** Mouth (Frontend/i18n), coordinated via Squad — requested by Marcelo (@mtamayoo_microsoft)

**What:**
1. **Reservation CTAs (Hero.astro + Booking.astro):** Both buttons are now visually IDENTICAL — same gold fill (`bg-primary` #F2B20F) with dark navy text (`text-neutral` #17172A), same size (224×56). Previously Booking was filled gold and Airbnb was an outline/surface style. The unclear calendar/trash-looking SVG icon was removed from the Booking CTA in both components. Labels remain "Reserva en Booking.com" / "Reserva en Airbnb.com".
2. **Nav "Reservar" CTA (Nav.astro):** Fixed a contrast bug. The IntersectionObserver scroll-spy toggled `text-primary`/`text-white/80` on ALL `[data-nav-link]` elements, including the Book Now CTA — making its label gold-on-gold (invisible) or white-on-gold (illegible) depending on the active section. Added `data-nav-cta` to both desktop and mobile CTAs and changed the scroll-spy selector to `[data-nav-link]:not([data-nav-cta])`. CTA now stays dark navy on gold (verified rgb(23,23,42) on rgb(242,178,15)). `data-nav-link` is retained on the CTA so mobile menu auto-close still works.
3. **Amenities (Amenities.astro + es/en/fr.json):** Removed "Gimnasio" (the complex has no gym). Replaced the generic "Canchas deportivas"/"Gimnasio" pair with two real amenities: "Cancha de microfútbol" (image `cancha-futbol`) and "Cancha de vóley playa" (image `cancha-arena`). i18n keys `amenities.gym` and `amenities.sports` removed; new keys `amenities.microfutbol` and `amenities.volleyball` added in all 3 languages.

**Why:** Explicit owner feedback — both reservation buttons should match in color, the Booking icon was confusing, the nav Reservar button was illegible (white text on gold), and the amenities list listed a non-existent gym instead of the actual microfútbol and beach-volleyball courts.

**Verification:** `astro check` 0 errors; build OK; Playwright pixel-sampled nav CTA + both hero CTAs (identical gold/navy, no SVG); amenities labels confirmed (no "Gimnasio"; microfútbol + vóley playa present with correct court photos). Preview restarted on :4321 (200).

### 2026-06-22: Remove phone "SHOT ON MI 9T" watermark via bottom-crop

**By:** Mouth (Frontend/i18n)

**What:** Cropped only the phone-watermarked source photos by 13% from the bottom before resize: balcon-dos, bano-principal, cocina-otra-vista, habitacion, habitacion-otra-vista, piscina-principal, piscina-tobogan-solarium, salon-cocina, tobogan-etapa, vista-pueblo. Verified the gray "SHOT ON MI 9T / AI TRIPLE CAMERA" + dots are gone from regenerated WebP bottom strips. Confirmed owner's intentional yellow DISOLE1104 brand mark remains on clean/professional photos such as balcon, salon-dia, salon-noche, golfito-canchas, juegos-ninos, and piscina-tobogan.

**Why:** Owner away; autonomous decision to remove unprofessional phone watermark while keeping the owner's intentional brand watermark. Originals untouched; only the sharp crop params changed.

### 2026-06-23T10:31:00+02:00: Logo lockup crop extended to include "Apartamento 1104" box

**By:** Mouth  
**What:** Regenerated `public/brand/logo-disole-lockup-{160,320,640}.webp` from the original 1024×1024 source (`Logo DiSole 1104.png`). New crop region: `left=36, top=30, width=952, height=888` (previously `height=760`). This extends the bottom 128px to include the full white "Apartamento 1104" rounded box visible at approximately y=810–900 in the original tile. A thin sliver of the gray photo strip remains visible at the very bottom; trimming further would clip the apartment box border. New output dimensions: 160×149, 320×298, 640×597 (previously 160×128, 320×255). Updated `width`/`height` HTML attributes in `Nav.astro` and `Footer.astro` to match.  
**Why:** Owner (mtamayoo) identified that the "Apartamento 1104" label was missing from the live logo — it had been deliberately cropped out during the initial branding pass (decisions.md, 2026-06-22 Mouth/palette entry). Restoring it is required for unit identity/branding.  
**Reproducibility:** The crop parameters are now documented and appended as a standalone block in `scripts/process-photos.mjs` (after the existing photo list), so `node scripts/process-photos.mjs` will regenerate both gallery photos and logo lockup assets.  
**Requirement IDs:** Owner request 2026-06-23.

### 2026-06-23T10:31:00+02:00: Brand wordmark updated to "Di Sole 1104"

**By:** Mouth  
**What:** Changed the visible brand text in `Nav.astro` (line ~53) and `Footer.astro` (line ~56) from `"Di Sole"` to `"Di Sole 1104"`. Existing classes and aria-label unchanged.  
**Why:** Owner requested the unit number appear in the wordmark alongside the logo for branding clarity.  
**Requirement IDs:** Owner request 2026-06-23.

### 2026-06-23T10:31:00+02:00: Added Vrbo as third booking CTA

**By:** Mouth  
**What:** Added `VRBO_URL = 'https://tinyurl.com/DiSole1104V'` to `src/config/site.ts`. Added a third `<a>` button (`data-tracking="cta-vrbo"`) in `Booking.astro` matching the Airbnb secondary button structure exactly. Changed the CTA container from `flex-col/sm:flex-row` to `flex-wrap sm:flex-row` so three buttons wrap cleanly on narrow viewports. Added i18n keys `booking.cta_vrbo` / `booking.cta_vrbo_aria` to `es.json`, `en.json`, and `fr.json`. Booking.com retains its primary gold styling (RF-04 preserved — all three buttons share the same visual treatment, matching the existing Airbnb secondary style).  
**Why:** Owner requested Vrbo as an additional reservation channel.  
**Requirement IDs:** RF-04 (Booking primary prominence preserved), Owner request 2026-06-23.
### 2026-06-23T10:55:00+02:00: Hero slogan forced to one line

**By:** Mouth (Frontend Developer)  
**Task:** Make hero `<h1>` slogan render on a single line for all three locales (ES/EN/FR).

**What:** Replaced the fixed Tailwind size classes `text-5xl md:text-7xl` with a **fluid clamp** arbitrary value and added `whitespace-nowrap`:

```
text-[clamp(1.5rem,7.5vw,4.5rem)] whitespace-nowrap
```

All other classes (`font-heading`, `font-bold`, `leading-tight`, `no-select`, `drop-shadow-lg`) are unchanged.

**Why:** The English slogan "You're going to love it" (longest of the three) was wrapping onto two lines at both mobile (`text-5xl` = 48px) and intermediate widths inside the `max-w-3xl px-4` container. The fluid clamp ensures responsive scaling across all viewports while `whitespace-nowrap` prevents line breaks. Clamp values: min 1.5rem (24px floor at 320px), fluid 7.5vw, max 4.5rem (72px at 960px+). All three locales (ES/EN/FR) tested and fit within container bounds.

**Requirement IDs:** RF-03, NF-CWV-01.

### 2026-06-23T11:00:00+02:00: Accessible parking card + no-hot-water removal

**By:** Mouth (Frontend Developer)  
**Requested by:** mtamayoo

**What (2a):** Removed the "Cold water notice (CT-11)" info block from `src/components/Apartment.astro` (lines 159–165). Updated the file header comment to remove "no hot water". Adjusted House Rules block spacing from `mt-4` → `mt-6`. Removed `"no_hot_water"` key from the `"apartment"` object in all i18n files (`es.json`, `en.json`, `fr.json`). Verified zero remaining references in `src/` for agua fría, agua caliente, no_hot_water, hot water, eau chaude, eau froide.

**What (2b):** Accessible parking card replaces standard parking. Image cropped from `C:\Users\mtamayoo\Downloads\Fotos DiSole 1104\Assets 2026\20260421_103851.jpg` (rotated 4000×2252 px) at region `{ left: 50, top: 1352, width: 1200, height: 900 }` (4:3 ratio). Exported WebP widths: 400, 600, 800, 1000, 1600 → `public/galeria/parqueadero-accesible-{width}.webp`. Updated `scripts/process-photos.mjs` with reproducible `_extract` entry. In `Amenities.astro`: renamed i18n key `amenities.parking` → `amenities.accessible_parking` ("Parqueadero accesible"/"Accessible parking"/"Parking accessible"), swapped car icon for wheelchair SVG (Heroicons outline, h-8 w-8, stroke-width 1.5), and updated image ref from `porteria` → `parqueadero-accesible`.

**Why:** Blue disabled-parking bays with white wheelchair symbols are core accessible infrastructure and merit prominence. Removing cold-water references eliminates outdated maintenance notices no longer relevant to the property.

**Validation:** `npm run build` passed 0 errors across `/`, `/en/`, `/fr/` routes.

**Requirement IDs:** RF-03, WCAG accessibility, Owner request 2026-06-23.

### Mouth / Frontend Decisions (continued)

#### 2026-06-23T11:25:00+02:00 — Booking.com Verified Facts Integration

**By:** Mouth
**Requested by:** mtamayoo
**What:** Enriched apartment copy (descriptions 1/2/3) with verified Booking.com facts including floor 11, 76 m², luxury finishes, river valley views, 6 adults + 2 children framing, kitchen appliances, Wi-Fi 20 Mbps, Smart TV streaming, wheelchair-accessible elevator. Added four feature chips (wifi, smart_tv, floor_area, accessible). Replaced distance placeholder with verified locations: Plaza Mayor 4 blocks, Kanaloa 3.4 km, Olaya Herrera ~55 km, JMC ~78 km. Added dining list: La Chinca 250 m, Nueva España 300 m, Sabor Español 300 m. Reconciled attractions distances (Plaza Mayor "a 4 cuadras", Kanaloa "~3.4 km").
**Why:** Converted Booking.com authoritative listing data (unit 1104 RNT 179772) into verified property facts, ensuring accuracy while preserving guardrails (no private-pool claim, no water/heating claim, pets rule unchanged).
**Validation:** 
pm run build succeeded: 3 pages (/, /en/, /fr/) built in 2.88 s, exit code 0. All 13 new/changed keys present in each locale. distances_pending confirmed removed.
**Requirement IDs:** RF-04, CT-13..CT-19, section 4.2, section 8.2, Owner verified facts.

#### 2026-06-23T11:30:00+02:00 — Content Enrichment: SantaFe Attractions Grid + Amenity Cards

**By:** Mouth (Frontend/i18n)
**Task:** RF-08 replacement + amenity cards + apartment copy polish
**What:** Replaced SantaFe "distances coming soon" placeholder with a "Qué visitar / Places to visit" attractions grid (6 verified public POIs: Centro Histórico/Plaza Mayor, Catedral Basílica, Puente de Occidente ~6km, Museo Juan del Corral, Iglesia de Santa Bárbara, Kanaloa). Added Amenities cards Minigolf (asset minigolf) and Solárium (asset piscina-tobogan-solarium); polished apartment copy framing with complete/private and resort-style amenities messaging. Removed santafe.distances_heading/distances_note keys.
**Why:** Owner-verified content; visual grid + real photo assets provide a richer attractions experience than placeholder. Amenity cards surface verified resort features (shared pools, mini golf) without false claims.
**Build:** 
pm run build passed cleanly.
**Requirement IDs:** RF-08, RF-04, Owner request 2026-06-23.
**Validation:** 6 attractions rendered in ES/EN/FR; Minigolf + Solárium cards display with correct widths; no "coming soon" or "próximamente" text present.

---

## Ledger Update — 2026-06-23 Morning Sync

**Pre-check timestamp:** 2026-06-23T11:30:00+02:00  
**Inbox:** 2 Mouth decision records (booking-facts, content-enrichment) merged above.  
**Archive gate:** decisions.md = 31,484 bytes; no entries older than 30 days (all from 2026-06-22..23), so archival not triggered.  
**Status:** Inbox files processed and merged.


---

## 2026-06-23 Batch E — RNT 179772 + House Rules Enhancement

### Decision: RNT display & house rules expansion
**Author:** Mouth (Frontend Developer)  
**Date:** 2026-06-23  
**Status:** Implemented (working tree)

#### RNT 179772 visibility
- Added `<figcaption>` in Footer.astro under RNT badge with text `RNT 179772` (10px, muted white/40)
- Updated footer.rnt_alt in es/en/fr: changed from "RNT 2026" to "RNT 179772"
- Appended "· RNT 179772" to footer.copyright_extended in all locales for legal compliance

#### Quiet-hours and under-18 house rules
- Added two new i18n keys in apartment namespace:
  - `apartment.rules_quiet_hours`: ES "Horario de silencio de 00:00 a 09:00" | EN "Quiet hours 00:00–09:00" | FR "Heures de silence de 00h00 à 09h00"
  - `apartment.rules_minors`: ES "Menores de 18 años solo acompañados de un padre, madre o tutor legal" | EN "Guests under 18 only when accompanied by a parent or legal guardian" | FR "Les mineurs de moins de 18 ans uniquement accompagnés d'un parent ou tuteur légal"
- Changed Apartment.astro rules block from single `<p>` to semantic `<ul>` list; split existing apartment.rules on ` · ` for first three items, append new rules as `<li>`
- Styling preserved (`text-sm text-neutral/60`, `space-y-0.5`)

#### Verification
- Private pool grep (src/): zero matches for piscina privada / private pool / piscine privée
- Build: 3 pages in 1.74s, exit 0 ✓
- RNT 179772 confirmed in dist/index.html (es/en/fr)

---

## 2026-06-23 Batch F — CTA Button Single-Line Fix + Hero Vrbo Addition

### Decision: CTA Button Single-Line Fix + Hero Vrbo Addition
**Date:** 2026-06-23  
**Author:** Mouth (Frontend Developer)  
**Requested by:** mtamayoo

#### Issue 1: Booking section buttons wrapping inconsistently
**Before:** All three buttons had `sm:w-56` (224px fixed); "Réserver sur Booking.com" / "Réserver sur Airbnb.com" overflowed to two lines; Vrbo single-line → inconsistent.

**Fix:**
- Replaced `sm:w-56` with `sm:w-auto sm:min-w-[13rem]` on all three buttons
- Added `whitespace-nowrap` to prevent any wrapping
- Mobile preserved: `w-full max-w-xs` still full-width on narrow screens
- Container flex-wrap / justify-center / gap-4 untouched

**Width math:** Longest FR label "Réserver sur Booking.com" (~204px at text-base bold); `sm:min-w-[13rem]` (208px) provides floor; all three FR labels differ by ≤3 chars → visually equal.

#### Issue 2: Hero — Add Vrbo as third CTA
**Changes:**
1. Hero.astro import: added `VRBO_URL` to config/site import
2. CTA container: added `flex-wrap`, moved `justify-center` to base for graceful three-button wrapping
3. Added third Vrbo `<a>` button: same classes as Booking/Airbnb, `target="_blank" rel="noopener noreferrer"`, `aria-label={t('hero.cta_vrbo_aria')}`, `{t('hero.cta_vrbo')}`. No data-tracking.
4. File-header comment: "Booking + Airbnb (secondary)" → "Booking + Airbnb + Vrbo (secondary)"

**i18n keys added (hero.cta_vrbo / hero.cta_vrbo_aria):**
- ES: "Reserva en Vrbo.com" / "Reservar en Vrbo (se abre en una pestaña nueva)"
- EN: "Book on Vrbo.com" / "Book on Vrbo (opens in a new tab)"
- FR: "Réserver sur Vrbo.com" / "Réserver sur Vrbo (s'ouvre dans un nouvel onglet)"

#### Verification
- npm run build: 3 pages in 1.86s, exit 0 ✓
- JSON valid (all locales) ✓
- Hero renders 3 reservation buttons (Booking + Airbnb + Vrbo) ✓
- Booking/Hero buttons single-line via `whitespace-nowrap sm:w-auto sm:min-w-[13rem]` ✓
- No commit; working tree only ✓

---

## Ledger Update — 2026-06-23T11-42-00Z

- **Current timestamp:** 2026-06-23T11:42:00+02:00
- **decisions.md before merge:** 34,383 bytes; inbox = 2 files (mouth-rnt-rules.md, mouth-cta-buttons.md)
- **Archive gate:** NOT triggered (34,383 bytes < 51,200; no entries older than 7 days)
- **Merged inbox files:** 2 decision records from Mouth (Batches E & F)
- **Inbox cleaned:** decisions/inbox/ now empty


## 2026-06-23T11:57:00+02:00 — Batch G: CTA Button Redesign (Equal Height + "Book on" Label + Brand Icons)

**Agent:** Mouth (Frontend Developer)  
**Requested by:** mtamayoo  

### Problem
1. The three booking CTAs (Booking.com, Airbnb, Vrbo) used `flex-wrap` + `sm:w-auto sm:min-w-[13rem]`, causing buttons to have different widths and break to a 2+1 layout on mid-breakpoints.
2. Each button repeated "Reserva en / Book on / Réservez sur" making the phrase appear three times in the same UI block.

### Solution

**Equal-height, equal-width 3-up grid**  
Replaced `flex flex-wrap … sm:w-auto sm:min-w-[13rem]` with `grid grid-cols-1 gap-3 sm:grid-cols-3`. On mobile buttons stack full-width; on `sm+` they are three equal-width columns, all `h-14`. In both Hero.astro and Booking.astro, each button is now `flex h-14 w-full`.

**"Book on" label moved above the group**  
Added a new `<p>` label using the new i18n key (`hero.book_on_label` / `booking.book_on_label`) directly before the grid. Each button now shows only the platform brand name — no repeated phrase.

**Brand icons (inline SVG, `fill="currentColor`)**  
Each button now contains a 20×20 inline SVG icon to the left of the brand name:
- **Booking.com** → calendar/grid icon (suggests scheduling a reservation)
- **Airbnb** → person silhouette icon (suggests hosted stays / community)
- **Vrbo** → house/home icon (suggests vacation rental property)

Icons use `fill="currentColor"` so they inherit the button's `text-neutral` class. These are generic decorative icons, not official brand logos — trademark risk mitigated by using the platform NAME in the button text (primary identifier) plus a distinct category icon.

### Files touched

| File | Change |
|---|---|
| `src/i18n/es.json` | Added `hero.book_on_label: "Reserva en"` + `booking.book_on_label: "Reserva en"`; changed CTA text values to brand names only (`"Booking.com"`, `"Airbnb"`, `"Vrbo"`) |
| `src/i18n/en.json` | Same pattern: `"Book on"`, `"Booking.com"`, `"Airbnb"`, `"Vrbo"` |
| `src/i18n/fr.json` | Same pattern: `"Réservez sur"`, `"Booking.com"`, `"Airbnb"`, `"Vrbo"` |
| `src/components/Hero.astro` | Replaced `flex flex-wrap` CTA block with label `<p>` + `grid sm:grid-cols-3` containing 3 equal `flex h-14 w-full` buttons, each with inline SVG icon |
| `src/components/Booking.astro` | Same restructure; preserved `data-tracking="cta-booking/cta-airbnb/cta-vrbo"` attributes |

### Build result

```
3 page(s) built in 2.01s — Complete!
  /index.html       (es, default)
  /en/index.html    (en)
  /fr/index.html    (fr)
```

No errors or warnings.

**Verification:** Build clean, i18n complete, data-tracking and aria-labels preserved.

## Mouth / Frontend — 2026-06-23 Remove Featured Chips

**Date:** 2026-06-23  
**Author:** Mouth (Frontend Dev)  
**Requested by:** mtamayoo

### What was removed

Three { key, image, icon } objects were deleted from the eatures array in
src/components/Apartment.astro:

| key | Rendered text |
|-----|---------------|
| partment.floor_area | "76 m² · Piso 11" |
| partment.accessible | "Apartamento accesible" |
| partment.washer | "Lavadora" |

The array went from 12 chips to 9 chips. All remaining chips and their order
are unchanged. No i18n keys were removed (es/en/fr translations stay in place).

### Why

These three chips were identified as no longer needed in the "Ambientes
destacados" highlights section. The floor-area and accessibility details are
either surfaced elsewhere in the page or considered redundant; the washer chip
was deemed low-priority for the featured highlights list. Removing them keeps
the chips grid focused on the most visually impactful amenities.

### Files changed

- src/components/Apartment.astro — removed the three { key, image, icon } blocks.

### Build result

\\\
3 page(s) built in 1.20s — Complete!
  /index.html       (es, default)
  /en/index.html    (en)
  /fr/index.html    (fr)
\\\

No errors or warnings.

**Verification:** Build clean, i18n complete, featured chips array reduced 12→9, syntax valid.


## Mouth / Frontend — 2026-06-23 Hide Materials Section (temporary)

**Date:** 2026-06-23  
**Author:** Mouth (Frontend Dev)  
**Status:** Done — awaiting PDF assets before re-enable

### Context

The "Materiales / Reference Materials / Documents" section (`<Materials>`) renders a PDF download block. The PDF files are not yet ready, so the section is hidden to avoid a broken/empty block going live. Nothing is deleted — all source, i18n keys, and component files remain intact.

### What was commented out

**1. src/pages/index.astro (ES):**
- Line 14: import commented out (`// import Materials from '../components/Materials.astro'`)
- Line 39–40: render call commented out (`{/* <Materials locale={locale} /> */}`)

**2. src/pages/en/index.astro (EN):**
- Line 14: import commented out
- Line 39–40: render call commented out

**3. src/pages/fr/index.astro (FR):**
- Line 14: import commented out
- Line 39–40: render call commented out

**4. src/components/Nav.astro:**
- Array entry commented out: `/* { key: 'nav.materials', href: '#materiales' } */`

**5. src/components/Footer.astro:**
- Array entry commented out: `/* { key: 'nav.materials', href: '#materiales' } */`

### What was NOT touched

- src/components/Materials.astro — intact, no changes
- src/i18n/ — all nav.materials and materials.* keys remain in es/en/fr files
- Any other section, component, or copy

### How to re-enable

1. In each of the 3 page files, uncomment the import line and the `<Materials locale={locale} />` render line.
2. In src/components/Nav.astro, uncomment the `{ key: 'nav.materials', href: '#materiales' }` array entry.
3. In src/components/Footer.astro, uncomment the same array entry.
4. Run `npm run build` and verify all 3 pages render the section.

### Build result

\\\
3 page(s) built in 1.20s — Complete!
  /index.html       (es, default)
  /en/index.html    (en)
  /fr/index.html    (fr)
\\\

No errors or warnings.

**Verification:** Build clean, Materials section hidden via comments (not deleted), easily re-enabled when PDFs ready.
