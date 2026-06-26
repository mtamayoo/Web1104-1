# QA & Security Findings Report — Apartasol 1104 Citadela Di Sole

**Date:** 2026-06-25
**Scope:** Functionality · Accessibility · Security
**Prepared by:** Squad (Gustave / Lead audit + Kovacs / QA harness)

**Headline result:** 75/75 baseline Playwright tests pass (25 functionality · 30 accessibility · 20 security). Security audit found **0 production vulnerabilities**, with 11 advisory findings (2 HIGH, 5 MEDIUM, 4 LOW) plus 1 dev-only dependency item. None are shipping blockers; all are hardening opportunities.

> This report is a **read-only assessment**. No application/site source code was modified to produce it.

---

## 1. Functionality Tests

**Suite:** `tests/functionality.spec.ts` — 25 tests, **all passing.**
Coverage: locale 200/title/lang attributes, section IDs, headings, booking CTAs, gallery images, language-picker navigation across es/en/fr.

No functional defects were found. The items below are **test-harness advisories** — characteristics of the app that required special handling and could cause false failures or flakiness later.

### F-ADV-01 · Language auto-redirect can break tests under non-Spanish locales
- **Cause:** The `LanguagePicker` component runs a browser-language auto-redirect script on the default Spanish page. Playwright's default emulated locale is `en-US`, which triggers a redirect off the page under test.
- **Description:** Without intervention, functionality tests landing on the `es` page would be redirected mid-test, producing spurious failures unrelated to actual behavior. Confirmed during harness build.
- **Suggested action plan:** Keep the mitigation already in place — `locale: 'es-CO'` is set in `playwright.config.ts` (`use` block) so `navigator.language` bypasses the redirect. As a per-test alternative, use `page.addInitScript(() => sessionStorage.setItem('dis-lang-detected', '1'))`. Document this redirect behavior near the LanguagePicker source so future tests don't re-discover it.

### F-ADV-02 · French typographic apostrophes cause text-match mismatches
- **Cause:** French i18n strings in `src/i18n/fr.json` use the typographic apostrophe (U+2019 `’`) rather than the ASCII apostrophe (U+0027 `'`).
- **Description:** Playwright `toContainText()` assertions written with a plain `'` will not match content rendered with `’`, leading to false-negative test failures even though the page is correct.
- **Suggested action plan:** When asserting on French strings, use substrings that avoid the apostrophe entirely, or use regex matchers that allow either quote variant (e.g. `/l['’]appartement/`). Standardize on one approach in the suite to keep assertions robust.

---

## 2. Accessibility Tests

**Suite:** `tests/accessibility.spec.ts` — 30 tests, **all passing.**
Coverage: axe-core WCAG 2.0 A/AA and 2.1 AA scans, skip-link, landmark regions, single h1, heading-order, hreflang alternates, across all three locales.

No WCAG violations block the build. The following are an advisory (potential latent issue), a confirmed-correct pattern worth recording, and a documented suppression.

### A-01 · Low-opacity white text may fail WCAG AA contrast (advisory)
- **Cause:** Several elements use Tailwind opacity utility classes — `text-white/30`, `text-white/50`, `text-white/70` — in the hero subtitle, footer legal text, and navigation, layering translucent white over dark backgrounds.
- **Description:** axe's `color-contrast` rule is currently allowlisted (suppressed) in the suite, so these are not failing tests today. However, reduced-opacity white text can fall below the WCAG AA contrast ratio of 4.5:1 for normal text, which would affect low-vision users. This is unverified against actual rendered pixel contrast.
- **Suggested action plan:** Run a Lighthouse (or axe with contrast enabled) audit on the nav, hero subtitle, and footer legal text to capture real rendered contrast ratios. For any element below 4.5:1, increase the opacity step (e.g. `/70` → `/90`) or raise the underlying text color until it passes. Once verified compliant, remove the `color-contrast` allowlist entry so regressions are caught automatically.

### A-02 · `alt=""` on decorative images — confirmed WCAG-correct (record, no action)
- **Cause:** Decorative/background images in the Apartment section (room highlights and feature cards) intentionally carry empty `alt=""` because adjacent visible text labels already provide the accessible equivalent.
- **Description:** This is correct WCAG usage — empty `alt` on purely decorative images prevents screen readers from announcing redundant or meaningless content. The risk is a future test or reviewer wrongly "fixing" these by adding alt text or flagging them as missing.
- **Suggested action plan:** No change required. Preserve the test rule that flags only `alt === null` (attribute entirely missing) and explicitly **not** empty-string `alt`. Keep a code comment at these images noting the decorative intent so the pattern isn't accidentally "corrected" later.

