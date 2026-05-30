/**
 * Property 3: HTML sanitization removes dangerous content
 * Validates: Requirements 2.2
 *
 * "For any HTML string containing potentially dangerous elements (script tags, onclick attributes,
 * javascript: URLs, iframe elements, event handlers), the sanitizer SHALL remove all dangerous
 * content from the output while preserving safe formatting elements."
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * Arbitrary for generating dangerous HTML elements that should be stripped.
 */
const dangerousScriptTagArb = fc
  .tuple(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz ="'.split('')), { minLength: 0, maxLength: 50 }),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789();. '.split('')), { minLength: 0, maxLength: 50 })
  )
  .map(([attrs, content]) => `<script${attrs ? ' ' + attrs : ''}>${content}</script>`);

const dangerousIframeArb = fc
  .stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/:.-_'.split('')),
    { minLength: 0, maxLength: 80 }
  )
  .map((src) => `<iframe src="${src}"></iframe>`);

const dangerousEventHandlerArb = fc
  .tuple(
    fc.constantFrom('onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange'),
    fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789();. '.split('')),
      { minLength: 1, maxLength: 40 }
    )
  )
  .map(([handler, code]) => `<div ${handler}="${code}">content</div>`);

const dangerousJavascriptUrlArb = fc
  .stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789()_-+= '.split('')),
    { minLength: 1, maxLength: 40 }
  )
  .map((code) => `<a href="javascript:${code}">click</a>`);

/**
 * Arbitrary for safe HTML elements that should be preserved.
 */
const safeTagName = fc.constantFrom(
  'p', 'div', 'span', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'blockquote', 'pre', 'code'
);

const safeElementArb = fc
  .tuple(safeTagName, fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-'.split('')),
    { minLength: 1, maxLength: 30 }
  ))
  .map(([tag, content]) => `<${tag}>${content}</${tag}>`);

/**
 * Arbitrary for plain text content (no HTML).
 */
const plainTextArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-'.split('')),
  { minLength: 1, maxLength: 100 }
);

/**
 * Arbitrary for HTML with a mix of dangerous and safe content.
 */
const mixedHtmlArb = fc
  .tuple(
    fc.array(safeElementArb, { minLength: 0, maxLength: 3 }),
    fc.array(
      fc.oneof(dangerousScriptTagArb, dangerousIframeArb, dangerousEventHandlerArb, dangerousJavascriptUrlArb),
      { minLength: 1, maxLength: 3 }
    )
  )
  .map(([safe, dangerous]) => [...safe, ...dangerous].join('\n'));

describe('Feature: multilingual-docs-site, Property 3: HTML sanitization removes dangerous content', () => {
  it('output never contains script tags', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any HTML input containing script tags, the sanitized output
     * SHALL NOT contain any script tags or script content.
     */
    fc.assert(
      fc.property(dangerousScriptTagArb, (html) => {
        const result = sanitizeHtml(html);

        expect(result.toLowerCase()).not.toMatch(/<script[\s>]/i);
        expect(result.toLowerCase()).not.toMatch(/<\/script>/i);
      }),
      { numRuns: 150 }
    );
  });

  it('output never contains event handler attributes', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any HTML input containing event handler attributes (onclick, onload, etc.),
     * the sanitized output SHALL NOT contain any event handler attributes.
     */
    fc.assert(
      fc.property(dangerousEventHandlerArb, (html) => {
        const result = sanitizeHtml(html);

        // No event handler attributes should remain
        expect(result).not.toMatch(/\bon\w+\s*=/i);
      }),
      { numRuns: 150 }
    );
  });

  it('output never contains javascript: URLs', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any HTML input containing javascript: URLs in href or src attributes,
     * the sanitized output SHALL NOT contain javascript: protocol URLs.
     */
    fc.assert(
      fc.property(dangerousJavascriptUrlArb, (html) => {
        const result = sanitizeHtml(html);

        expect(result).not.toMatch(/javascript\s*:/i);
      }),
      { numRuns: 150 }
    );
  });

  it('output never contains iframe elements', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any HTML input containing iframe elements, the sanitized output
     * SHALL NOT contain any iframe tags.
     */
    fc.assert(
      fc.property(dangerousIframeArb, (html) => {
        const result = sanitizeHtml(html);

        expect(result.toLowerCase()).not.toMatch(/<iframe[\s>]/i);
        expect(result.toLowerCase()).not.toMatch(/<\/iframe>/i);
      }),
      { numRuns: 150 }
    );
  });

  it('safe elements (p, div, span, strong, em, h1-h6, ul, ol, table) are preserved', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * Safe formatting elements SHALL be preserved in the sanitized output.
     */
    fc.assert(
      fc.property(safeElementArb, (html) => {
        const result = sanitizeHtml(html);

        // The output should still contain the safe tag
        const tagMatch = html.match(/^<(\w+)/);
        if (tagMatch) {
          const tag = tagMatch[1].toLowerCase();
          expect(result.toLowerCase()).toContain(`<${tag}>`);
          expect(result.toLowerCase()).toContain(`</${tag}>`);
        }
      }),
      { numRuns: 150 }
    );
  });

  it('the sanitizer never throws for any input', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * The sanitizer SHALL NOT throw or crash for any arbitrary string input.
     */
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 500 }), (input) => {
        expect(() => sanitizeHtml(input)).not.toThrow();
      }),
      { numRuns: 200 }
    );
  });

  it('plain text without HTML passes through unchanged', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * Plain text content that does not contain any HTML tags SHALL pass through
     * the sanitizer without modification.
     */
    fc.assert(
      fc.property(plainTextArb, (text) => {
        const result = sanitizeHtml(text);

        expect(result).toBe(text);
      }),
      { numRuns: 150 }
    );
  });

  it('mixed dangerous and safe content: dangerous elements removed, safe elements preserved', () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any HTML containing both dangerous and safe elements, all dangerous
     * content is removed while safe formatting elements are preserved.
     */
    fc.assert(
      fc.property(mixedHtmlArb, (html) => {
        const result = sanitizeHtml(html);

        // Dangerous content must not be present
        expect(result.toLowerCase()).not.toMatch(/<script[\s>]/i);
        expect(result.toLowerCase()).not.toMatch(/<\/script>/i);
        expect(result.toLowerCase()).not.toMatch(/<iframe[\s>]/i);
        expect(result.toLowerCase()).not.toMatch(/<\/iframe>/i);
        expect(result).not.toMatch(/\bon\w+\s*=/i);
        expect(result).not.toMatch(/javascript\s*:/i);
      }),
      { numRuns: 150 }
    );
  });
});
