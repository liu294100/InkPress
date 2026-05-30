/**
 * Property 17: Paywall gating logic
 * Validates: Requirements 20.1, 20.2, 20.4
 *
 * "For any document with paywallEnabled set in frontmatter, when the global paywall feature
 * is disabled, the content access function SHALL return the full document content. When the
 * global paywall is enabled AND the document has paywallEnabled=true, the function SHALL
 * return only a preview. When paywallEnabled is absent from frontmatter, it SHALL default
 * to false."
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getContentAccess } from '@/lib/paywall';
import type { Document, DocumentFrontmatter } from '@/lib/types';

/**
 * Arbitrary for generating document content (non-empty strings of various lengths).
 */
const contentArb = fc.stringOf(
  fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
    ...'\n\t-.,!?:;\'\"()[]{}@#$%^&*+=<>/~`'.split(''),
    ...'你好世界日本語한국어'.split('')
  ),
  { minLength: 1, maxLength: 2000 }
);

/**
 * Arbitrary for generating document frontmatter with explicit paywallEnabled flag.
 */
const frontmatterWithPaywallArb = (paywallEnabled: boolean): fc.Arbitrary<DocumentFrontmatter> =>
  fc.record({
    title: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
    keywords: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
    author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    date: fc.option(fc.string({ minLength: 10, maxLength: 10 }), { nil: undefined }),
    paywallEnabled: fc.constant(paywallEnabled),
    draft: fc.option(fc.boolean(), { nil: undefined }),
  });

/**
 * Arbitrary for generating document frontmatter WITHOUT paywallEnabled field (testing default).
 */
const frontmatterWithoutPaywallArb: fc.Arbitrary<DocumentFrontmatter> =
  fc.record({
    title: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
    keywords: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
    author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    date: fc.option(fc.string({ minLength: 10, maxLength: 10 }), { nil: undefined }),
    draft: fc.option(fc.boolean(), { nil: undefined }),
  });

/**
 * Arbitrary for generating a full Document given frontmatter and content.
 */
const documentArb = (frontmatterArb: fc.Arbitrary<DocumentFrontmatter>): fc.Arbitrary<Document> =>
  fc.tuple(frontmatterArb, contentArb).map(([frontmatter, content]) => ({
    slug: 'test-doc',
    locale: 'en',
    category: 'programming',
    title: frontmatter.title,
    content,
    contentType: 'markdown' as const,
    frontmatter,
    headings: [],
    readingTime: 5,
    lastModified: '2024-01-01',
  }));

describe('Feature: multilingual-docs-site, Property 17: Paywall gating logic', () => {
  it('when global paywall is disabled, getContentAccess always returns full content regardless of paywallEnabled flag', () => {
    /**
     * **Validates: Requirements 20.1, 20.2**
     *
     * For any document (with paywallEnabled true or false), when the global paywall
     * feature is disabled, getContentAccess SHALL return the full document content
     * with fullAccess=true and showPaywallPrompt=false.
     */
    fc.assert(
      fc.property(
        documentArb(frontmatterWithPaywallArb(true)),
        (doc) => {
          const result = getContentAccess(doc, false);
          expect(result.fullAccess).toBe(true);
          expect(result.content).toBe(doc.content);
          expect(result.showPaywallPrompt).toBe(false);
        }
      ),
      { numRuns: 100 }
    );

    // Also test with paywallEnabled=false
    fc.assert(
      fc.property(
        documentArb(frontmatterWithPaywallArb(false)),
        (doc) => {
          const result = getContentAccess(doc, false);
          expect(result.fullAccess).toBe(true);
          expect(result.content).toBe(doc.content);
          expect(result.showPaywallPrompt).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when global paywall is enabled AND document has paywallEnabled=true, getContentAccess returns only a preview', () => {
    /**
     * **Validates: Requirements 20.4**
     *
     * For any document with paywallEnabled=true, when the global paywall is enabled,
     * getContentAccess SHALL return fullAccess=false, showPaywallPrompt=true,
     * and content that is a truncated preview (shorter than or equal to original content).
     */
    fc.assert(
      fc.property(
        documentArb(frontmatterWithPaywallArb(true)),
        (doc) => {
          const result = getContentAccess(doc, true);
          expect(result.fullAccess).toBe(false);
          expect(result.showPaywallPrompt).toBe(true);
          // Preview content should be a substring/prefix of the original or end with '...'
          expect(result.content.length).toBeLessThanOrEqual(doc.content.length);
          if (doc.content.length > 500) {
            // For long content, preview is truncated
            expect(result.content.length).toBeLessThan(doc.content.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when paywallEnabled is absent from frontmatter, it defaults to false (full access granted)', () => {
    /**
     * **Validates: Requirements 20.1**
     *
     * For any document where paywallEnabled is absent from frontmatter,
     * getContentAccess SHALL treat it as paywallEnabled=false, granting full access
     * even when the global paywall is enabled.
     */
    fc.assert(
      fc.property(
        documentArb(frontmatterWithoutPaywallArb),
        (doc) => {
          // Even with global paywall enabled, documents without paywallEnabled flag get full access
          const result = getContentAccess(doc, true);
          expect(result.fullAccess).toBe(true);
          expect(result.content).toBe(doc.content);
          expect(result.showPaywallPrompt).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when global paywall is enabled AND document has paywallEnabled=false, full access is granted', () => {
    /**
     * **Validates: Requirements 20.2, 20.4**
     *
     * For any document with paywallEnabled explicitly set to false,
     * getContentAccess SHALL return full content even when the global paywall is enabled.
     */
    fc.assert(
      fc.property(
        documentArb(frontmatterWithPaywallArb(false)),
        (doc) => {
          const result = getContentAccess(doc, true);
          expect(result.fullAccess).toBe(true);
          expect(result.content).toBe(doc.content);
          expect(result.showPaywallPrompt).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