### A-03 · `color-contrast` axe rule is suppressed in the suite (transparency note)
- **Cause:** The axe configuration in `tests/accessibility.spec.ts` allowlists the `color-contrast` rule to keep the suite green while A-01 is unresolved.
- **Description:** With this rule disabled, the accessibility suite cannot catch contrast regressions. The 30/30 pass count does not currently include contrast verification.
- **Suggested action plan:** Treat this as a temporary suppression tied to A-01. After the Lighthouse audit and any color fixes, re-enable the rule and re-run. Track it so the suppression doesn't silently become permanent.

---

## 3. Security Tests & Security Audit

**Test suite:** `tests/security.spec.ts` — 20 tests, **all passing.**
Coverage: CSP `<meta>` presence, `rel=noopener noreferrer` completeness, plaintext-secret leak scan, `_headers` directive presence.

**Audit (Gustave):** `npm audit --omit=dev` → **0 production vulnerabilities**; no hardcoded secrets; all external links correctly guarded; GitHub Actions fully SHA-pinned; Dependabot active. The findings below are hardening recommendations.
**File references verified:** `src/layouts/Layout.astro` (212 lines), `src/components/Location.astro` (113 lines), `src/config/site.ts` (63 lines), `public/_headers` (40 lines).

> **Ledger correction (recorded):** An earlier note claimed `public/_headers` was "entirely commented out." This is **incorrect** — the `#` lines are inline comments but the real header rules live under the `/*` path block. The accurate caveat: these headers only take effect behind a CDN that honors `_headers` (Cloudflare/Netlify); on plain GitHub Pages they have no effect, which is why the `<meta>` CSP fallback exists.

### HIGH

#### H-01 · `script-src 'unsafe-inline'` defeats the script CSP
- **File:** `src/layouts/Layout.astro:134`, `public/_headers:21`
- **Cause:** Both the meta CSP and the CDN `_headers` CSP include `'unsafe-inline'` in `script-src`, permitting any inline `<script>` to execute. The only legitimate inline script is the JSON-LD block (`Layout.astro:188`); the Cloudflare analytics script already loads via `src=`, so inline is not actually needed.
- **Description:** `'unsafe-inline'` neutralizes the primary XSS protection CSP is meant to provide. Exploitability is low today (fully static, no user input), but the policy provides no meaningful script-injection defense as written.
- **Suggested action plan:** (1) Compute the SHA-256 hash of the exact bytes emitted into the `<script type="application/ld+json">` block at build time (Astro integration or a `scripts/` post-process step). (2) Replace `'unsafe-inline'` with `'sha256-<base64hash>'` in **both** CSP locations. (3) The CF analytics `<script src>` already satisfies `'self' https://static.cloudflareinsights.com` — no hash needed. (4) Because `inLanguage`/`url` differ per locale, either emit one hash per locale variant, or move those dynamic fields out of JSON-LD into `<meta>` tags so the hashed block becomes locale-invariant.

#### H-02 · `img-src https:` wildcard is overly broad
- **File:** `src/layouts/Layout.astro:136`, `public/_headers:21`
- **Cause:** `img-src 'self' data: https:` allows images from **any** HTTPS origin.
- **Description:** In a reflected/stored XSS scenario (even a future one), an attacker can exfiltrate data by encoding it into image URL query params pointed at an arbitrary HTTPS host. The site loads no cross-origin images at runtime today — booking logos, award badges, and gallery are all local `'self'`; OG/Twitter images are `<meta>` content consumed by scrapers, not the browser.
- **Suggested action plan:** Replace `https:` with the minimal policy `img-src 'self' data:`. If booking-platform images are ever rendered directly in `<img>` tags, enumerate those specific hosts at that time rather than reopening the wildcard.

### MEDIUM

#### M-01 · Missing `Cross-Origin-Opener-Policy` (COOP)
- **File:** `public/_headers`
- **Cause:** No COOP header is defined.
- **Description:** Without COOP, cross-origin popups opened from the page can retain a `window.opener` reference back to it, enabling a class of cross-window scripting (limited on a static site, but free to close).
- **Suggested action plan:** Add `Cross-Origin-Opener-Policy: same-origin` to `_headers`.

