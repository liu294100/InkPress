import { describe, it, expect } from 'vitest';
import {
  highlightSearchTerms,
  countHighlights,
  countTermOccurrences,
} from '../../src/lib/search-highlight';

describe('highlightSearchTerms', () => {
  it('should wrap a single occurrence of a term with <mark> tags', () => {
    const result = highlightSearchTerms('Hello world', ['world']);
    expect(result).toBe('Hello <mark>world</mark>');
  });

  it('should handle case-insensitive matching', () => {
    const result = highlightSearchTerms('Hello World', ['world']);
    expect(result).toBe('Hello <mark>World</mark>');
  });

  it('should highlight multiple occurrences of the same term', () => {
    const result = highlightSearchTerms('foo bar foo baz foo', ['foo']);
    expect(result).toBe('<mark>foo</mark> bar <mark>foo</mark> baz <mark>foo</mark>');
    expect(countHighlights(result)).toBe(3);
  });

  it('should highlight multiple different terms', () => {
    const result = highlightSearchTerms('The quick brown fox', ['quick', 'fox']);
    expect(result).toBe('The <mark>quick</mark> brown <mark>fox</mark>');
    expect(countHighlights(result)).toBe(2);
  });

  it('should return original text when terms array is empty', () => {
    const result = highlightSearchTerms('Hello world', []);
    expect(result).toBe('Hello world');
  });

  it('should return original text when text is empty', () => {
    const result = highlightSearchTerms('', ['test']);
    expect(result).toBe('');
  });

  it('should ignore empty/whitespace-only terms', () => {
    const result = highlightSearchTerms('Hello world', ['', '  ', 'world']);
    expect(result).toBe('Hello <mark>world</mark>');
  });

  it('should handle special regex characters in terms', () => {
    const result = highlightSearchTerms('Price is $100.00 (USD)', ['$100.00']);
    expect(result).toBe('Price is <mark>$100.00</mark> (USD)');
  });

  it('should prioritize longer terms over shorter overlapping ones', () => {
    const result = highlightSearchTerms('JavaScript is great', ['Java', 'JavaScript']);
    expect(result).toBe('<mark>JavaScript</mark> is great');
    expect(countHighlights(result)).toBe(1);
  });

  it('should highlight terms that appear in different cases', () => {
    const result = highlightSearchTerms('Test TEST test TeSt', ['test']);
    expect(result).toBe('<mark>Test</mark> <mark>TEST</mark> <mark>test</mark> <mark>TeSt</mark>');
    expect(countHighlights(result)).toBe(4);
  });

  it('should handle terms at the beginning and end of text', () => {
    const result = highlightSearchTerms('start middle end', ['start', 'end']);
    expect(result).toBe('<mark>start</mark> middle <mark>end</mark>');
  });
});

describe('countTermOccurrences', () => {
  it('should count single term occurrences', () => {
    expect(countTermOccurrences('foo bar foo baz foo', ['foo'])).toBe(3);
  });

  it('should count multiple terms', () => {
    expect(countTermOccurrences('The quick brown fox', ['quick', 'fox'])).toBe(2);
  });

  it('should return 0 for empty text', () => {
    expect(countTermOccurrences('', ['test'])).toBe(0);
  });

  it('should return 0 for empty terms', () => {
    expect(countTermOccurrences('Hello world', [])).toBe(0);
  });

  it('should be case-insensitive', () => {
    expect(countTermOccurrences('Test TEST test', ['test'])).toBe(3);
  });
});

describe('countHighlights', () => {
  it('should count mark tags in highlighted text', () => {
    expect(countHighlights('<mark>a</mark> b <mark>c</mark>')).toBe(2);
  });

  it('should return 0 when no marks present', () => {
    expect(countHighlights('no marks here')).toBe(0);
  });
});
