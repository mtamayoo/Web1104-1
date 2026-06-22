# Mouth — History

## Seed (2026-06-22)

- **Project:** Apartasol 1104 Citadela DI Sole — premium family vacation landing page, Santa Fe de Antioquia, Colombia.
- **Stack:** Astro + Tailwind CSS, static, GitHub Pages, Cloudflare Web Analytics.
- **Languages:** Spanish, English, French.
- **Requested by:** mtamayoo
- **My role:** Frontend Developer — own UI, i18n, performance.

---

## 2026-06-22T15:00:08+02:00 — Sprint 1: Full website implementation

**Build result:** ✅ 3 pages built in 1.94s — zero errors, zero warnings

### Components implemented (11 stubs → production-ready)

| Component | Status | Key decisions |
|---|---|---|
| `Nav.astro` | ✅ Complete | Fixed dark navbar, hamburger + mobile drawer, IntersectionObserver active-section, ARIA |
| `LanguagePicker.astro` | ✅ Complete | Flag+code buttons, sessionStorage language detection (RF-02) |
| `Hero.astro` | ✅ Complete | CSS crossfade slideshow (no JS), eager first img (LCP), Booking primary CTA (RF-04) |
| `Apartment.astro` | ✅ Complete | 8-item SVG icon grid, cold-water notice, rules callout, approved text CT-13 |
| `Amenities.astro` | ✅ Complete | 8 icon cards |
| `SantaFe.astro` | ✅ Complete | Two-column layout, activity highlights, distances placeholder (RF-08) |
| `Gallery.astro` | ✅ Complete | `<dialog>` lightbox, Esc/arrows/Tab focus trap, category filter, brand watermark |
| `Location.astro` | ✅ Complete | Google Maps embed + spec button URL (RF-07), "Cómo llegar" section (RF-08) |
| `Materials.astro` | ✅ Complete | 8 PDF cards, pending state, target=_blank rel=noopener (RF-09) |
| `Booking.astro` | ✅ Complete | Dark section, Booking primary ring-4, approved slogans |
| `Footer.astro` | ✅ Complete | `<details>` privacy + legal, PI-07 copyright, language switcher |

### i18n: ES/EN/FR fully complete — zero TODO markers remaining

### Decisions written

1. `mouth-hero-animation.md` — CSS-only crossfade
2. `mouth-gallery-lightbox.md` — native `<dialog>` lightbox
3. `mouth-language-detection.md` — sessionStorage redirect
4. `mouth-analytics-injection.md` — conditional CF token guard
5. `mouth-translations.md` — translation completeness

## 2026-06-22T13:42:33+02:00 — Sprint 2: YELLOW review fixes (6 items)

**Build result:** ✅ 3 pages built — clean, zero errors

### Fixes applied

| ID | Issue | Fix summary |
|---|---|---|
| NF-A11Y-01 | Missing skip-to-main-content link (WCAG 2.4.1 Level A) | Added `.skip-link` anchor as first `<body>` element in `Layout.astro`; CSS hidden→revealed on `:focus-visible`; locale-aware (ES/EN/FR) via `nav.skip_to_content` i18n key |
| NF-IMG-06 | Zero srcset on any image | Added `srcset` + `sizes` to Hero (2 slides) and Gallery (8 thumbs); SVG placeholders use single-entry srcset; prominent code comments added for owner's `<Picture>` upgrade path when real photos arrive |
| SEO-04/05, PI-04 | OG image missing from public/ | Generated `public/og-image.png` (1200×630, 126 KB) via sharp+SVG; amber+sky brand palette; lodging name only (PI-04 compliant); confirmed in all 3 dist HTML pages |
| SEO-02 | TODO comment in robots.txt shipped to prod | Removed `# TODO: update username…` from `public/robots.txt` |
| SEO-06 | hreflang inconsistency HTML vs sitemap | Adopted `es-CO/en-US/fr-FR` everywhere: `Layout.astro`, `LanguagePicker.astro`, `Footer.astro`, `utils.ts` LANG_ATTRS; sitemap already used region codes — now consistent |
| S9-04, Y7 | Privacy policy claims analytics always active | Updated `footer.privacy_text` in ES/EN/FR to conditional phrasing: "Cuando está activado / When activated / Si activé" |

### Decision file

`.squad/decisions/inbox/mouth-frontend-fixes-2026-06-22.md`

### Pending (owner)

Real photos (→ use `<Picture>` per code comments), PDF materials, booking URLs, CF analytics token, Cloudflare proxy activation.


## 2026-06-22T13:42:33+02:00 — Team update: DI Sole website build

Scribe merged the session decision inbox into `.squad\decisions.md`, archived no old decisions, and recorded orchestration/session logs. Data and Mouth resolved the code-owned YELLOW items from Sloth and Chunk: Astro HIGH audit item, .gitignore, SHA-pinned actions, skip link, responsive image attributes, OG image, robots cleanup, hreflang consistency, and privacy wording. Final build is clean with npm audit at 0 Critical / 0 High; owner-pending items remain Booking/Airbnb URLs, real photos, PDFs, Cloudflare Analytics token, distance data, and Cloudflare proxy for Observatory validation.
