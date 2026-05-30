/**
 * Property 7: Math formula rendering handles valid LaTeX
 * Validates: Requirements 6.1, 6.2
 *
 * "For any valid LaTeX math expression (inline or block), including fractions, summations,
 * integrals, matrices, and Greek letters, the KaTeX renderer SHALL produce HTML output
 * containing KaTeX-specific class names (katex, katex-display) without throwing a parse error."
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderMath } from '@/lib/math';

// --- Arbitraries for valid LaTeX expressions ---

/** Greek letters that KaTeX supports */
const greekLetters = [
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon',
  '\\zeta', '\\eta', '\\theta', '\\iota', '\\kappa',
  '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi',
  '\\rho', '\\sigma', '\\tau', '\\upsilon', '\\phi',
  '\\chi', '\\psi', '\\omega',
  '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Pi',
  '\\Sigma', '\\Phi', '\\Psi', '\\Omega',
];

/** Simple variable names */
const simpleVarArb = fc.constantFrom('a', 'b', 'c', 'x', 'y', 'z', 'n', 'i', 'k', 'm');

/** Greek letter arbitrary */
const greekLetterArb = fc.constantFrom(...greekLetters);

/** A simple atom: variable or Greek letter */
const atomArb = fc.oneof(simpleVarArb, greekLetterArb);

/** Superscript expression: x^2, x^{n} */
const superscriptArb = fc.tuple(simpleVarArb, fc.oneof(simpleVarArb, fc.constantFrom('2', '3', 'n', 'i'))).map(
  ([base, exp]) => `${base}^{${exp}}`
);

/** Subscript expression: x_i, a_n */
const subscriptArb = fc.tuple(simpleVarArb, fc.oneof(simpleVarArb, fc.constantFrom('0', '1', 'i', 'n'))).map(
  ([base, sub]) => `${base}_{${sub}}`
);

/** Fraction expression: \frac{a}{b} */
const fractionArb = fc.tuple(atomArb, atomArb).map(
  ([num, den]) => `\\frac{${num}}{${den}}`
);

/** Summation expression: \sum_{i=1}^{n} */
const summationArb = fc.tuple(simpleVarArb, simpleVarArb).map(
  ([idx, upper]) => `\\sum_{${idx}=1}^{${upper}}`
);

/** Integral expression: \int_{a}^{b} */
const integralArb = fc.tuple(atomArb, atomArb).map(
  ([lower, upper]) => `\\int_{${lower}}^{${upper}}`
);

/** Simple matrix (2x2): \begin{pmatrix} a & b \\ c & d \end{pmatrix} */
const matrixArb = fc.tuple(atomArb, atomArb, atomArb, atomArb).map(
  ([a, b, c, d]) => `\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}`
);

/** Simple addition/subtraction expressions */
const simpleExprArb = fc.tuple(atomArb, fc.constantFrom('+', '-', '\\cdot'), atomArb).map(
  ([left, op, right]) => `${left} ${op} ${right}`
);

/**
 * A valid LaTeX expression combining various constructs.
 * Generates expressions from the supported categories:
 * Greek letters, fractions, superscripts, subscripts, simple expressions,
 * summations, integrals, and matrices.
 */
const validLatexArb = fc.oneof(
  { weight: 2, arbitrary: atomArb },
  { weight: 2, arbitrary: superscriptArb },
  { weight: 2, arbitrary: subscriptArb },
  { weight: 3, arbitrary: fractionArb },
  { weight: 2, arbitrary: summationArb },
  { weight: 2, arbitrary: integralArb },
  { weight: 1, arbitrary: matrixArb },
  { weight: 3, arbitrary: simpleExprArb },
  { weight: 2, arbitrary: greekLetterArb },
);

/** Arbitrary for display mode (true = block, false = inline) */
const displayModeArb = fc.boolean();

/** Arbitrary for any string input (used to test never-throws property) */
const anyStringArb = fc.string({ minLength: 0, maxLength: 200 });

describe('Feature: multilingual-docs-site, Property 7: Math formula rendering handles valid LaTeX', () => {
  it('valid LaTeX expressions produce HTML containing "katex" class', () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * For any valid LaTeX math expression, the KaTeX renderer SHALL produce
     * HTML output containing KaTeX-specific class name "katex" without a parse error.
     */
    fc.assert(
      fc.property(validLatexArb, (latex) => {
        const result = renderMath(latex, false);
        expect(result.error).toBeUndefined();
        expect(result.html).toContain('katex');
      }),
      { numRuns: 150 }
    );
  });

  it('block mode renders with "katex-display" class', () => {
    /**
     * **Validates: Requirements 6.1**
     *
     * For any valid LaTeX expression rendered in block mode (display=true),
     * the output HTML SHALL contain the "katex-display" class.
     */
    fc.assert(
      fc.property(validLatexArb, (latex) => {
        const result = renderMath(latex, true);
        expect(result.error).toBeUndefined();
        expect(result.html).toContain('katex-display');
      }),
      { numRuns: 150 }
    );
  });

  it('invalid LaTeX returns error field and raw LaTeX as html without throwing', () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * For invalid LaTeX expressions, the function SHALL return an object
     * with an error field set (not undefined), the html field SHALL contain
     * the raw LaTeX input, and the function SHALL NOT throw an exception.
     */
    const invalidLatexArb = fc.constantFrom(
      '\\frac{',
      '\\begin{pmatrix}',
      '\\undefinedcommand{x}',
      '\\sqrt{',
      '\\left(',
      '\\end{bmatrix}',
      '\\begin{unknown}',
      '{{{',
    );

    fc.assert(
      fc.property(invalidLatexArb, displayModeArb, (latex, displayMode) => {
        let result: { html: string; error?: string };
        expect(() => {
          result = renderMath(latex, displayMode);
        }).not.toThrow();
        expect(result!.error).toBeDefined();
        expect(result!.html).toBe(latex);
      }),
      { numRuns: 100 }
    );
  });

  it('renderMath never throws for any arbitrary string input', () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * For any string input (valid, invalid, empty, or garbage),
     * the renderMath function SHALL never throw an exception.
     */
    fc.assert(
      fc.property(anyStringArb, displayModeArb, (latex, displayMode) => {
        expect(() => renderMath(latex, displayMode)).not.toThrow();
      }),
      { numRuns: 150 }
    );
  });
});