#### M-02 · Missing `Cross-Origin-Resource-Policy` (CORP)
- **File:** `public/_headers`
- **Cause:** No CORP header is defined.
- **Description:** Without CORP, any other origin can embed/load this site's resources (images, scripts) cross-origin.
- **Suggested action plan:** Add `Cross-Origin-Resource-Policy: same-site` (use `same-site` rather than `same-origin` so the `disole1104.k.vu` custom domain serves all subdomain contexts cleanly).

#### M-03 · Meta CSP incorrectly omits `upgrade-insecure-requests`
- **File:** `src/layouts/Layout.astro:121` (comment) and CSP array lines 132–143
- **Cause:** The comment at line 121 wrongly states `upgrade-insecure-requests` cannot be set via `<meta>`. In fact it **is** supported in `<meta http-equiv="Content-Security-Policy">` by all modern browsers — only HSTS is header-only. The `_headers` file includes the directive; the meta fallback (the one active on GitHub Pages) does not.
- **Description:** On GitHub Pages (no CDN), the meta CSP is the only active policy, so mixed-content requests are not auto-upgraded there — the exact environment where the directive matters most.
- **Suggested action plan:** (1) Add `"upgrade-insecure-requests"` to the CSP array in `Layout.astro`. (2) Correct the inaccurate comment at line 121.

#### M-04 · Google Maps `<iframe>` missing `sandbox` attribute
- **File:** `src/components/Location.astro:44`
- **Cause:** The embedded Maps iframe has no `sandbox` attribute, so it runs with full script, form, and popup permissions.
- **Description:** An unsandboxed third-party iframe has broader capabilities than the embed requires, enlarging the trust surface around the Google Maps embed.
- **Suggested action plan:** Add `sandbox="allow-scripts allow-same-origin allow-popups allow-forms"` (this is the minimal viable set — `allow-scripts` and `allow-same-origin` are both required for the map to render and navigate). Additionally, change `referrerpolicy="no-referrer-when-downgrade"` (line 51) to `referrerpolicy="strict-origin"` to avoid leaking the full page URL to Google (see L-03).

#### M-05 · HSTS lacks `preload` directive
- **File:** `public/_headers:25`
- **Cause:** `Strict-Transport-Security: max-age=31536000; includeSubDomains` omits `preload`.
- **Description:** Without preload, a user's very first HTTP request to the domain can be downgraded before the HSTS header is ever received (trust-on-first-use gap).
- **Suggested action plan:** Once the domain is confirmed permanent, append `; preload` and submit to hstspreload.org. Prerequisites already met except the directive itself: `max-age ≥ 31536000`, `includeSubDomains`, HTTPS on all subdomains.

### LOW

#### L-01 · Booking URLs routed through `tinyurl.com` redirects
- **File:** `src/config/site.ts:15–21`
- **Cause:** `BOOKING_URL`, `AIRBNB_URL`, and `VRBO_URL` use `https://tinyurl.com/DiSole1104{B,A,V}` shortlinks.
- **Description:** This adds a third-party trust dependency: if tinyurl re-routes the links (compromise, expiry, or policy change), every booking CTA silently redirects elsewhere with no code change on our side.
- **Suggested action plan:** Replace the shortlinks with the full canonical booking-platform URLs; archive the direct URLs in `site.ts` comments for reference. (A redirect-destination assertion — follow each CTA redirect and assert the final domain is `booking.com`/`airbnb.com`/`vrbo.com` — guards against hijack going forward; this is implemented in `tests/security-extended.spec.ts`.)

#### L-02 · JSON-LD `JSON.stringify` does not HTML-escape `<`
- **File:** `src/layouts/Layout.astro:188`
- **Cause:** `set:html={JSON.stringify(jsonLd, null, 2)}` — `JSON.stringify` does not escape `<`, `>`, or `&`.
- **Description:** **Currently safe** — all `jsonLd` fields are TypeScript `as const` compile-time literals. The risk is prospective: if any field ever became dynamic (CMS, i18n file) and contained `</script>`, it could prematurely close the script tag and inject HTML.
- **Suggested action plan:** When/if dynamic content is introduced, escape before injection:
  ```ts
  const safeJson = JSON.stringify(jsonLd, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  ```
  then use `set:html={safeJson}`. No action needed while content stays static.

