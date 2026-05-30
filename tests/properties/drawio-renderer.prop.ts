/**
 * Property 9: Invalid DrawIO XML produces fallback message
 * Validates: Requirements 8.3
 *
 * "For any string that is not valid XML or not valid DrawIO XML, the DrawIO renderer component
 * SHALL display a fallback error message rather than crashing or producing an empty output."
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateDrawIOXml } from '@/lib/drawio';

/**
 * Arbitrary generator for strings that are NOT valid DrawIO XML.
 * Generates random strings, numbers, special chars, etc.
 */
const invalidDrawIOStringArb = fc.oneof(
  // Random strings
  fc.string({ minLength: 1, maxLength: 200 }),
  // Strings that look like XML but have wrong root elements
  fc.constantFrom(
    '<div>hello</div>',
    '<html><body></body></html>',
    '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    '<root><child/></root>',
    '<data><item>test</item></data>',
    '<document type="text"></document>'
  ),
  // Strings with special characters
  fc.stringOf(fc.constantFrom(...'<>&"\'[]{}()!@#$%^*+=|\\/:;,.?~`'.split('')), {
    minLength: 1,
    maxLength: 50,
  }),
  // Plain text without any XML structure
  fc.lorem({ maxCount: 10 })
);

/**
 * Arbitrary generator for valid XML with non-DrawIO root elements.
 */
const validXmlWrongRootArb = fc
  .stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
    { minLength: 1, maxLength: 15 }
  )
  .filter((name) => name !== 'mxGraphModel' && name !== 'mxfile')
  .map((name) => `<${name}></${name}>`);

/**
 * Arbitrary generator for valid DrawIO XML with mxGraphModel or mxfile root.
 */
const validDrawIOXmlArb = fc.oneof(
  fc.constant('<mxGraphModel><root></root></mxGraphModel>'),
  fc.constant('<mxfile><diagram></diagram></mxfile>'),
  fc.constant('<mxGraphModel/>'),
  fc.constant('<mxfile/>'),
  fc.constant('<?xml version="1.0" encoding="UTF-8"?>\n<mxGraphModel><root></root></mxGraphModel>'),
  fc.constant('<?xml version="1.0"?>\n<mxfile><diagram name="Page-1"></diagram></mxfile>')
);

describe('Feature: multilingual-docs-site, Property 9: Invalid DrawIO XML produces fallback message', () => {
  it('arbitrary non-DrawIO strings return valid=false with an error message', () => {
    /**
     * **Validates: Requirements 8.3**
     *
     * For any arbitrary string that is not valid DrawIO XML, validateDrawIOXml
     * SHALL return valid=false with a non-empty error message.
     */
    fc.assert(
      fc.property(invalidDrawIOStringArb, (input) => {
        const result = validateDrawIOXml(input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
        expect(result.error!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('the function never throws for any input', () => {
    /**
     * **Validates: Requirements 8.3**
     *
     * For any arbitrary string input (including empty, garbage, or malformed content),
     * validateDrawIOXml SHALL never throw an exception.
     */
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 500 }), (input) => {
        expect(() => validateDrawIOXml(input)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('empty strings return valid=false', () => {
    /**
     * **Validates: Requirements 8.3**
     *
     * For any empty or whitespace-only string, validateDrawIOXml SHALL return
     * valid=false with an error message.
     */
    const emptyLikeStringArb = fc.oneof(
      fc.constant(''),
      fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
    );

    fc.assert(
      fc.property(emptyLikeStringArb, (input) => {
        const result = validateDrawIOXml(input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('valid XML with wrong root element (not mxGraphModel/mxfile) returns valid=false', () => {
    /**
     * **Validates: Requirements 8.3**
     *
     * For any valid XML with a root element that is NOT mxGraphModel or mxfile,
     * validateDrawIOXml SHALL return valid=false.
     */
    fc.assert(
      fc.property(validXmlWrongRootArb, (xml) => {
        const result = validateDrawIOXml(xml);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!).toContain('root element');
      }),
      { numRuns: 100 }
    );
  });

  it('valid DrawIO XML (mxGraphModel/mxfile root) returns valid=true', () => {
    /**
     * **Validates: Requirements 8.3**
     *
     * For any valid DrawIO XML with mxGraphModel or mxfile as the root element,
     * validateDrawIOXml SHALL return valid=true.
     */
    fc.assert(
      fc.property(validDrawIOXmlArb, (xml) => {
        const result = validateDrawIOXml(xml);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
