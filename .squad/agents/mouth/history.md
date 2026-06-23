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

## 2026-06-22 — Brand-name typo fix`n- Replaced all 51 occurrences of `DI Sole` / `DI SOLE` → `Di Sole` across 13 source files (src + public).`n- Regenerated public/og-image.png (1200×630, sharp+SVG) with corrected brand mark `✦ Di Sole`.`n- Build clean; dist HTML: zero `DI Sole`/`DI SOLE`, `Di Sole` confirmed in all 3 locale pages (es/en/fr).
2026-06-22T17:18:02+02:00 — Fixed WCAG contrast on inactive LanguagePicker buttons in Nav: text-neutral/70 → text-white/80 hover:bg-white/10 hover:text-white
2026-06-22T17:25:43+02:00 — Replaced emoji flags in LanguagePicker with inline SVG flags (CO/GB/FR); build clean, verified no regional-indicator chars in dist.

2026-06-22T17:30:00+02:00 — Removed hover effects and orange 'selected' highlight from Apartment feature cards and Amenities cards; all cards now static/uniform (non-interactive).
## 2026-06-22T17:39:59.721+02:00 — Real photos, logo, and brand palette

- Reuse the Sharp image pipeline in scripts/process-photos.mjs: source owner photos, do not call withMetadata() (EXIF stripped), emit WebP assets into public\galeria\, and keep responsive srcset widths for hero (1024/1600/1920), gallery thumbnails (400/800), lightbox (1600), room highlights (600/1000), and footer credentials (160/320).
- Brand palette now follows the real logo: gold #F2B20F, navy #2E2E80, and teal #2E897A (with existing darker/supporting tokens derived from these).

## 2026-06-22T17:39:59.721+02:00 — CTA/photo/Assets 2026 owner-review follow-up

- Assets 2026 phone photos need sharp `.rotate()` before metadata strip.
- Gallery categories are apartment / pools (+amenities) / views / complex, with Santa Fe (surroundings) hidden while empty.
- Reservation CTAs are equal-size; Booking is filled-gold primary by style, not size (RF-04 reinterpreted per owner).


## 2026-06-23T10:31:00+02:00 — Owner branding & VRBO fixes

Completed three owner-requested fixes on live site:

1. **Logo lockup crop extended:** Regenerated `public/brand/logo-disole-lockup-{160,320,640}.webp` with crop height 760→888px to restore the full "Apartamento 1104" white box. Updated `Nav.astro` (149px height) and `Footer.astro` (298px height). Crop params now documented and reproducible via `scripts/process-photos.mjs` append block.

2. **Brand wordmark:** Updated visible text in `Nav.astro` (line ~53) and `Footer.astro` (line ~56) from `"Di Sole"` → `"Di Sole 1104"`. Existing styling/aria unchanged.

3. **VRBO booking channel:** Added `VRBO_URL = 'https://tinyurl.com/DiSole1104V'` to `src/config/site.ts`. Added third `<a>` button in `Booking.astro` (data-tracking="cta-vrbo") with flex-wrap layout for responsive stacking. Added i18n keys `booking.cta_vrbo` / `booking.cta_vrbo_aria` to es/en/fr.json. All three buttons now share secondary style matching (gold fill, navy text); Booking.com primary prominence (RF-04) preserved.

**Verification:** Build passed, astro check clean, i18n complete.


## 2026-06-23T11:05:00+02:00 — Hero slogan one-line + accessible parking

Completed two frontend sprints:

**Batch A — Hero slogan one-line:** Replaced `text-5xl md:text-7xl` with `text-[clamp(1.5rem,7.5vw,4.5rem)] whitespace-nowrap` on `<h1>` in Hero.astro. EN "You're going to love it" (11.75em @ 27px = 317px) now fits within 328px container clearance at 360px mobile. All locales (ES/EN/FR) fit single line. Clamp floor 1.5rem (24px), ceiling 4.5rem (72px), fluid 7.5vw. Build ✅.

