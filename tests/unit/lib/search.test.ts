import { describe, it, expect } from 'vitest';
import {
  stripMarkup,
  generateExcerpt,
  buildSearchIndex,
} from '../../../src/lib/search';

describe('Search index builder', () => {
  describe('stripMarkup', () => {
    it('should remove markdown headings', () => {
      const result = stripMarkup('# Title\n## Section\n### Detail');
      expect(result).toBe('Title Section Detail');
    });

    it('should remove code blocks', () => {
      const result = stripMarkup('text\n```js\nconst x = 1;\n```\nmore text');
      expect(result).toBe('text more text');
    });

    it('should remove inline code', () => {
      const result = stripMarkup('use `console.log` to debug');
      expect(result).toBe('use to debug');
    });

    it('should remove images', () => {
      const result = stripMarkup('![alt text](image.png)');
      expect(result).toBe('');
    });

    it('should keep link text but remove link syntax', () => {
      const result = stripMarkup('visit [Google](https://google.com) today');
      expect(result).toBe('visit Google today');
    });

    it('should remove HTML tags', () => {
      const result = stripMarkup('<h1>Title</h1><p>Content</p>');
      expect(result).toBe('TitleContent');
    });

    it('should remove bold/italic markers', () => {
      const result = stripMarkup('**bold** and *italic* and __also__');
      expect(result).toBe('bold and italic and also');
    });

    it('should remove blockquote markers', () => {
      const result = stripMarkup('> quoted text\n> more quote');
      expect(result).toBe('quoted text more quote');
    });

    it('should remove list markers', () => {
      const result = stripMarkup('- item 1\n- item 2\n1. ordered');
      expect(result).toBe('item 1 item 2 ordered');
    });

    it('should remove math blocks', () => {
      const result = stripMarkup('text $$E=mc^2$$ and $x^2$ more');
      expect(result).toBe('text and more');
    });

    it('should collapse whitespace', () => {
      const result = stripMarkup('hello    world\n\n\nnew paragraph');
      expect(result).toBe('hello world new paragraph');
    });

    it('should handle empty content', () => {
      expect(stripMarkup('')).toBe('');
    });

    it('should handle plain text unchanged', () => {
      const result = stripMarkup('Just plain text without any markup');
      expect(result).toBe('Just plain text without any markup');
    });
  });

  describe('generateExcerpt', () => {
    it('should return full text if shorter than max length', () => {
      const text = 'Short text';
      expect(generateExcerpt(text, 200)).toBe('Short text');
    });

    it('should truncate at word boundary', () => {
      const text = 'word '.repeat(100); // 500 chars
      const excerpt = generateExcerpt(text, 50);
      expect(excerpt.length).toBeLessThanOrEqual(54); // 50 + "..."
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('should use default max length of 200', () => {
      const text = 'a '.repeat(200); // 400 chars
      const excerpt = generateExcerpt(text);
      expect(excerpt.length).toBeLessThanOrEqual(204); // 200 + "..."
    });

    it('should handle text with no spaces gracefully', () => {
      const text = 'a'.repeat(300);
      const excerpt = generateExcerpt(text, 100);
      expect(excerpt).toHaveLength(103); // 100 + "..."
      expect(excerpt.endsWith('...')).toBe(true);
    });
  });

  describe('buildSearchIndex', () => {
    it('should build an index for a locale with content', async () => {
      const index = await buildSearchIndex('zh');
      expect(index.locale).toBe('zh');
      expect(index.documents.length).toBeGreaterThanOrEqual(1);
    });

    it('should include correct fields in search documents', async () => {
      const index = await buildSearchIndex('zh');
      const doc = index.documents.find((d) => d.slug === 'intro');
      expect(doc).toBeDefined();
      expect(doc!.id).toBe('programming/intro');
      expect(doc!.title).toBe('编程入门');
      expect(doc!.category).toBe('programming');
      expect(doc!.slug).toBe('intro');
      expect(doc!.content).toBeTruthy();
      expect(doc!.excerpt).toBeTruthy();
    });

    it('should strip markup from content in search documents', async () => {
      const index = await buildSearchIndex('zh');
      const doc = index.documents.find((d) => d.slug === 'intro');
      expect(doc).toBeDefined();
      // Content should not contain markdown syntax
      expect(doc!.content).not.toContain('#');
      expect(doc!.content).not.toContain('**');
    });

    it('should return empty documents array for locale with no content', async () => {
      const index = await buildSearchIndex('fr');
      expect(index.locale).toBe('fr');
      expect(index.documents).toEqual([]);
    });

    it('should build an index for English locale', async () => {
      const index = await buildSearchIndex('en');
      expect(index.locale).toBe('en');
      expect(index.documents.length).toBeGreaterThanOrEqual(1);
      const doc = index.documents.find((d) => d.slug === 'getting-started');
      expect(doc).toBeDefined();
      expect(doc!.title).toBe('Getting Started with Programming');
    });

    it('should generate excerpts for documents', async () => {
      const index = await buildSearchIndex('en');
      const doc = index.documents.find((d) => d.slug === 'getting-started');
      expect(doc).toBeDefined();
      expect(doc!.excerpt.length).toBeGreaterThan(0);
      expect(doc!.excerpt.length).toBeLessThanOrEqual(203); // 200 + "..."
    });
  });
});
