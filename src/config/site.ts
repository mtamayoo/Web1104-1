/**
 * src/config/site.ts
 * Central configuration for external links and site constants.
 *
 * IMPORTANT — section 12 of the spec says these URLs are PENDING.
 * Replace the placeholder values below before going live:
 *   - BOOKING_URL: the full Booking.com listing URL for apartment 1104
 *   - AIRBNB_URL:  the full Airbnb listing URL for apartment 1104
 *   - SITE_URL:    update if moving to a custom domain
 *   - BASE_PATH:   set to '' if a custom domain is used (no project-page sub-path)
 */

// ── External booking links ─────────────────────────────────────────────────
/** TODO: Replace with the real Booking.com listing URL (section 12 — pending) */
export const BOOKING_URL = '#booking-pending' as const;

/** TODO: Replace with the real Airbnb listing URL (section 12 — pending) */
export const AIRBNB_URL = '#airbnb-pending' as const;

// ── Location ───────────────────────────────────────────────────────────────
export const GEO_LAT = 6.5576942 as const;
export const GEO_LNG = -75.8321498 as const;
export const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${GEO_LAT},${GEO_LNG}` as const;

// ── Identity ───────────────────────────────────────────────────────────────
export const PROPERTY_NAME = 'Apartasol 1104 Citadela DI Sole' as const;
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
/** TODO: Update with actual GitHub username */
export const SITE_ORIGIN = 'https://mtamayoo.github.io' as const;
/** TODO: Set to '' when a custom domain is configured */
export const BASE_PATH = '/Web1104-1' as const;

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
