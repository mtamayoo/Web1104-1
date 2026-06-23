/**
 * src/i18n/utils.ts
 * Translation helpers for Apartasol 1104 Di Sole.
 * Usage:
 *   import { useTranslations, getLangAttr } from '../i18n/utils';
 *   const t = useTranslations('es');
 *   t('hero.slogan') // → "Te va a encantar"
 */
import es from './es.json';
import en from './en.json';
import fr from './fr.json';

export type Locale = 'es' | 'en' | 'fr';

/** HTML lang attribute value for each locale — region-qualified for consistency with sitemap hreflang */
export const LANG_ATTRS: Record<Locale, string> = {
  es: 'es-CO',
  en: 'en-US',
  fr: 'fr-FR',
};

/** Open Graph locale code for each locale */
export const OG_LOCALES: Record<Locale, string> = {
  es: 'es_CO',
  en: 'en_US',
  fr: 'fr_FR',
};

const translations: Record<Locale, Record<string, unknown>> = { es, en, fr };

/** Get the HTML lang attribute for a locale */
export function getLangAttr(locale: Locale): string {
  return LANG_ATTRS[locale];
}

/** Get the OG locale string for a locale */
export function getOgLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

/** Infer current locale from a URL pathname (Astro i18n, prefixDefaultLocale: false) */
export function getLocaleFromURL(pathname: string): Locale {
  if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
  if (pathname.startsWith('/fr/') || pathname === '/fr') return 'fr';
  // Account for base path (e.g. /Web1104-1/en/)
  if (/\/en(\/|$)/.test(pathname)) return 'en';
  if (/\/fr(\/|$)/.test(pathname)) return 'fr';
  return 'es';
}

/** Resolve a dot-notation key against a nested object. Returns undefined if not found. */
function resolve(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.');
  let node: unknown = obj;
  for (const part of parts) {
    if (node !== null && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Returns a translation function for the given locale.
 * Falls back to Spanish if the key is missing in the requested locale.
 * Falls back to the key string itself if not found in either locale.
 */
export function useTranslations(locale: Locale) {
  const dict = translations[locale];
  const fallback = translations['es'];

  return function t(key: string): string {
    return resolve(dict, key) ?? resolve(fallback, key) ?? key;
  };
}
