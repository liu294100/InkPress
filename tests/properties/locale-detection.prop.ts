/**
 * Property 5: Browser language detection matches supported locales
 * Validates: Requirements 4.4
 *
 * For any browser Accept-Language header value, the locale detection function
 * SHALL return a locale from the supported locales list (zh, en, ja, ko, fr, de, es, ms, th),
 * defaulting to the configured default locale when no match is found.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { detectLocale } from '@/lib/i18n';

const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];
const DEFAULT_LOCALE = 'zh';

// --- Generators ---

/** Generate a random quality value between 0 and 1 with up to 3 decimal places */
const qValueArb = fc.float({ min: 0, max: 1, noNaN: true }).map((v) => Math.round(v * 1000) / 1000);

/** Generate a supported locale */
const supportedLocaleArb = fc.constantFrom(...SUPPORTED_LOCALES);

/** Generate an unsupported locale code (2-3 letter codes not in supported list) */
const unsupportedLocaleArb = fc
  .stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 2, maxLength: 3 })
  .filter((s) => !SUPPORTED_LOCALES.includes(s));

/** Generate a regional variant like "en-US", "zh-CN" */
const regionCodeArb = fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), {
  minLength: 2,
  maxLength: 2,
});

/** Generate a language tag with optional region (e.g. "en", "en-US") */
const languageTagArb = fc.oneof(
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 2, maxLength: 3 }),
  fc.tuple(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 2, maxLength: 3 }),
    regionCodeArb
  ).map(([lang, region]) => `${lang}-${region}`)
);

/** Generate a single Accept-Language entry with optional quality (e.g. "en;q=0.9" or "en") */
const acceptLanguageEntryArb = fc
  .tuple(languageTagArb, fc.boolean(), qValueArb)
  .map(([locale, hasQ, q]) => (hasQ ? `${locale};q=${q}` : locale));

/** Generate a full Accept-Language header with multiple entries */
const acceptLanguageHeaderArb = fc
  .array(acceptLanguageEntryArb, { minLength: 0, maxLength: 8 })
  .map((entries) => entries.join(','));

/** Generate an Accept-Language header that contains at least one supported locale */
const headerWithSupportedLocaleArb = fc
  .tuple(
    supportedLocaleArb,
    fc.boolean(),
    regionCodeArb,
    fc.array(acceptLanguageEntryArb, { minLength: 0, maxLength: 5 })
  )
  .map(([locale, hasRegion, region, otherEntries]) => {
    const tag = hasRegion ? `${locale}-${region}` : locale;
    // Put the supported locale entry with high priority (no q = default 1.0)
    return [tag, ...otherEntries].join(',');
  });

/** Generate an Accept-Language header with ONLY unsupported locales */
const headerWithOnlyUnsupportedArb = fc
  .array(
    fc.tuple(unsupportedLocaleArb, fc.boolean(), qValueArb).map(([locale, hasQ, q]) =>
      hasQ ? `${locale};q=${q}` : locale
    ),
    { minLength: 1, maxLength: 5 }
  )
  .map((entries) => entries.join(','));

// --- Tests ---

describe('Feature: multilingual-docs-site, Property 5: Browser language detection matches supported locales', () => {
  it('result is ALWAYS one of the 9 supported locales for any Accept-Language header', () => {
    fc.assert(
      fc.property(acceptLanguageHeaderArb, (header) => {
        const result = detectLocale(header);
        expect(SUPPORTED_LOCALES).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  it('when the header contains a supported locale, that locale (or a matching one) is returned', () => {
    fc.assert(
      fc.property(headerWithSupportedLocaleArb, (header) => {
        const result = detectLocale(header);
        // The result must be a supported locale
        expect(SUPPORTED_LOCALES).toContain(result);
        // And it must not be the default unless the supported locale in the header IS the default
        // More specifically: the result should match one of the supported locales present in the header
        const headerLangs = header.split(',').map((entry) => {
          const tag = entry.split(';')[0].trim();
          const primary = tag.split('-')[0].toLowerCase();
          return primary;
        });
        const supportedInHeader = headerLangs.filter((lang) => SUPPORTED_LOCALES.includes(lang));
        expect(supportedInHeader).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  it('when no supported locale matches, "zh" (default) is returned', () => {
    fc.assert(
      fc.property(headerWithOnlyUnsupportedArb, (header) => {
        const result = detectLocale(header);
        expect(result).toBe(DEFAULT_LOCALE);
      }),
      { numRuns: 100 }
    );
  });

  it('the function never throws for any input', () => {
    fc.assert(
      fc.property(fc.string(), (arbitraryInput) => {
        expect(() => detectLocale(arbitraryInput)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });
});
