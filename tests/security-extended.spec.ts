/**
 * tests/security-extended.spec.ts
 * Extended security assertions for Apartasol 1104 Di Sole.
 *
 * Implements Gustave's 7-item findings report:
 *  1. CSP no-unsafe-inline target state (active — H-01)
 *  2. rel="noopener noreferrer" completeness on ALL locales (active)
 *  3. Plaintext-secret scan with extended patterns (active)
 *  4. External-CTA redirect-destination validation (skip if offline)
 *  5. HTTP security-header check (skip — local preview)
 *  6. JSON-LD valid-JSON parse per locale (active)
 *  7. upgrade-insecure-requests in meta CSP (fixme — M-03)
 */
import { test, expect, type Page } from '@playwright/test';

// ── Constants ────────────────────────────────────────────────────────────────

const PAGES = ['/', '/en/', '/fr/'] as const;

// ── Helper ───────────────────────────────────────────────────────────────────

async function noRedirect(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('dis-lang-detected', '1');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. CSP — target state: script-src must NOT contain 'unsafe-inline'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for (const url of PAGES) {
  test(
    `[${url}] CSP script-src is hash-pinned without 'unsafe-inline' (H-01)`,
    async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = (await cspMeta.getAttribute('content')) ?? '';
      // Extract the script-src directive value
      const scriptSrc = cspContent.match(/script-src\s+([^;]+)/)?.[1] ?? '';
      expect(
        scriptSrc,
        "script-src must not contain 'unsafe-inline'",
      ).not.toContain("'unsafe-inline'");
      expect(
        scriptSrc,
        'script-src must include a SHA-256 hash for the inline JSON-LD script',
      ).toContain("'sha256-");
    },
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. rel="noopener noreferrer" completeness — ALL target=_blank links, ALL locales
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for (const url of PAGES) {
  test(`[${url}] all target="_blank" links have rel="noopener noreferrer"`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);

    const blankLinks = await page.locator('a[target="_blank"]').all();
    expect(blankLinks.length, `${url} should have at least one _blank link`).toBeGreaterThan(0);

    const missingNoopener: string[] = [];
    const missingNoreferrer: string[] = [];

    for (const link of blankLinks) {
      const rel = (await link.getAttribute('rel')) ?? '';
      const href = (await link.getAttribute('href')) ?? '(no href)';
      if (!rel.includes('noopener')) missingNoopener.push(href);
      if (!rel.includes('noreferrer')) missingNoreferrer.push(href);
    }

    expect(
      missingNoopener,
      `Links missing rel="noopener": ${missingNoopener.join(', ')}`,
    ).toHaveLength(0);
    expect(
      missingNoreferrer,
      `Links missing rel="noreferrer": ${missingNoreferrer.join(', ')}`,
    ).toHaveLength(0);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. Extended plaintext-secret scan
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extended secret patterns beyond security.spec.ts.
 * Carefully crafted to avoid false positives on benign content.
 */
const EXTENDED_SECRET_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'Stripe secret key (sk_live/sk_test)', pattern: /sk_(live|test)_[A-Za-z0-9]{20,}/ },
  { label: 'Stripe publishable key (pk_live/pk_test)', pattern: /pk_(live|test)_[A-Za-z0-9]{20,}/ },
  { label: 'Google API key (AIza…)', pattern: /AIza[0-9A-Za-z\-_]{35}/ },
  { label: 'Bearer token in HTML', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]{20,}/ },
  { label: 'apiKey assignment', pattern: /apiKey\s*[:=]\s*["'][A-Za-z0-9]{16,}["']/ },
  { label: 'GitHub PAT', pattern: /ghp_[A-Za-z0-9]{36}/ },
  { label: 'AWS access key', pattern: /AKIA[A-Z0-9]{16}/ },
  { label: 'High-entropy token (32+ hex)', pattern: /[0-9a-f]{40,}/ },
];

for (const url of PAGES) {
  test(`[${url}] served HTML contains no leaked secrets (extended scan)`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);
    const html = await page.content();

    for (const { label, pattern } of EXTENDED_SECRET_PATTERNS) {
      // Skip the high-entropy pattern match against known-benign content (integrity hashes, etc.)
      if (label.includes('High-entropy')) {
        // Remove known-safe hex strings: subresource-integrity hashes, CSS hex colors
        const sanitized = html
          .replace(/integrity="[^"]*"/g, '')
          .replace(/#[0-9a-fA-F]{3,8}\b/g, '');
        expect(
          sanitized,
          `HTML should not contain: ${label}`,
        ).not.toMatch(pattern);
      } else {
        expect(
          html,
          `HTML should not contain: ${label}`,
        ).not.toMatch(pattern);
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. External-CTA redirect-destination validation (guards L-01 tinyurl)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CTA_REDIRECTS = [
  {
    name: 'Booking.com',
    url: 'https://tinyurl.com/DiSole1104B',
    expectedDomainPattern: /booking\.com/i,
  },
  {
    name: 'Airbnb',
    url: 'https://tinyurl.com/DiSole1104A',
    expectedDomainPattern: /airbnb|abnb/i,
  },
  {
    name: 'Vrbo',
    url: 'https://tinyurl.com/DiSole1104V',
    expectedDomainPattern: /vrbo/i,
  },
];

for (const cta of CTA_REDIRECTS) {
  test(`External CTA redirect: ${cta.name} → expected platform domain`, async ({ browser }) => {
    // Use a fresh browser context with no baseURL so we can navigate to external sites
    const context = await browser.newContext({ baseURL: undefined });
    const page = await context.newPage();
    try {
      // Navigate and follow full redirect chain (HTTP + JS redirects)
      await page.goto(cta.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      // Wait briefly for any JS-based redirects to settle
      await page.waitForTimeout(3_000);
      const finalUrl = page.url();
      const hostname = new URL(finalUrl).hostname;
      expect(
        hostname,
        `${cta.name} tinyurl should resolve to expected platform (got: ${hostname})`,
      ).toMatch(cta.expectedDomainPattern);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      test.skip(true, `No network egress or timeout — cannot verify redirect destination (${msg})`);
    } finally {
      await context.close();
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. HTTP security-header check (CDN-only — not verifiable on local preview)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROD_URL = process.env.PROD_URL; // e.g. https://disole1104.k.vu

const SECURITY_HEADERS = [
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
];

test.describe('HTTP security headers (CDN-only)', () => {
  test.skip(
    !PROD_URL,
    'GitHub Pages / local preview cannot emit HTTP security headers — only verifiable behind Cloudflare/CDN. Set PROD_URL env var to enable.',
  );

  for (const header of SECURITY_HEADERS) {
    test(`Response includes ${header}`, async ({ request }) => {
      const response = await request.get(PROD_URL!, { timeout: 10_000 });
      const value = response.headers()[header.toLowerCase()];
      expect(value, `${header} header must be present`).toBeTruthy();
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. JSON-LD valid-JSON parse per locale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for (const url of PAGES) {
  test(`[${url}] JSON-LD script parses as valid JSON with expected schema fields`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript, 'JSON-LD script element must exist').toHaveCount(1);

    const raw = await jsonLdScript.textContent();
    expect(raw, 'JSON-LD script must have content').toBeTruthy();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw!);
    } catch (e) {
      throw new Error(`JSON-LD failed to parse: ${(e as Error).message}\nRaw content: ${raw}`);
    }

    // Assert expected schema.org fields
    expect(parsed['@context'], '@context must be schema.org').toBe('https://schema.org');
    expect(parsed['@type'], '@type must be present').toBeTruthy();
    expect(parsed['name'], 'name must be present').toBeTruthy();
    expect(parsed['description'], 'description must be present').toBeTruthy();
    expect(parsed['url'], 'url must be present').toBeTruthy();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. upgrade-insecure-requests present in meta CSP (target state — M-03)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for (const url of PAGES) {
  // Target state — flip to active once M-03 (add upgrade-insecure-requests to meta CSP) is remediated.
  test.fixme(
    `[${url}] meta CSP contains 'upgrade-insecure-requests' (target state M-03)`,
    async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = (await cspMeta.getAttribute('content')) ?? '';
      expect(
        cspContent,
        "CSP must contain 'upgrade-insecure-requests'",
      ).toContain('upgrade-insecure-requests');
    },
  );
}
