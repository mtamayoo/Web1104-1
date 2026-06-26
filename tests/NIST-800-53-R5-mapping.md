# NIST SP 800-53 Rev 5 — Control Mapping Matrix
## Apartasol 1104 Citadela Di Sole · Static Astro / GitHub Pages

**Document version:** 2026-06-25  
**Prepared by:** Kovacs (QA), requested by mtamayoo  
**Reference:** [NIST SP 800-53 Rev 5 Update 1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

---

## ⚠️ Scope and Limitations

### What this matrix covers
This matrix identifies the **small subset** of NIST SP 800-53 Rev 5 controls
that can be **mechanically asserted** against a static web frontend by an
automated Playwright test suite.

### Families entirely out of scope (org-level attestation required)
The following control families and most of their controls are **organisational
or procedural** and **cannot be tested** by any frontend test harness. They
require policy documents, personnel procedures, physical controls, or system
architecture decisions made at the organisational level:

| Family | Code | Reason out of scope |
|--------|------|---------------------|
| Program Management | PM | Governance, risk management, privacy program — org-level |
| Personnel Security | PS | Background checks, termination, access agreements — HR |
| Physical & Environmental | PE | Data-centre locks, climate, fire suppression — physical |
| Planning | PL | Security plans, rules of behaviour, privacy impact — docs |
| Awareness & Training | AT | Security training programs — HR/training |
| Incident Response | IR | IR plans, reporting, forensics — org-level |
| Contingency Planning | CP | Backup, failover, BCP — ops-level |
| Maintenance | MA | Hardware maintenance — not applicable (PaaS/static) |
| Media Protection | MP | Physical media handling — not applicable (no physical media) |
| System & Services Acquisition | SA | Development SDLC controls, vendor management — org |
| Supply Chain Risk Management | SR | Supply chain integrity — org-level |
| Security Assessment & Auth. | CA | Formal assessment, authorisation, interconnections — org |
| Risk Assessment | RA | Risk assessments, vulnerability scanning, privacy — org |
| Identification & Auth. | IA | **All** — no users, no authentication, no sessions on this static site |
| Access Control (most) | AC | Most sub-controls: account management, least privilege, session locks — all N/A (no users) |
| Audit & Accountability (most) | AU | Server-side log management — CDN/org-level; frontend only contributes AU-2/AU-12 partially |

### GitHub Pages header constraint
> **CRITICAL:** GitHub Pages **cannot** set HTTP response headers. Controls
> that depend on HTTP headers (HSTS, X-Frame-Options, X-Content-Type-Options,
> Referrer-Policy, Permissions-Policy, `frame-ancestors` CSP) are enforced
> **only when Cloudflare or another CDN proxy is in front** of the site.
>
> Tests for these controls assert that the **intended configuration exists in
> `public/_headers`** (verifying repo intent), but are marked **PARTIAL**
> because the headers are absent on bare GitHub Pages.
>
> The `<meta http-equiv="Content-Security-Policy">` tag in `src/layouts/Layout.astro`
> is the **only security control actually enforced** by GitHub Pages itself.

---

## Control Mapping Table

| Control ID | Title | Family | Status | Test Reference | Notes |
|------------|-------|--------|--------|----------------|-------|
| **SC-8** | Transmission Confidentiality and Integrity | SC | COVERED / PARTIAL | `SC-8 [url]: canonical URL uses HTTPS` `SC-8 [url]: og:url uses HTTPS` `SC-8 [url]: all hreflang alternate URLs use HTTPS` | Canonical, og:url, hreflang hrefs use https:// → COVERED. `upgrade-insecure-requests` and HSTS only in `_headers` → PARTIAL (CDN). |
| **SC-7** | Boundary Protection | SC | COVERED / PARTIAL | `SC-7 [url]: CSP default-src restricts to self` `SC-7 [url]: CSP object-src none` `SC-7 [url]: CSP base-uri self` | meta CSP enforces default-src/object-src/base-uri → COVERED. `frame-ancestors 'none'` and `X-Frame-Options: DENY` are CDN-only → PARTIAL. |
| **SC-18** | Mobile Code | SC | PARTIAL | `SC-18 [url]: CSP script-src contains no wildcard *` `SC-18 [url] PARTIAL: script-src does not allow unsafe-eval` | No wildcard in script-src, no unsafe-eval → COVERED aspects. `'unsafe-inline'` IS present (Astro/CF Analytics build requirement) → inline execution not blocked → PARTIAL. |
| **SC-23** | Session Authenticity | SC | N/A | `test.skip` in nist-800-53.spec.ts | Static site. No sessions, no auth, no cookies. Architecturally inapplicable. |
| **AC-4** | Information Flow Enforcement | AC | COVERED | `AC-4 [url]: CSP form-action none` `AC-4 [url]: CSP frame-src restricted to google.com allowlist` `AC-4 [url]: CSP connect-src contains self` | meta CSP enforces form-action 'none', frame-src allowlist, connect-src 'self'. Fully verifiable via served HTML. |
| **SI-10** | Information Input Validation | SI | COVERED / N/A | `SI-10 [url]: no form elements with POST to external endpoints` | No `<form method=post>` elements with external action in served DOM. CSP form-action 'none' is the browser-level enforcement. Static site with no backend → trivially satisfied. |
| **SI-3** | Malicious Code Protection | SI | PARTIAL | `SI-3 [url]: CSP object-src none` `SI-3 [url]: CSP script-src does not allow unsafe-eval` | object-src 'none' and no unsafe-eval in script-src → COVERED aspects. 'unsafe-inline' present in script-src → inline injection not blocked if HTML were compromised → PARTIAL. No user-generated content / injection surface exists. |
| **SI-15** | Information Output Filtering | SI | COVERED | `SI-15 [url]: served HTML contains no debug or error-output markers` | No JS stack traces, Python tracebacks, HTTP 500 messages, or debug HTML comments in served output. Distinct from secret-pattern checks in security.spec.ts. |
| **CM-6** | Configuration Settings | CM | PARTIAL | `CM-6 [PARTIAL/CDN]: X-Content-Type-Options nosniff in _headers` `CM-6 [PARTIAL/CDN]: Referrer-Policy strict-origin-when-cross-origin in _headers` | Headers declared in `public/_headers` (repo intent verified). Absent on bare GitHub Pages; CDN-only enforcement. |
| **CM-7** | Least Functionality | CM | PARTIAL | `CM-7 [PARTIAL/CDN]: Permissions-Policy disables camera/microphone/geolocation/payment` | Permissions-Policy declared in `public/_headers`. CDN-only enforcement. Disables camera, mic, geolocation, payment, interest-cohort. |
| **AU-2** | Event Logging | AU | PARTIAL / N/A | `test.skip` in nist-800-53.spec.ts | No server-side logging possible from static frontend. Cloudflare Analytics (CDN) would be the mechanism; CF_ANALYTICS_TOKEN is empty in this build. Org-level attestation required. |
| **AU-12** | Audit Record Generation | AU | PARTIAL / N/A | `test.skip` in nist-800-53.spec.ts | Same rationale as AU-2. CDN access logs are the audit record source. Not testable from frontend. |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **COVERED** | Control is fully asserted by a Playwright test against the live (preview-served) HTML. Holds on bare GitHub Pages. |
| **PARTIAL** | Control is declared in `public/_headers` (repo intent verified by test) but depends on CDN/Cloudflare for actual enforcement. GitHub Pages alone does not enforce it. |
| **N/A** | Control is architecturally inapplicable to this static marketing site. Documented for completeness. |

---

## Test File Reference

All NIST-annotated tests live in **`tests/nist-800-53.spec.ts`**.

Existing security tests in `tests/security.spec.ts` remain intact and cover
overlapping properties (CSP directives, noopener links, secret patterns,
`_headers` presence) without NIST annotation.

---

## Honest Compliance Caveat

This test suite **does NOT constitute NIST SP 800-53 compliance** for the
following reasons:

1. **Scope**: Only ~12 controls from 4–5 families (SC, AC, SI, CM, AU partial)
   are even partially verifiable from a frontend. NIST 800-53 has 20 families
   and ~1,000 controls.

2. **Header enforcement gap**: Security header controls (HSTS, XCTO, Referrer,
   Permissions, frame-ancestors) require HTTP response headers that GitHub Pages
   cannot emit. They are enforced only when Cloudflare is proxying.

3. **'unsafe-inline' in script-src**: SC-18 and SI-3 are PARTIAL because
   `'unsafe-inline'` is present in the meta CSP script-src (Astro/CF Analytics
   build requirement). A nonce-based CSP would fully cover these controls.

4. **No server-side controls**: AU (audit logging), IA (auth), CP (backup),
   IR (incident response) and all other server/org controls are entirely
   out of scope for a static frontend.

A formal NIST 800-53 assessment requires an authorised third-party assessor
and covers the full organisational scope — not just the frontend.
