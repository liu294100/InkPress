import { describe, it, expect } from 'vitest';
import { renderMath } from '@/lib/math';

describe('renderMath', () => {
  describe('inline math (display=false)', () => {
    it('renders simple inline expressions', () => {
      const result = renderMath('x^2', false);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex');
      expect(result.html).not.toContain('katex-display');
    });

    it('renders Greek letters', () => {
      const result = renderMath('\\alpha + \\beta = \\gamma', false);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex');
    });

    it('renders fractions', () => {
      const result = renderMath('\\frac{a}{b}', false);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex');
    });
  });

  describe('block math (display=true)', () => {
    it('renders block-level expressions with display class', () => {
      const result = renderMath('E = mc^2', true);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex-display');
    });

    it('renders summations', () => {
      const result = renderMath('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', true);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex-display');
    });

    it('renders integrals', () => {
      const result = renderMath('\\int_0^\\infty e^{-x} dx = 1', true);
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex-display');
    });

    it('renders matrices', () => {
      const result = renderMath(
        '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        true
      );
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('katex-display');
    });
  });

  describe('error handling', () => {
    it('returns raw LaTeX and error message for invalid expressions', () => {
      const result = renderMath('\\invalidcommand{', false);
      expect(result.error).toBeDefined();
      expect(result.html).toBe('\\invalidcommand{');
    });

    it('returns raw LaTeX for unbalanced braces', () => {
      const result = renderMath('\\frac{a}{', false);
      expect(result.error).toBeDefined();
      expect(result.html).toBe('\\frac{a}{');
    });

    it('does not throw on invalid input', () => {
      expect(() => renderMath('\\bad{{{', false)).not.toThrow();
      expect(() => renderMath('', false)).not.toThrow();
    });
  });

  describe('empty and edge cases', () => {
    it('renders empty string without error', () => {
      const result = renderMath('', false);
      // KaTeX handles empty string without error
      expect(result.html).toContain('katex');
      expect(result.error).toBeUndefined();
    });

    it('renders whitespace-only input', () => {
      const result = renderMath('   ', false);
      expect(result.error).toBeUndefined();
    });
  });
});
