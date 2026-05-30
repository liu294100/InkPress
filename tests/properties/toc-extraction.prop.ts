/**
 * Property 6: TOC extraction produces correct heading hierarchy
 * Validates: Requirements 5.1
 *
 * "For any Markdown document with headings at various levels (h1-h6), the heading extraction
 * function SHALL produce a tree structure where each heading's children are headings of a
 * strictly deeper level, and the resulting tree preserves the document order of headings."
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildHeadingTree } from '@/lib/content';
import { Heading } from '@/lib/types';

/**
 * Arbitrary generator for a single markdown heading line.
 * Generates headings at levels 1-6 with non-empty text.
 */
const headingTextArb = fc.stringOf(
  fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')
  ),
  { minLength: 1, maxLength: 30 }
).filter((s) => s.trim().length > 0);

const headingLevelArb = fc.integer({ min: 1, max: 6 });

/**
 * Generates a single markdown heading line (e.g., "## Some Title").
 */
const markdownHeadingArb = fc.tuple(headingLevelArb, headingTextArb).map(
  ([level, text]) => `${'#'.repeat(level)} ${text.trim()}`
);

/**
 * Generates a markdown document consisting of multiple headings
 * optionally interspersed with body text.
 */
const markdownDocumentArb = fc
  .array(
    fc.oneof(
      { weight: 3, arbitrary: markdownHeadingArb },
      { weight: 1, arbitrary: fc.lorem({ maxCount: 5 }).map((s) => s) }
    ),
    { minLength: 1, maxLength: 20 }
  )
  .filter((lines) => lines.some((l) => /^#{1,6}\s+/.test(l)))
  .map((lines) => lines.join('\n'));

/**
 * Flattens a heading tree into a list in document order (pre-order traversal).
 */
function flattenTree(headings: Heading[]): Heading[] {
  const result: Heading[] = [];
  for (const h of headings) {
    result.push(h);
    result.push(...flattenTree(h.children));
  }
  return result;
}

/**
 * Verifies that all children of a heading have a strictly deeper level than the parent.
 */
function verifyChildrenDeeperThanParent(headings: Heading[]): boolean {
  for (const heading of headings) {
    for (const child of heading.children) {
      if (child.level <= heading.level) {
        return false;
      }
    }
    if (!verifyChildrenDeeperThanParent(heading.children)) {
      return false;
    }
  }
  return true;
}

/**
 * Extracts raw heading texts from a markdown string in document order.
 * This mirrors the extraction logic to get expected order.
 */
function extractExpectedHeadingTexts(content: string): string[] {
  const texts: string[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const mdMatch = trimmed.match(/^(#{1,6})\s+(.+?)(?:\s*#*\s*)?$/);
    if (mdMatch) {
      const text = mdMatch[2].trim();
      if (text) {
        texts.push(text);
      }
    }
  }
  return texts;
}

describe('Feature: multilingual-docs-site, Property 6: TOC extraction produces correct heading hierarchy', () => {
  it('children always have strictly deeper level than their parent', () => {
    /**
     * **Validates: Requirements 5.1**
     *
     * For any markdown document with headings, each heading's children
     * SHALL have a strictly deeper level than the parent heading.
     */
    fc.assert(
      fc.property(markdownDocumentArb, (markdown) => {
        const tree = buildHeadingTree(markdown);
        expect(verifyChildrenDeeperThanParent(tree)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('document order is preserved (flattened tree matches original heading order)', () => {
    /**
     * **Validates: Requirements 5.1**
     *
     * For any markdown document, when the heading tree is flattened via
     * pre-order traversal, the heading texts SHALL appear in the same
     * order as they appear in the original document.
     */
    fc.assert(
      fc.property(markdownDocumentArb, (markdown) => {
        const tree = buildHeadingTree(markdown);
        const flattened = flattenTree(tree);
        const flattenedTexts = flattened.map((h) => h.text);
        const expectedTexts = extractExpectedHeadingTexts(markdown);

        expect(flattenedTexts).toEqual(expectedTexts);
      }),
      { numRuns: 100 }
    );
  });

  it('every heading gets a unique ID', () => {
    /**
     * **Validates: Requirements 5.1**
     *
     * For any markdown document with headings, the buildHeadingTree function
     * SHALL assign a unique, non-empty ID to every heading in the tree.
     */
    fc.assert(
      fc.property(markdownDocumentArb, (markdown) => {
        const tree = buildHeadingTree(markdown);
        const flattened = flattenTree(tree);

        // All IDs should be non-empty strings
        for (const heading of flattened) {
          expect(heading.id).toBeTruthy();
          expect(typeof heading.id).toBe('string');
          expect(heading.id.length).toBeGreaterThan(0);
        }

        // All IDs should be unique
        const ids = flattened.map((h) => h.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }),
      { numRuns: 100 }
    );
  });

  it('the function never throws for any input', () => {
    /**
     * **Validates: Requirements 5.1**
     *
     * For any arbitrary string input (including empty, garbage, or malformed content),
     * buildHeadingTree SHALL never throw an exception.
     */
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 500 }), (content) => {
        expect(() => buildHeadingTree(content)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });
});