#### L-03 · iframe `referrerpolicy` leaks full page URL to Google
- **File:** `src/components/Location.astro:51`
- **Cause:** `referrerpolicy="no-referrer-when-downgrade"` sends the full origin + path as `Referer` to Google Maps over HTTPS.
- **Description:** On a single-page site the leakage is minimal, but it discloses more than necessary; `strict-origin` is the better-practice default.
- **Suggested action plan:** Change to `referrerpolicy="strict-origin"` (can be done together with the M-04 sandbox fix in the same edit).

#### L-04 · Dev-dependency vulnerability chain (5 × moderate) — dev-only
- **Command:** `npm audit`
- **Cause:** 5 moderate issues in the `yaml` library (stack overflow via deeply-nested YAML, GHSA-48c2-rrv3-qjmp) reach the build tool `@astrojs/check` via `yaml-language-server → volar-service-yaml → @astrojs/language-server`.
- **Description:** **Not shipped to production** (devDependency) and **not exploitable** in the static build pipeline, which never parses untrusted YAML. `npm audit --omit=dev` reports 0 vulnerabilities.
- **Suggested action plan:** Run `npm audit fix` at the next routine maintenance window to accept the updated `@astrojs/check` version. No urgency.

### Security items that PASSED (advisories worth recording)

These passed but carry caveats the team should keep visible:

- **S-PASS-01 · `_headers` only active behind a CDN.** All header rules are valid and live, but take effect only when served via Cloudflare/Netlify. On plain GitHub Pages they do nothing — the `<meta>` CSP fallback is the only active policy there. *Action:* activate the Cloudflare proxy to realize the full header set; until then, ensure the meta CSP carries the critical directives (ties into M-03).
- **S-PASS-02 · `frame-ancestors` intentionally absent from `<meta>` CSP.** Browsers ignore `frame-ancestors` inside `<meta>`, so clickjacking protection relies on `X-Frame-Options: DENY` + the CDN-layer `frame-ancestors 'none'`. Correct and documented — *no action*, but note that on GitHub Pages only the meta path is active, so `X-Frame-Options` cannot be set there either; clickjacking defense depends on CDN activation.
- **S-PASS-03 · Confirmed-clean items (no action):** 0 production vulns; all `target="_blank"` links carry `rel="noopener noreferrer"`; `.env*` in `.gitignore`; no hardcoded secrets; `dist/` excluded from repo; all 4 GitHub Actions SHA-pinned; Dependabot configured (npm + Actions, weekly); `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` all present and appropriate.

---

## Recommended automated assertions

Encoded in `tests/security-extended.spec.ts` to prevent regressions after the above fixes land:

1. CSP presence + no-`unsafe-inline` check per page (no-`unsafe-inline` portion is `test.fixme`, pending H-01).
2. `rel="noopener noreferrer"` completeness on all `target="_blank"` (all locales).
3. Build-time / rendered-HTML plaintext-secret scan (`sk_`, `pk_`, `AIza`, `Bearer `, `apiKey`, …).
4. External-CTA redirect-destination validation (guards L-01); skips gracefully when offline.
5. HTTP security-header check once behind Cloudflare (`test.skip` until a `PROD_URL` is reachable).
6. JSON-LD valid-JSON parse per locale.
7. `upgrade-insecure-requests` present in meta CSP after M-03 (`test.fixme`, pending M-03).

---

## Suggested remediation order

1. **H-01, H-02** — CSP hardening. Highest security value.
2. **M-03** — add `upgrade-insecure-requests` to meta CSP + fix the incorrect comment (cheap, matters most on GitHub Pages).
3. **M-04 + L-03** — iframe sandbox + referrerpolicy (single edit in `Location.astro`).
4. **M-01, M-02, M-05** — COOP/CORP/HSTS-preload in `_headers` (apply alongside Cloudflare activation).
5. **A-01** — Lighthouse contrast audit, then fix colors and re-enable the axe `color-contrast` rule.
6. **L-01** — replace tinyurl shortlinks with canonical URLs.
7. **L-04** — `npm audit fix` at next maintenance window.
8. **L-02** — only when dynamic JSON-LD content is introduced.

---

## Related artifacts

- `tests/NIST-800-53-R5-mapping.md` — NIST SP 800-53 Rev 5 control-mapping matrix (verifiable subset only).
- `tests/security.spec.ts`, `tests/security-extended.spec.ts`, `tests/nist-800-53.spec.ts` — security test suites.
- `tests/functionality.spec.ts`, `tests/accessibility.spec.ts` — functionality & accessibility suites.

**No project source files were modified in producing this report.**
