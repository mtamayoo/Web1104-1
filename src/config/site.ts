/**
 * src/config/site.ts
 * Central configuration for external links and site constants.
 *
 * External booking URLs are live. Update here if listing URLs change:
 *   - BOOKING_URL: the full Booking.com listing URL for apartment 1104
 *   - AIRBNB_URL:  the full Airbnb listing URL for apartment 1104
 *   - SITE_URL:    update if moving to a custom domain
 *   - BASE_PATH:   automatically derived from astro.config.mjs `base` via
 *                 import.meta.env.BASE_URL — no manual sync needed.
 */

// ── External booking links ─────────────────────────────────────────────────
/** Live Booking.com listing URL. */
export const BOOKING_URL = 'https://www.booking.com/hotel/co/citadela-di-sole-santafe-de-antioquia.es.html' as const;
// tinyurl archive: https://tinyurl.com/DiSole1104B

/** Live Airbnb listing URL. */
export const AIRBNB_URL = 'https://www.airbnb.com/rooms/988444281810031125' as const;
// tinyurl archive: https://tinyurl.com/DiSole1104A

/** Live Vrbo listing URL. */
export const VRBO_URL = 'https://www.vrbo.com/es-es/p11496031' as const;
// tinyurl archive: https://tinyurl.com/DiSole1104V

// ── Location ───────────────────────────────────────────────────────────────
export const GEO_LAT = 6.5576942 as const;
export const GEO_LNG = -75.8321498 as const;
export const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${GEO_LAT},${GEO_LNG}` as const;

// ── Identity ───────────────────────────────────────────────────────────────
export const PROPERTY_NAME = 'Apartasol 1104 Citadela Di Sole' as const;
export const PROPERTY_LOCALITY = 'Santa Fe de Antioquia' as const;
export const PROPERTY_REGION = 'Antioquia' as const;
export const PROPERTY_COUNTRY = 'CO' as const;
export const PROPERTY_MAX_GUESTS = 8 as const;
export const PROPERTY_BEDROOMS = 2 as const;
export const PROPERTY_BATHROOMS = 3 as const;
export const COPYRIGHT_YEAR = 2026 as const;

// ── Deployment ─────────────────────────────────────────────────────────────
// These mirror astro.config.mjs — kept here so components can reference them
// without importing Vite env directly.
/** Custom domain served via GitHub Pages (public/CNAME). */
export const SITE_ORIGIN = 'https://disole1104.k.vu' as const;

// Derived from astro.config.mjs `base` (via Vite). Guarantees internal links
// always match the base Astro is actually serving with — no dual source of truth.
// import.meta.env.BASE_URL = '/' for the custom domain (served at root).
const _rawBase = import.meta.env.BASE_URL ?? '/';
export const BASE_PATH = _rawBase === '/' ? '' : _rawBase.replace(/\/+$/, '');

// ── Cloudflare Web Analytics ───────────────────────────────────────────────
/**
 * TODO: Replace with your real Cloudflare Analytics token (section 8.3).
 *
 * SECURITY NOTE: This is a PUBLIC Cloudflare Web Analytics site token — it is
 * intentionally client-visible (embedded in the page HTML to identify the
 * analytics property). It is NOT a secret key and does NOT grant write/admin
 * access to your Cloudflare account. Committing this value here is by design
 * and does NOT violate CTRL-SECRETS. (Verified by Sloth security review.)
 *
 * Empty string = analytics beacon disabled (no beacon injected into HTML).
 */
export const CF_ANALYTICS_TOKEN = '' as const; // empty = disabled

// ── Microsoft Clarity Analytics ───────────────────────────────────────────
/**
 * Microsoft Clarity project id (section 8.3).
 *
 * SECURITY NOTE: This is a PUBLIC Clarity project id — it is intentionally
 * client-visible (embedded in the page HTML to identify the analytics
 * property). It is NOT a secret key and does NOT grant write/admin access to
 * your Microsoft Clarity account.
 *
 * Empty string = analytics loader disabled (no Clarity config or script).
 */
export const CLARITY_PROJECT_ID = 'xg4mc52ro4' as const; // empty = disabled
