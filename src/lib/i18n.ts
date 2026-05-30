/**
 * Internationalization utilities for locale detection, validation, and URL path helpers.
 * Implements browser Accept-Language header parsing and locale matching.
 */

import { siteConfig } from '../config/site.config';

const { supportedLocales, defaultLocale } = siteConfig;

/**
 * Parse an Accept-Language header into an ordered list of locale preferences.
 * Each entry has a locale string and a quality factor (q value).
 *
 * Example input: "en-US,en;q=0.9,zh;q=0.8"
 * Returns: [{ locale: "en-US", q: 1 }, { locale: "en", q: 0.9 }, { locale: "zh", q: 0.8 }]
 */
function parseAcceptLanguage(acceptLanguage: string): { locale: string; q: number }[] {
  if (!acceptLanguage || acceptLanguage.trim() === '') {
    return [];
  }

  return acceptLanguage
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split(';');
      const locale = parts[0].trim();
      let q = 1;

      for (let i = 1; i < parts.length; i++) {
        const param = parts[i].trim();
        if (param.startsWith('q=')) {
          const parsed = parseFloat(param.substring(2));
          if (!isNaN(parsed)) {
            q = parsed;
          }
        }
      }

      return { locale, q };
    })
    .filter((entry) => entry.locale.length > 0)
    .sort((a, b) => b.q - a.q);
}

/**
 * Detect the best matching supported locale from a browser Accept-Language header.
 *
 * Matching strategy:
 * 1. Exact match (e.g., "en" matches "en")
 * 2. Prefix match (e.g., "en-US" matches "en")
 * 3. Default to configured default locale ("zh") if no match found
 *
 * @param acceptLanguage - The value of the Accept-Language HTTP header
 * @returns A supported locale string
 */
export function detectLocale(acceptLanguage: string): string {
  const preferences = parseAcceptLanguage(acceptLanguage);

  for (const { locale } of preferences) {
    // Exact match
    if (supportedLocales.includes(locale)) {
      return locale;
    }

    // Prefix match: extract the primary language subtag (e.g., "en-US" → "en")
    const primaryTag = locale.split('-')[0].toLowerCase();
    if (supportedLocales.includes(primaryTag)) {
      return primaryTag;
    }
  }

  return defaultLocale;
}

/**
 * Check if a locale string is in the list of supported locales.
 *
 * @param locale - The locale string to validate
 * @returns true if the locale is supported, false otherwise
 */
export function isValidLocale(locale: string): boolean {
  return supportedLocales.includes(locale);
}

/**
 * Construct a locale-prefixed URL path.
 *
 * @param locale - The locale to prefix
 * @param path - The path to prefix (should start with "/" or be empty)
 * @returns The locale-prefixed path (e.g., "/en/docs/intro")
 */
export function getLocalePath(locale: string, path: string): string {
  // Normalize path: ensure it starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // If path is just "/", return "/{locale}"
  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

/**
 * Generate alternate locale URLs for all supported locales.
 * Useful for hreflang tags and language switcher components.
 *
 * @param path - The path without locale prefix (e.g., "/docs/intro")
 * @returns Array of objects with locale and full URL for each supported locale
 */
export function getAlternateLocaleUrls(path: string): { locale: string; url: string }[] {
  return supportedLocales.map((locale) => ({
    locale,
    url: getLocalePath(locale, path),
  }));
}