**Batch B — Accessible parking + no-hot-water cleanup:**
- Removed "Cold water notice (CT-11)" block from `src/components/Apartment.astro` (lines 159–165); removed `apartment.no_hot_water` i18n key from es/en/fr.json; verified zero refs in src/ for agua fría/caliente, hot/cold water, eau chaude/froide.
- Cropped accessible-parking image from Assets 2026 (left:50, top:1352, width:1200, height:900) → `public/galeria/parqueadero-accesible-{400,600,800,1000,1600}.webp`.
- Updated `Amenities.astro`: key `amenities.parking` → `amenities.accessible_parking`; icon car SVG → wheelchair SVG (Heroicons); image `porteria` → `parqueadero-accesible`.
- Updated i18n: "Parqueadero accesible" (ES), "Accessible parking" (EN), "Parking accessible" (FR).
- Added reproducible `_extract` entry to `scripts/process-photos.mjs`.
- Build ✅ passed all 3 locales.

**Decisions merged:** `mouth-hero-slogan-oneline.md` + `mouth-accessible-parking.md` → `decisions.md`; inbox files deleted.


## 2026-06-23T11:30:00+02:00 — Batch C & D: Content Enrichment + Verified Booking Facts

Completed two owner-verified content enrichment batches:

**Batch C — SantaFe Attractions Grid + Amenities Cards:**
- Replaced RF-08 "distances coming soon" placeholder with verified attractions grid (6 POIs: Centro Histórico/Plaza Mayor, Catedral Basílica, Puente de Occidente ~6km, Museo Juan del Corral, Iglesia de Santa Bárbara, Kanaloa). Removed santafe.distances_heading/distances_note keys.
- Added Amenities cards: Minigolf (asset minigolf 600/1000w) and Solárium (asset piscina-tobogan-solarium 400/800w).
- Polished apartment descriptions with complete/private + resort-style framing. Build ✅ clean.

**Batch D — Verified Booking Facts (unit 1104 RNT 179772):**
- Enriched apartment descriptions (ES/EN/FR description_1/2/3) with verified facts:
  - **Floor & Size:** Piso 11, 76 m²
  - **Views:** Tonusco river valley + town-centre
  - **Capacity:** 6 adults + 2 children
  - **Amenities:** Detailed kitchen (fridge, coffee maker, microwave, stovetop, utensils), towels & linen, Wi-Fi 20 Mbps, Smart TV/streaming, wheelchair-accessible elevator
  - **Location:** 4 cuadras from colonial centre, free private parking, CCTV
  - **No gym claim** (conservatively omitted)
- Added 4 feature chips (ES/EN/FR): wifi (20 Mbps), smart_tv (streaming), floor_area (76 m² / Floor 11), accessible (wheelchair)
- Verified location distances: Plaza Mayor 4 blocks, Kanaloa 3.4 km, Olaya Herrera ~55 km, JMC ~78 km
- Verified dining nearby: La Chinca 250m, Nueva España 300m, Sabor Español 300m
- Reconciled attractions distances (SantaFe.astro): Plaza Mayor "a 4 cuadras", Kanaloa "~3.4 km"

**Guardrails Honored:**
- ✓ No private-pool claim (kept "piscinas del complejo")
- ✓ No hot/cold-water claims
- ✓ Pets rule unchanged (no mascotas)

**Build Validation:** ✅ npm run build passed 3 pages (2.88s). All 13 new/changed keys present in es/en/fr.json. JSON valid. distances_pending removed.

**Property Reference (for cross-agent knowledge):**
- RNT: 179772
- Address: Apartasol Residencial, Piso 11, 76 m²
- Sleeps: 6 adults + 2 children (8 guests primary)
- Views: Río Tonusco valley + Santa Fe de Antioquia town centre
- Kanaloa water park: 3.4 km (reconciled from "pocos minutos")
- Central location: 4 blocks (cuadras) walking to colonial historic district

**Decisions merged:** mouth-booking-facts.md + mouth-content-enrichment.md → decisions.md (inbox deleted).


## 2026-06-23T11:42:00+02:00 — Batch E & F: RNT 179772 + House Rules + CTA Button Fixes + Hero Vrbo

Completed two feature batches (Scribe post-processing):

**Batch E — RNT Visibility & House Rules:**
- RNT 179772 now captioned under Footer badge (figcaption, 10px muted white)
- footer.rnt_alt updated to "RNT 179772" in es/en/fr
- footer.copyright_extended includes "· RNT 179772" for legal compliance
- apartment.rules_quiet_hours added: "Quiet hours 00:00–09:00" (all locales)
- apartment.rules_minors added: "Guests under 18 only with parent/legal guardian" (all locales)
- Apartment.astro rules changed from `<p>` to `<ul>` (5 list items: 3 existing + 2 new)
- Private pool grep: zero matches in src/
- Build ✅ 3 pages in 1.74s

