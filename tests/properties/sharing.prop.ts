/**
 * Property 16: Email mailto link contains title, URL, and excerpt
 * Validates: Requirements 18.1, 18.2, 18.3
 *
 * "For any document with a title, URL, and excerpt, the mailto link generator SHALL produce
 * a mailto: URI where the subject contains the document title and the body contains both the
 * document URL and excerpt, all properly URI-encoded."
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateMailtoLink } from '@/components/features/EmailShare';

/**
 * Arbitrary for generating document titles (non-empty strings with various characters).
 */
const titleArb = fc.stringOf(
  fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
    ...'-_.,!?:;\'\"()[]{}@#$%^&*+=<>/~`'.split(''),
    ...'你好世界日本語한국어'.split('')
  ),
  { minLength: 1, maxLength: 100 }
);

/**
 * Arbitrary for generating document URLs.
 */
const urlArb = fc
  .tuple(
    fc.constantFrom('https://example.com', 'https://docs.site.io', 'https://webdoc.dev'),
    fc.array(
      fc.stringOf(
        fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')),
        { minLength: 1, maxLength: 20 }
      ),
      { minLength: 1, maxLength: 4 }
    )
  )
  .map(([base, segments]) => `${base}/${segments.join('/')}`);

/**
 * Arbitrary for generating document excerpts (non-empty text content).
 */
const excerptArb = fc.stringOf(
  fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
    ...'-.,!?:;\'\"()'.split(''),
    ...'你好世界日本語한국어'.split('')
  ),
  { minLength: 1, maxLength: 200 }
);

describe('Feature: multilingual-docs-site, Property 16: Email mailto link contains title, URL, and excerpt', () => {
  it('mailto link starts with "mailto:" scheme', () => {
    /**
     * **Validates: Requirements 18.1, 18.2, 18.3**
     *
     * For any document with a title, URL, and excerpt, the generated link
     * SHALL start with the "mailto:" scheme.
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);
        expect(result).toMatch(/^mailto:/);
      }),
      { numRuns: 100 }
    );
  });

  it('subject contains the document title, properly URI-encoded', () => {
    /**
     * **Validates: Requirements 18.2**
     *
     * For any document title, the mailto URI subject parameter SHALL contain
     * the document title in URI-encoded form.
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);
        const encodedTitle = encodeURIComponent(title);

        expect(result).toContain(`subject=${encodedTitle}`);
      }),
      { numRuns: 100 }
    );
  });

  it('body contains the document URL, properly URI-encoded', () => {
    /**
     * **Validates: Requirements 18.3**
     *
     * For any document URL, the mailto URI body parameter SHALL contain
     * the document URL in URI-encoded form.
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);

        // Decode the body parameter and check it contains the URL
        const bodyMatch = result.match(/body=([^&]*)/);
        expect(bodyMatch).not.toBeNull();

        const decodedBody = decodeURIComponent(bodyMatch![1]);
        expect(decodedBody).toContain(url);
      }),
      { numRuns: 100 }
    );
  });

  it('body contains the document excerpt, properly URI-encoded', () => {
    /**
     * **Validates: Requirements 18.3**
     *
     * For any document excerpt, the mailto URI body parameter SHALL contain
     * the document excerpt in URI-encoded form.
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);

        // Decode the body parameter and check it contains the excerpt
        const bodyMatch = result.match(/body=([^&]*)/);
        expect(bodyMatch).not.toBeNull();

        const decodedBody = decodeURIComponent(bodyMatch![1]);
        expect(decodedBody).toContain(excerpt);
      }),
      { numRuns: 100 }
    );
  });

  it('all special characters are properly URI-encoded', () => {
    /**
     * **Validates: Requirements 18.1, 18.2, 18.3**
     *
     * For any title, URL, and excerpt containing special characters,
     * the subject and body parameters SHALL be properly URI-encoded
     * (no raw spaces, ampersands, or other reserved characters outside encoding).
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);

        // Extract the part after "mailto:?"
        const queryPart = result.replace(/^mailto:\?/, '');

        // Split parameters by &
        const params = queryPart.split('&');
        expect(params.length).toBeGreaterThanOrEqual(2);

        // Each parameter value should be properly encoded
        // (no raw spaces or newlines in the encoded values)
        for (const param of params) {
          const eqIndex = param.indexOf('=');
          const value = param.substring(eqIndex + 1);
          // Raw spaces should be encoded as %20
          expect(value).not.toMatch(/ /);
          // Raw newlines should be encoded
          expect(value).not.toMatch(/\n/);
          expect(value).not.toMatch(/\r/);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('decoding the subject yields the original title', () => {
    /**
     * **Validates: Requirements 18.2**
     *
     * For any document title, decoding the subject parameter from the mailto URI
     * SHALL yield the original title unchanged.
     */
    fc.assert(
      fc.property(titleArb, urlArb, excerptArb, (title, url, excerpt) => {
        const result = generateMailtoLink(title, url, excerpt);

        const subjectMatch = result.match(/subject=([^&]*)/);
        expect(subjectMatch).not.toBeNull();

        const decodedSubject = decodeURIComponent(subjectMatch![1]);
        expect(decodedSubject).toBe(title);
      }),
      { numRuns: 100 }
    );
  });
});
