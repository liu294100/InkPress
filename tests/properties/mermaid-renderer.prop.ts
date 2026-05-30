/**
 * Property 8: Invalid Mermaid syntax produces error message
 * Validates: Requirements 7.3
 *
 * "For any string that is not valid Mermaid syntax, the Mermaid renderer component SHALL
 * display an error message element rather than crashing or producing an empty output."
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateMermaidSyntax } from '@/lib/mermaid';

/**
 * Valid Mermaid diagram type keywords that the validator recognizes.
 */
const VALID_DIAGRAM_KEYWORDS = [
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'journey',
  'gantt',
  'pie',
  'quadrantChart',
  'requirementDiagram',
  'gitGraph',
  'mindmap',
  'timeline',
  'zenuml',
  'sankey-beta',
  'xychart-beta',
  'block-beta',
];

/**
 * Generator for strings that do NOT start with a valid Mermaid diagram type keyword.
 * Produces arbitrary strings that are guaranteed to be invalid Mermaid syntax.
 */
const invalidMermaidStringArb = fc
  .stringOf(
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~ \n\t'.split(
        ''
      )
    ),
    { minLength: 1, maxLength: 100 }
  )
  .filter((s) => {
    const trimmed = s.trim();
    if (trimmed.length === 0) return false; // exclude empty/whitespace-only (tested separately)
    const firstLine = trimmed.split('\n')[0].trim();
    const firstToken = firstLine.split(/[\s{(\[;]/)[0].toLowerCase();
    return !VALID_DIAGRAM_KEYWORDS.some(
      (type) => type.toLowerCase() === firstToken
    );
  });

/**
 * Generator for valid Mermaid diagram opening lines.
 * Produces strings that start with a recognized diagram type keyword.
 */
const validMermaidStringArb = fc
  .tuple(
    fc.constantFrom(...VALID_DIAGRAM_KEYWORDS),
    fc.stringOf(
      fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-->|:;\n'.split(
          ''
        )
      ),
      { minLength: 0, maxLength: 50 }
    )
  )
  .map(([keyword, body]) => `${keyword}\n  ${body}`);

describe('Feature: multilingual-docs-site, Property 8: Invalid Mermaid syntax produces error message', () => {
  it('strings not starting with a valid diagram type keyword return valid=false with an error message', () => {
    /**
     * **Validates: Requirements 7.3**
     *
     * For any string that does not begin with a recognized Mermaid diagram type keyword,
     * validateMermaidSyntax SHALL return valid=false with a non-empty error message.
     */
    fc.assert(
      fc.property(invalidMermaidStringArb, (input) => {
        const result = validateMermaidSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
        expect(result.error!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('validateMermaidSyntax never throws for any input', () => {
    /**
     * **Validates: Requirements 7.3**
     *
     * For any arbitrary string input (including empty, garbage, or malformed content),
     * validateMermaidSyntax SHALL never throw an exception.
     */
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.constantFrom('', ' ', '\n', '\t', null, undefined, 123, {}, [])
        ),
        (input) => {
          expect(() =>
            validateMermaidSyntax(input as unknown as string)
          ).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty strings return valid=false', () => {
    /**
     * **Validates: Requirements 7.3**
     *
     * For any empty or whitespace-only string, validateMermaidSyntax SHALL return
     * valid=false with a non-empty error message.
     */
    const emptyLikeStringsArb = fc.constantFrom(
      '',
      ' ',
      '  ',
      '\t',
      '\n',
      '  \n  ',
      '\t\n\t',
      '    \n    \n    '
    );

    fc.assert(
      fc.property(emptyLikeStringsArb, (input) => {
        const result = validateMermaidSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('valid diagram type keywords return valid=true', () => {
    /**
     * **Validates: Requirements 7.3**
     *
     * For any string starting with a recognized Mermaid diagram type keyword
     * (flowchart, graph, sequenceDiagram, etc.), validateMermaidSyntax SHALL return valid=true.
     */
    fc.assert(
      fc.property(validMermaidStringArb, (input) => {
        const result = validateMermaidSyntax(input);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
