/**
 * tests/nist-800-53.spec.ts
 * NIST SP 800-53 Rev 5 — Technically Verifiable Controls
 * Apartasol 1104 Citadela Di Sole — Static Astro / GitHub Pages
 *
 * ─── SCOPE STATEMENT ────────────────────────────────────────────────────────
 * NIST SP 800-53 Rev 5 contains ~1,000 controls across 20 families. The vast
 * majority are organisational / procedural (PM, PS, PE, PL, AT, IR, CP, MA,
 * MP, SA, SR, CA, RA-most, AC-most, IA-all) and CANNOT be verified by an
 * automated frontend test suite; they require org-level attestation.
 *
 * This file covers ONLY the small subset that can be mechanically asserted
 * against a static web page and its repository configuration.
 *
 * ─── PARTIAL vs COVERED vs N/A ──────────────────────────────────────────────
 * COVERED  — control can be fully asserted from the browser / served HTML.
 * PARTIAL  — control is declared in repo config (public/_headers) but GitHub
 *            Pages CANNOT emit HTTP response headers; enforcement only happens
 *            when a CDN/Cloudflare proxy is in front. Tests assert repo intent,
 *            not runtime behaviour.
 * N/A      — control is architecturally inapplicable to this static site.
 *
 * See tests/NIST-800-53-R5-mapping.md for the full control-family matrix.
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Constants ────────────────────────────────────────────────────────────────

const PAGES = ['/', '/en/', '/fr/'] as const;

const HEADERS_PATH = path.join(process.cwd(), 'public', '_headers');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Prevent the LanguagePicker script from auto-redirecting during navigation. */
async function noRedirect(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem('dis-lang-detected', '1');
  });
}

/**
 * Read the served CSP meta content attribute.
 * Throws if the meta tag is absent or has no content.
 */
async function getCspContent(page: Page): Promise<string> {
  const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
  const content = await cspMeta.getAttribute('content');
  if (!content) throw new Error('CSP meta tag absent or missing content attribute');
  return content;
}

// ════════════════════════════════════════════════════════════════════════════
// SC-8: Transmission Confidentiality and Integrity
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SC-8: "Implement cryptographic mechanisms to prevent
// unauthorized disclosure of information during transmission."
//
// Verifiable on static frontend:
//  (a) canonical, og:url, and hreflang alternate URLs use https://  → COVERED
//  (b) upgrade-insecure-requests in public/_headers CDN config       → PARTIAL
//  (c) HSTS in public/_headers                                       → PARTIAL
//
// Note: upgrade-insecure-requests is NOT present in the <meta> CSP (per
// Layout.astro design decision — meta CSP cannot set transport policy).
// HSTS cannot be set via meta. Both require HTTP header support from CDN.

test.describe('SC-8: Transmission Confidentiality and Integrity', () => {
  for (const url of PAGES) {
    test(`SC-8 [${url}]: canonical URL uses HTTPS`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'canonical href must be non-null').toBeTruthy();
      expect(
        canonical!.startsWith('https://'),
        `canonical "${canonical}" must start with https://`,
      ).toBe(true);
    });

    test(`SC-8 [${url}]: og:url uses HTTPS`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
      expect(ogUrl, 'og:url must be non-null').toBeTruthy();
      expect(
        ogUrl!.startsWith('https://'),
        `og:url "${ogUrl}" must start with https://`,
      ).toBe(true);
    });

    test(`SC-8 [${url}]: all hreflang alternate URLs use HTTPS`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const alternates = await page.locator('link[rel="alternate"][hreflang]').all();
      expect(
        alternates.length,
        'at least one hreflang alternate link must be present',
      ).toBeGreaterThan(0);
      for (const alt of alternates) {
        const href = await alt.getAttribute('href');
        const lang = await alt.getAttribute('hreflang');
        expect(
          href?.startsWith('https://'),
          `hreflang[${lang}] href "${href}" must start with https://`,
        ).toBe(true);
      }
    });
  }

  // PARTIAL: upgrade-insecure-requests is declared in the _headers CDN CSP block.
  // The meta CSP does NOT include it (by design — meta CSP cannot upgrade transport).
  // Enforcement requires Cloudflare/CDN to be proxying; absent on bare GitHub Pages.
  test('SC-8 [PARTIAL/CDN]: upgrade-insecure-requests declared in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers CDN CSP should declare upgrade-insecure-requests',
    ).toContain('upgrade-insecure-requests');
  });

  // PARTIAL: Strict-Transport-Security (HSTS) enforces HTTPS at transport layer.
  // Cannot be set via <meta>; requires HTTP header from CDN.
  test('SC-8 [PARTIAL/CDN]: Strict-Transport-Security (HSTS) declared in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers should declare Strict-Transport-Security (CDN-only enforcement)',
    ).toContain('Strict-Transport-Security');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SC-7: Boundary Protection
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SC-7: "Monitor and control communications at the external
// boundary of the system and at key internal boundaries."
//
// Verifiable: CSP restricts resource origins at the browser boundary.
//   default-src 'self'  — unknown external origins blocked              COVERED
//   object-src 'none'   — plugin resources (Flash, etc.) blocked        COVERED
//   base-uri 'self'     — base-tag injection prevented                  COVERED
//   frame-ancestors 'none' in _headers                                  PARTIAL
//   X-Frame-Options: DENY in _headers (legacy fallback)                 PARTIAL
// All meta-based controls are enforced on GitHub Pages.
// frame-ancestors / X-Frame-Options require HTTP header (CDN only).

