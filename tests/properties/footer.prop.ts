/**
 * Property 18: Footer social links render conditionally
 * Property 19: Copyright notice format
 * Validates: Requirements 21.3, 21.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateCopyrightNotice, renderSocialLink } from '@/lib/footer';
import type { SocialLink } from '@/lib/types';

/**
 * All supported social media platforms.
 */
const platforms: SocialLink['platform'][] = ['facebook', 'youtube', 'x', 'instagram', 'threads', 'wechat'];

/**
 * Arbitrary for generating a social platform.
 */
const platformArb = fc.constantFrom(...platforms);

/**
 * Arbitrary for generating a valid URL (non-empty, trimmed).
 */
const validUrlArb = fc
  .tuple(
    fc.constantFrom('https://facebook.com/', 'https://youtube.com/', 'https://x.com/', 'https://instagram.com/', 'https://threads.net/', 'https://wechat.com/'),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), { minLength: 1, maxLength: 30 })
  )
  .map(([base, path]) => `${base}${path}`);

/**
 * Arbitrary for generating an empty or whitespace-only URL.
 */
const emptyUrlArb = fc.constantFrom('', '   ', '\t', '\n', undefined);

/**
 * Arbitrary for generating a SocialLink with a valid URL.
 */
const socialLinkWithUrlArb = fc.tuple(platformArb, validUrlArb).map(([platform, url]) => ({
  platform,
  url,
  icon: platform,
} as SocialLink));

/**
 * Arbitrary for generating a SocialLink without a valid URL (empty or undefined).
 */
const socialLinkWithoutUrlArb = fc.tuple(platformArb, emptyUrlArb).map(([platform, url]) => ({
  platform,
  ...(url !== undefined ? { url } : {}),
  icon: platform,
} as SocialLink));

describe('Feature: multilingual-docs-site, Property 18: Footer social links render conditionally', () => {
  it('when URL is empty or not provided, renderSocialLink returns hasLink=false (no active hyperlink)', () => {
    /**
     * **Validates: Requirements 21.3**
     *
     * For any social media platform configuration where the URL is empty or not provided,
     * the footer SHALL render the platform icon without an active hyperlink.
     */
    fc.assert(
      fc.property(socialLinkWithoutUrlArb, (link) => {
        const result = renderSocialLink(link);
        expect(result.hasLink).toBe(false);
        expect(result.href).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('when a valid URL is provided, renderSocialLink returns hasLink=true with the URL as href', () => {
    /**
     * **Validates: Requirements 21.3**
     *
     * For any social media platform configuration where a valid URL is provided,
     * the icon SHALL link to that URL.
     */
    fc.assert(
      fc.property(socialLinkWithUrlArb, (link) => {
        const result = renderSocialLink(link);
        expect(result.hasLink).toBe(true);
        expect(result.href).toBe(link.url);
      }),
      { numRuns: 100 }
    );
  });

  it('renderSocialLink correctly distinguishes valid vs. empty URLs for all platforms', () => {
    /**
     * **Validates: Requirements 21.3**
     *
     * For any platform, the render decision is solely based on whether the URL is
     * a non-empty, non-whitespace string.
     */
    fc.assert(
      fc.property(
        platformArb,
        fc.oneof(validUrlArb, emptyUrlArb),
        (platform, url) => {
          const link: SocialLink = { platform, icon: platform, ...(url !== undefined ? { url } : {}) };
          const result = renderSocialLink(link);

          const isValidUrl = typeof url === 'string' && url.trim().length > 0;
          expect(result.hasLink).toBe(isValidUrl);
          if (isValidUrl) {
            expect(result.href).toBe(url);
          } else {
            expect(result.href).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: multilingual-docs-site, Property 19: Copyright notice format', () => {
  /**
   * Arbitrary for generating a year (reasonable range).
   */
  const yearArb = fc.integer({ min: 1900, max: 2100 });

  /**
   * Arbitrary for generating a non-empty site name.
   */
  const siteNameArb = fc.stringOf(
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
      ...'你好世界WebDoc知识库'.split('')
    ),
    { minLength: 1, maxLength: 50 }
  );

  it('copyright notice matches exact format "© {year} {name}. All rights reserved."', () => {
    /**
     * **Validates: Requirements 21.4**
     *
     * For any year (number) and site name (non-empty string), the copyright generator
     * SHALL produce a string matching the exact format "© {year} {name}. All rights reserved."
     */
    fc.assert(
      fc.property(yearArb, siteNameArb, (year, name) => {
        const result = generateCopyrightNotice(year, name);
        const expected = `© ${year} ${name}. All rights reserved.`;
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('copyright notice starts with © followed by the year', () => {
    /**
     * **Validates: Requirements 21.4**
     *
     * The copyright notice SHALL always start with "© " followed by the year.
     */
    fc.assert(
      fc.property(yearArb, siteNameArb, (year, name) => {
        const result = generateCopyrightNotice(year, name);
        expect(result.startsWith(`© ${year}`)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('copyright notice ends with ". All rights reserved."', () => {
    /**
     * **Validates: Requirements 21.4**
     *
     * The copyright notice SHALL always end with ". All rights reserved."
     */
    fc.assert(
      fc.property(yearArb, siteNameArb, (year, name) => {
        const result = generateCopyrightNotice(year, name);
        expect(result.endsWith('. All rights reserved.')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('copyright notice contains the site name', () => {
    /**
     * **Validates: Requirements 21.4**
     *
     * The copyright notice SHALL contain the provided site name.
     */
    fc.assert(
      fc.property(yearArb, siteNameArb, (year, name) => {
        const result = generateCopyrightNotice(year, name);
        expect(result).toContain(name);
      }),
      { numRuns: 100 }
    );
  });
});