**Batch F — CTA Button Single-Line + Hero Vrbo:**
- Booking buttons: fixed wrapping via `sm:w-auto sm:min-w-[13rem] whitespace-nowrap` (all single-line)
- Hero container: added flex-wrap for graceful three-button layout
- Added Vrbo as third Hero CTA (same styling as Booking/Airbnb, external link, aria-label)
- hero.cta_vrbo + hero.cta_vrbo_aria added to es/en/fr.json
- Build ✅ 3 pages in 1.86s

**Decisions merged:** mouth-rnt-rules.md + mouth-cta-buttons.md → decisions.md (inbox cleaned)
**Logs written:** orchestration-log/2026-06-23T11-42-00Z-mouth.md + log/2026-06-23T11-42-00Z-rnt-rules-cta.md


## 2026-06-23T11:57:00+02:00 — Batch G: CTA Button Grid Redesign + Decorative Icons

Completed reservation button (CTA) redesign in Hero.astro and Booking.astro:

**Layout:** Replaced `flex flex-wrap … sm:w-auto sm:min-w-[13rem]` with `grid grid-cols-1 gap-3 sm:grid-cols-3`. Mobile: buttons stacked full-width. SM+: 3 equal columns, all `h-14`. Each button: `flex h-14 w-full`.

**Label consolidation:** Removed repeated "Reserva en / Book on / Réservez sur" from each button. Added single `<p>` label above grid using new i18n keys `hero.book_on_label` / `booking.book_on_label`.

**Brand icons:** Each button now has a 20×20 inline SVG icon (calendar → Booking.com; person silhouette → Airbnb; house → Vrbo) with `fill="currentColor"`. These are generic decorative marks, not official brand logos. Button text changed to brand names only ("Booking.com" / "Airbnb" / "Vrbo").

**Attributes preserved:** `data-tracking` values ("cta-booking/cta-airbnb/cta-vrbo"), `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` strings.

**Build:** ✅ 3 pages built in 2.01s, zero errors/warnings.

**i18n keys added:** `hero.book_on_label` / `booking.book_on_label` (ES: "Reserva en", EN: "Book on", FR: "Réservez sur").

**Decision merged:** mouth-cta-logos.md → decisions.md (inbox deleted).


## 2026-06-23T12:16:00+02:00 — Batch H: Remove Featured Chips

Completed featured chips removal from Apartment.astro:

**Removed 3 chips:** 
- `apartment.floor_area` ("76 m² · Piso 11")
- `apartment.accessible` ("Apartamento accesible")  
- `apartment.washer` ("Lavadora")

Array reduced 12 → 9 chips. Remaining 9 chips and order unchanged. i18n keys retained (ES/EN/FR) but no longer rendered. Decision: floor-area and accessibility details surfaced elsewhere or redundant; washer deemed low-priority for featured highlights.

**Build:** ✅ 3 pages built in 1.20s, clean, no errors.

**Decision merged:** mouth-remove-chips.md → decisions.md (inbox deleted).


## 2026-06-23T12:21:00+02:00 — Batch I & J: Solarium Spelling Fix + Materials Section Hidden

Completed two batches (Solarium typo fix + Materials section temporary hide):

**Batch I — Solarium Spelling Fix (es.json):**
- Fixed Spanish spelling "Solárium" → "Solarium" (4 occurrences):
  - amenities.solarium label
  - description_3  
  - gallery alt: piscina_tobogan
  - gallery alt: piscina_solarium
- EN and FR already correct
- Build ✅ 3 pages, exit code 0

**Batch J — Hide Materials Section (temporary, via comments):**
- Commented out imports in 3 page files (src/pages/index.astro, en/index.astro, fr/index.astro, line 14 each)
- Commented out render calls in 3 page files (lines 39–40 each)
- Commented out nav array entries in Nav.astro and Footer.astro
- Component Materials.astro: untouched
- i18n keys nav.materials and materials.*: preserved in all locales
- Re-enable: uncomment 7 lines when PDFs ready
- Build ✅ 3 pages, exit code 0
- Verified: no `<section id="materiales">` in HTML, no nav links present

**Decisions merged:** Both inbox files → decisions.md (inbox cleaned).
**Logs written:** orchestration-log/2026-06-23T12-21-00Z-mouth.md + log/2026-06-23T12-21-00Z-hide-materials.md
