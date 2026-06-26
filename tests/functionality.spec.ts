/**
 * tests/functionality.spec.ts
 * Functional test suite for Apartasol 1104 Di Sole.
 *
 * Covers:
 *  - All three locales (es / en / fr) load HTTP 200 with correct <title> and <html lang>
 *  - Nav anchor links resolve to in-page section IDs (no broken #anchors)
 *  - LanguagePicker switches between locales and lands on the right URL
 *  - Booking / Airbnb / Vrbo / Google Maps external links have correct hrefs
 *  - Gallery thumbnail images load without 404
 *  - Key sections render expected localised headings from i18n JSON
 */
import { test, expect, type Page } from '@playwright/test';

// ── Constants ────────────────────────────────────────────────────────────────

const LOCALES = [
  {
    locale: 'es',
    url: '/',
    lang: 'es-CO',
    title: 'Apartasol 1104 Citadela Di Sole \u2013 Santa Fe de Antioquia',
    headings: {
      apartment: 'El Apartamento',
      amenities: 'Amenidades',
      santafe:   'Santa Fe de Antioquia',
      gallery:   'Galer\u00eda',
      location:  'Ubicaci\u00f3n',
      booking:   'Reservar',
    },
  },
  {
    locale: 'en',
    url: '/en/',
    lang: 'en-US',
    title: 'Apartasol 1104 Citadela Di Sole \u2013 Santa Fe de Antioquia, Colombia',
    headings: {
      apartment: 'The Apartment',
      amenities: 'Amenities',
      santafe:   'Santa Fe de Antioquia',
      gallery:   'Gallery',
      location:  'Location',
      booking:   'Book Your Stay',
    },
  },
  {
    locale: 'fr',
    url: '/fr/',
    lang: 'fr-FR',
    title: 'Apartasol 1104 Citadela Di Sole \u2013 Santa Fe de Antioquia, Colombie',
    headings: {
      apartment: 'Appartement',   // L'Appartement — skip apostrophe to avoid encoding issues
      amenities: '\u00c9quipements',
      santafe:   'Santa Fe de Antioquia',
      gallery:   'Galerie',
      location:  'Localisation',
      booking:   'R\u00e9server',
    },
  },
] as const;

// Section IDs defined in page components
const SECTION_IDS = ['hero', 'apartamento', 'amenidades', 'santa-fe', 'galeria', 'ubicacion', 'reservar'];

// External links from src/config/site.ts
const BOOKING_URL     = 'https://www.booking.com/hotel/co/citadela-di-sole-santafe-de-antioquia.es.html';
const AIRBNB_URL      = 'https://www.airbnb.com/rooms/988444281810031125';
const VRBO_URL        = 'https://www.vrbo.com/es-es/p11496031';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=6.5576942,-75.8321498';

// Key gallery thumbnail paths (400 px — always generated)
const KEY_GALLERY_IMAGES = [
  '/galeria/salon-dia-400.webp',
  '/galeria/piscina-tobogan-400.webp',
  '/galeria/balcon-400.webp',
];

// ── Helper ───────────────────────────────────────────────────────────────────

/** Prevent the LanguagePicker auto-redirect from firing (sessionStorage guard). */
async function noRedirect(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('dis-lang-detected', '1');
  });
}

// ── Per-locale test suite ────────────────────────────────────────────────────

for (const { locale, url, lang, title, headings } of LOCALES) {
  test.describe(`[${locale}] locale`, () => {

    test('loads with HTTP 200', async ({ page }) => {
      await noRedirect(page);
      const response = await page.goto(url);
      expect(response?.status(), `HTTP status for ${url}`).toBe(200);
    });

    test('has correct <title>', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      await expect(page).toHaveTitle(title);
    });

    test('has correct <html lang>', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang, `html[lang] for ${locale}`).toBe(lang);
    });

    test('all nav anchor IDs exist in page', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      for (const id of SECTION_IDS) {
        const el = page.locator(`#${id}`);
        await expect(el, `#${id} should exist`).toHaveCount(1);
      }
    });

    test('key section headings are localised correctly', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      await expect(page.locator('#apartamento h2, #apartamento [id$="-heading"]').first()).toContainText(headings.apartment);
      await expect(page.locator('#amenidades h2, #amenidades [id$="-heading"]').first()).toContainText(headings.amenities);
      await expect(page.locator('#galeria h2, #galeria [id$="-heading"]').first()).toContainText(headings.gallery);
      await expect(page.locator('#ubicacion h2, #ubicacion [id$="-heading"]').first()).toContainText(headings.location);
      await expect(page.locator('#reservar h2, #reservar [id$="-heading"]').first()).toContainText(headings.booking);
    });

    test('Booking / Airbnb / Vrbo external link hrefs are correct', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      // Hero CTAs — use first() since buttons appear in both hero & booking section
      const bookingLinks = page.locator(`a[href="${BOOKING_URL}"]`);
      const airbnbLinks  = page.locator(`a[href="${AIRBNB_URL}"]`);
      const vrboLinks    = page.locator(`a[href="${VRBO_URL}"]`);
      await expect(bookingLinks.first(), 'Booking.com CTA').toBeVisible();
      await expect(airbnbLinks.first(),  'Airbnb CTA').toBeVisible();
      await expect(vrboLinks.first(),    'Vrbo CTA').toBeVisible();
    });

    test('Google Maps link has correct href', async ({ page }) => {
      await noRedirect(page);
      await page.goto(url);
      const mapsLink = page.locator(`a[href="${GOOGLE_MAPS_URL}"]`);
      await expect(mapsLink.first(), 'Google Maps link').toBeVisible();
    });

  });
}

// ── Gallery images load ──────────────────────────────────────────────────────

test.describe('Gallery images', () => {
  test('key gallery thumbnails return 200', async ({ request }) => {
    for (const imgPath of KEY_GALLERY_IMAGES) {
      const response = await request.get(imgPath);
      expect(response.status(), `GET ${imgPath}`).toBe(200);
    }
  });
});

// ── LanguagePicker navigation ────────────────────────────────────────────────

test.describe('LanguagePicker navigation', () => {

  test('EN picker link on es page navigates to /en/', async ({ page }) => {
    await noRedirect(page);
    await page.goto('/');
    // The nav LanguagePicker renders links with hreflang; click EN
    const enLink = page.locator('nav a[hreflang="en-US"]').first();
    await enLink.click();
    await expect(page).toHaveURL(/\/en\//);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en-US');
  });

  test('FR picker link on es page navigates to /fr/', async ({ page }) => {
    await noRedirect(page);
    await page.goto('/');
    const frLink = page.locator('nav a[hreflang="fr-FR"]').first();
    await frLink.click();
    await expect(page).toHaveURL(/\/fr\//);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('fr-FR');
  });

  test('ES picker link on /en/ page navigates back to /', async ({ page }) => {
    await noRedirect(page);
    await page.goto('/en/');
    const esLink = page.locator('nav a[hreflang="es-CO"]').first();
    await esLink.click();
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es-CO');
  });

});
