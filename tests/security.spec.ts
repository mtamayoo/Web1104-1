/**
 * tests/security.spec.ts
 * Security test suite for Apartasol 1104 Di Sole.
 *
 * Covers:
 *  - CSP <meta http-equiv="Content-Security-Policy"> present with expected directives
 *  - External target="_blank" links include rel="noopener" (and ideally noreferrer)
 *  - No obvious secrets/tokens leaked in served HTML
 *  - public/_headers file exists and contains X-Content-Type-Options,
 *    Referrer-Policy, Permissions-Policy
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Constants ────────────────────────────────────────────────────────────────

const PAGES = ['/', '/en/', '/fr/'] as const;

/** Expected CSP directive prefixes (as they appear in Layout.astro) */
const EXPECTED_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
];

/**
 * Patterns that would indicate a secret/token leak in page HTML.
 * Keep generic so as not to match our own test file content.
 */
const SECRET_PATTERNS: RegExp[] = [
  /ghp_[A-Za-z0-9]{36}/,          // GitHub PAT
  /sk-[A-Za-z0-9]{48}/,            // OpenAI secret key
  /AIza[0-9A-Za-z\-_]{35}/,        // Google API key
  /AKIA[A-Z0-9]{16}/,              // AWS access key ID
  /[a-z0-9]{32}:[a-z0-9]{32}/,    // Twilio-style dual token
];

// ── Helper ───────────────────────────────────────────────────────────────────

async function noRedirect(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('dis-lang-detected', '1');
  });
}

// ── CSP meta tag ─────────────────────────────────────────────────────────────

for (const url of PAGES) {
  test.describe(`[${url}] CSP meta`, () => {

    test('CSP meta tag is present', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      await expect(cspMeta, 'CSP meta element').toHaveCount(1);
    });

    test('CSP meta contains all expected directives', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = await cspMeta.getAttribute('content');
      expect(cspContent, 'CSP content attribute must not be null').toBeTruthy();

      for (const directive of EXPECTED_CSP_DIRECTIVES) {
        expect(
          cspContent,
          `CSP should contain directive: ${directive}`,
        ).toContain(directive);
      }
    });

  });
}

// ── rel="noopener" on _blank links ───────────────────────────────────────────

for (const url of PAGES) {
  test(`[${url}] all target="_blank" links have rel="noopener"`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);

    const blankLinks = await page.locator('a[target="_blank"]').all();
    expect(blankLinks.length, `${url} should have at least one _blank link`).toBeGreaterThan(0);

    const missing: string[] = [];
    for (const link of blankLinks) {
      const rel   = (await link.getAttribute('rel')) ?? '';
      const href  = (await link.getAttribute('href')) ?? '(no href)';
      if (!rel.includes('noopener')) {
        missing.push(href);
      }
    }
    expect(
      missing,
      `Links missing rel="noopener": ${missing.join(', ')}`,
    ).toHaveLength(0);
  });
}

// Separate check for noreferrer (advisory — soft assertion so it doesn't block CI)
for (const url of PAGES) {
  test(`[${url}] _blank links ideally also include rel="noreferrer"`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);

    const blankLinks = await page.locator('a[target="_blank"]').all();
    const missing: string[] = [];
    for (const link of blankLinks) {
      const rel  = (await link.getAttribute('rel')) ?? '';
      const href = (await link.getAttribute('href')) ?? '(no href)';
      if (!rel.includes('noreferrer')) {
        missing.push(href);
      }
    }
    // Soft assertion — informational only; noreferrer is best-practice not a hard requirement
    expect.soft(
      missing,
      `Links missing rel="noreferrer" (advisory): ${missing.join(', ')}`,
    ).toHaveLength(0);
  });
}

// ── No leaked secrets in HTML ─────────────────────────────────────────────────

for (const url of PAGES) {
  test(`[${url}] served HTML contains no obvious leaked secrets`, async ({ page }) => {
    await noRedirect(page);
    await page.goto(url);
    const html = await page.content();

    for (const pattern of SECRET_PATTERNS) {
      expect(
        html,
        `HTML should not contain secret matching ${pattern}`,
      ).not.toMatch(pattern);
    }
  });
}

// ── public/_headers file (build-level check) ──────────────────────────────────

test.describe('public/_headers file', () => {
  const headersPath = path.join(process.cwd(), 'public', '_headers');

  test('_headers file exists', () => {
    expect(fs.existsSync(headersPath), `${headersPath} must exist`).toBe(true);
  });

  test('_headers contains X-Content-Type-Options', () => {
    const content = fs.readFileSync(headersPath, 'utf-8');
    expect(content).toContain('X-Content-Type-Options');
  });

  test('_headers contains Referrer-Policy', () => {
    const content = fs.readFileSync(headersPath, 'utf-8');
    expect(content).toContain('Referrer-Policy');
  });

  test('_headers contains Permissions-Policy', () => {
    const content = fs.readFileSync(headersPath, 'utf-8');
    expect(content).toContain('Permissions-Policy');
  });

  test('_headers contains Content-Security-Policy directive', () => {
    const content = fs.readFileSync(headersPath, 'utf-8');
    expect(content).toContain('Content-Security-Policy');
  });
});