test.describe('SC-7: Boundary Protection', () => {
  for (const url of PAGES) {
    test(`SC-7 [${url}]: CSP default-src restricts to self (unknown origins blocked)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(csp, "CSP must contain default-src 'self'").toContain("default-src 'self'");
    });

    test(`SC-7 [${url}]: CSP object-src none (plugin-hosted resources blocked)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(csp, "CSP must contain object-src 'none'").toContain("object-src 'none'");
    });

    test(`SC-7 [${url}]: CSP base-uri self (base-tag injection prevented)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(csp, "CSP must contain base-uri 'self'").toContain("base-uri 'self'");
    });
  }

  // PARTIAL: frame-ancestors 'none' is in the _headers CSP. Browsers IGNORE
  // frame-ancestors inside a <meta> CSP (HTML spec). Clickjacking protection
  // only applies when CDN/Cloudflare emits the header.
  test('SC-7 [PARTIAL/CDN]: frame-ancestors none declared in public/_headers CSP', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      "PARTIAL: _headers CSP should declare frame-ancestors 'none' (CDN-only)",
    ).toContain("frame-ancestors 'none'");
  });

  // PARTIAL: X-Frame-Options: DENY as legacy clickjacking fallback for older browsers.
  test('SC-7 [PARTIAL/CDN]: X-Frame-Options DENY declared in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers should declare X-Frame-Options: DENY (CDN-only)',
    ).toContain('X-Frame-Options: DENY');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SC-18: Mobile Code
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SC-18: "Define acceptable and unacceptable mobile code and
// mobile code technologies; authorize, monitor, and control the use of mobile
// code within the system."
//
// Verifiable: CSP script-src restricts which origins may supply scripts.
//   No wildcard '*' in script-src                                    COVERED
//   'unsafe-eval' absent from script-src                            COVERED
//   'unsafe-inline' PRESENT (Astro/CF Analytics build requirement)  PARTIAL
//     — inline script execution is not blocked; however the site has
//       no user-generated content or injection surface.

test.describe('SC-18: Mobile Code', () => {
  for (const url of PAGES) {
    test(`SC-18 [${url}]: CSP script-src contains no wildcard * (arbitrary external scripts blocked)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      const match = csp.match(/script-src\s+([^;]+)/);
      expect(match, 'CSP must contain a script-src directive').toBeTruthy();
      expect(
        match![1],
        "script-src must not contain wildcard '*'",
      ).not.toContain('*');
    });

    // PARTIAL: 'unsafe-inline' is in script-src (Astro JSON-LD + Tailwind build
    // requirement). This means inline scripts are permitted.
    // This test documents the current state (informational assertion).
    test(`SC-18 [${url}] PARTIAL: script-src does not allow unsafe-eval (stronger primitive)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      const match = csp.match(/script-src\s+([^;]+)/);
      const scriptSrcValue = match ? match[1] : csp;
      // Hard check: 'unsafe-eval' must NOT be present (eval is the more dangerous primitive)
      expect(
        scriptSrcValue,
        "script-src must not contain 'unsafe-eval'",
      ).not.toContain("'unsafe-eval'");
      // Informational: log presence of 'unsafe-inline' for the matrix without failing
      if (scriptSrcValue.includes("'unsafe-inline'")) {
        console.info(
          `[SC-18 PARTIAL] ${url}: script-src contains 'unsafe-inline' ` +
          `(Astro JSON-LD + Cloudflare Analytics build requirement — known gap)`,
        );
      }
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SC-23: Session Authenticity — N/A
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SC-23: "Protect the authenticity of communications sessions."
//
// STATUS: N/A
// This is a static marketing site with NO sessions, NO authentication,
// NO user accounts, NO cookies, NO session tokens.
// There is no session management layer to protect.
// Revisit if a booking/auth layer is introduced in a future phase.

test.skip('SC-23: Session Authenticity — N/A (no sessions, auth, or cookies on this static site; revisit if auth added)', () => {
  // Placeholder for control matrix documentation only.
});

// ════════════════════════════════════════════════════════════════════════════
// AC-4: Information Flow Enforcement
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 AC-4: "Enforce approved authorizations for controlling the
// flow of information within the system and between interconnected systems."
//
// Verifiable: CSP directives control browser-level information flows.
//   form-action 'none'  — data cannot flow to any form-submission endpoint  COVERED
//   frame-src allowlist — iframes restricted to google.com domains only     COVERED
//   connect-src 'self'  — fetch/XHR restricted to self + analytics CDN      COVERED

test.describe('AC-4: Information Flow Enforcement', () => {
  for (const url of PAGES) {
    test(`AC-4 [${url}]: CSP form-action none (no form data can be submitted to any endpoint)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(csp, "CSP must contain form-action 'none'").toContain("form-action 'none'");
    });

    test(`AC-4 [${url}]: CSP frame-src restricted to google.com allowlist only (no wildcard)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      const match = csp.match(/frame-src\s+([^;]+)/);
      expect(match, 'CSP must contain a frame-src directive').toBeTruthy();
      const frameSrcValue = match![1].trim();
      // No wildcard allowed
      expect(frameSrcValue, "frame-src must not contain wildcard '*'").not.toContain('*');
      // Every token must be a google.com domain
      const allowedFrameHosts = [
        'https://www.google.com',
        'https://maps.google.com',
        'https://www.google.com.co',
      ];
      const tokens = frameSrcValue.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        expect(
          allowedFrameHosts.includes(token),
          `frame-src token "${token}" is not in the approved google.com allowlist`,
        ).toBe(true);
      }
    });

    test(`AC-4 [${url}]: CSP connect-src contains self (data fetch flows restricted)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(csp, "CSP must contain connect-src 'self'").toContain("connect-src 'self'");
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SI-10: Information Input Validation
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SI-10: "Check the validity of the following information inputs."
//
// For a STATIC site with no backend:
//   - No user-input forms POST to a backend server.
//   - CSP form-action 'none' is a hard browser-level enforcement.
// Verifiable: assert no <form> elements POST to external/backend endpoints.
// The absence of any form with POST-to-backend is itself the passing condition.

test.describe('SI-10: Information Input Validation', () => {
  for (const url of PAGES) {
    test(`SI-10 [${url}]: no form elements with POST method to external endpoints (static site has no backend)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const forms = await page.locator('form').all();
      for (const form of forms) {
        const method = ((await form.getAttribute('method')) ?? 'get').toLowerCase();
        const action = (await form.getAttribute('action')) ?? '';
        if (method === 'post') {
          // A POST to an absolute external URL would indicate an unexpected backend
          expect(
            action.startsWith('http://') || action.startsWith('https://'),
            `form[method=post] with action="${action}" must not POST to an external endpoint on a static site`,
          ).toBe(false);
        }
      }
      // If no forms exist, the control is trivially satisfied (static site intent)
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SI-3: Malicious Code Protection
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SI-3: "Implement malicious code protection mechanisms at
// system entry and exit points."
//
// Verifiable on static frontend:
//   object-src 'none'      — plugin-based code (Flash, ActiveX) blocked     COVERED
//   no 'unsafe-eval'       — eval()-based code injection prevented           COVERED
//   no wildcard in script-src                                                COVERED
//   'unsafe-inline' present (Astro build req) — inline injection not blocked PARTIAL

test.describe('SI-3: Malicious Code Protection', () => {
  for (const url of PAGES) {
    test(`SI-3 [${url}]: CSP object-src none (plugin-based malicious code execution blocked)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      expect(
        csp,
        "CSP must contain object-src 'none' to block plugin-based malicious code",
      ).toContain("object-src 'none'");
    });

    test(`SI-3 [${url}]: CSP script-src does not allow unsafe-eval (eval-based injection blocked)`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const csp = await getCspContent(page);
      const match = csp.match(/script-src\s+([^;]+)/);
      const scriptSrcValue = match ? match[1] : csp;
      expect(
        scriptSrcValue,
        "script-src must not contain 'unsafe-eval'",
      ).not.toContain("'unsafe-eval'");
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SI-15: Information Output Filtering
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 SI-15: "Validate information output from software programs
// and applications to ensure that the output is correct and accurate."
//
// Verifiable on static frontend:
//   No server error messages / stack traces in served HTML              COVERED
//   No debug-mode markers in served HTML                               COVERED
// Note: secret-pattern checks are in security.spec.ts. These patterns
// target different output-filtering concerns (server errors, debug output).

test.describe('SI-15: Information Output Filtering', () => {
  // Patterns that indicate server-side debug or error output leaked into HTML.
  const DEBUG_LEAK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /at\s+\w[\w.]*\s+\([\w./\\:]+:\d+:\d+\)/, label: 'JS stack-trace line' },
    { pattern: /Traceback \(most recent call last\)/,       label: 'Python traceback header' },
    { pattern: /Exception in thread/,                       label: 'Java exception header' },
    { pattern: /Error:\s+ENOENT|Error:\s+EACCES/,          label: 'Node.js filesystem error' },
    { pattern: /Internal Server Error/i,                    label: 'HTTP 500 message' },
    { pattern: /<!--\s*debug/i,                             label: 'HTML debug comment marker' },
    { pattern: /astro.*build.*error/i,                      label: 'Astro build error in HTML' },
  ];

  for (const url of PAGES) {
    test(`SI-15 [${url}]: served HTML contains no debug or error-output markers`, async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const html = await page.content();
      for (const { pattern, label } of DEBUG_LEAK_PATTERNS) {
        expect(
          html,
          `HTML must not contain debug/error output [${label}]`,
        ).not.toMatch(pattern);
      }
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// CM-6 / CM-7: Configuration Settings / Least Functionality
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 CM-6: "Establish and document configuration settings."
// NIST 800-53 R5 CM-7: "Configure the system to provide only essential
// capabilities."
//
// ALL of the following are PARTIAL — they depend on HTTP response headers
// which GitHub Pages cannot emit. Tests assert repo intent (public/_headers).
// Enforcement only applies when Cloudflare/CDN is proxying the site.

test.describe('CM-6 / CM-7: Configuration Settings and Least Functionality', () => {
  // CM-7: Permissions-Policy disables unneeded browser capabilities.
  // PARTIAL: CDN/Cloudflare only.
  test('CM-7 [PARTIAL/CDN]: Permissions-Policy disables camera in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers Permissions-Policy should disable camera',
    ).toContain('camera=()');
  });

  test('CM-7 [PARTIAL/CDN]: Permissions-Policy disables microphone in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers Permissions-Policy should disable microphone',
    ).toContain('microphone=()');
  });

  test('CM-7 [PARTIAL/CDN]: Permissions-Policy disables geolocation in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers Permissions-Policy should disable geolocation',
    ).toContain('geolocation=()');
  });

  test('CM-7 [PARTIAL/CDN]: Permissions-Policy disables payment API in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers Permissions-Policy should disable payment',
    ).toContain('payment=()');
  });

  // CM-6: X-Content-Type-Options: nosniff prevents MIME-type sniffing.
  // PARTIAL: CDN/Cloudflare only.
  test('CM-6 [PARTIAL/CDN]: X-Content-Type-Options nosniff declared in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers should declare X-Content-Type-Options: nosniff',
    ).toContain('X-Content-Type-Options: nosniff');
  });

  // CM-6: Referrer-Policy controls referer leakage in cross-origin requests.
  // PARTIAL: CDN/Cloudflare only.
  test('CM-6 [PARTIAL/CDN]: Referrer-Policy strict-origin-when-cross-origin declared in public/_headers', () => {
    const content = fs.readFileSync(HEADERS_PATH, 'utf-8');
    expect(
      content,
      'PARTIAL: _headers should declare Referrer-Policy: strict-origin-when-cross-origin',
    ).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// AU-2 / AU-12: Audit Events / Audit Record Generation — PARTIAL / N/A
// ════════════════════════════════════════════════════════════════════════════
// NIST 800-53 R5 AU-2: "Identify the types of events that the system is
// capable of logging."
// NIST 800-53 R5 AU-12: "Provide audit record generation capability for the
// event types defined in AU-2."
//
// STATUS: PARTIAL / N/A
// No server-side audit logging is possible from a static frontend test suite.
// Cloudflare Web Analytics is the configured client-side audit signal but:
//   (a) the CF_ANALYTICS_TOKEN is empty in this build — beacon disabled.
//   (b) any actual audit capability lives at the CDN/Cloudflare org layer.
// This control requires org-level attestation; no automated test is feasible.

test.skip('AU-2 / AU-12: Audit Events — PARTIAL/N/A (static site; Cloudflare Analytics CDN-layer only; org-level attestation required)', () => {
  // Placeholder for control matrix documentation only.
  // If Cloudflare Analytics token is enabled, the CDN access logs would provide
  // the AU-2 audit capability. That is an org-level / CDN configuration control.
});
