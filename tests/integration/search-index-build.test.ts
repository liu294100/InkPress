/**
 * Integration test: Search index build pipeline end-to-end.
 * Tests that buildSearchIndex generates valid indices for locales with content (zh, en).
 * Verifies the output structure matches SearchIndex interface.
 *
 * Validates: Requirements 9.2
 */

import { describe, it, expect } from 'vitest';
import { buildSearchIndex } from '../../src/lib/search';
import { SearchIndex, SearchDocument } from '../../src/lib/types';

describe('Integration: Search Index Build Pipeline', () => {
  it('should generate a valid SearchIndex for the "zh" locale', async () => {
    const index: SearchIndex = await buildSearchIndex('zh');

    // Verify top-level structure
    expect(index).toBeDefined();
    expect(index.locale).toBe('zh');
    expect(Array.isArray(index.documents)).toBe(true);
    expect(index.documents.length).toBeGreaterThan(0);

    // Verify each document conforms to SearchDocument interface
    for (const doc of index.documents) {
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('title');
      expect(doc).toHaveProperty('content');
      expect(doc).toHaveProperty('category');
      expect(doc).toHaveProperty('slug');
      expect(doc).toHaveProperty('excerpt');

      expect(typeof doc.id).toBe('string');
      expect(typeof doc.title).toBe('string');
      expect(typeof doc.content).toBe('string');
      expect(typeof doc.category).toBe('string');
      expect(typeof doc.slug).toBe('string');
      expect(typeof doc.excerpt).toBe('string');

      // id should be in format "category/slug"
      expect(doc.id).toContain('/');

      // title should not be empty
      expect(doc.title.length).toBeGreaterThan(0);

      // content should be plain text (no markdown/html markup)
      expect(doc.content).not.toMatch(/^#{1,6}\s/m);
      expect(doc.content).not.toMatch(/<[a-z][^>]*>/i);
    }
  });

  it('should generate a valid SearchIndex for the "en" locale', async () => {
    const index: SearchIndex = await buildSearchIndex('en');

    expect(index).toBeDefined();
    expect(index.locale).toBe('en');
    expect(Array.isArray(index.documents)).toBe(true);
    expect(index.documents.length).toBeGreaterThan(0);

    for (const doc of index.documents) {
      expect(doc.id).toBeTruthy();
      expect(doc.title).toBeTruthy();
      expect(doc.category).toBeTruthy();
      expect(doc.slug).toBeTruthy();
      expect(typeof doc.excerpt).toBe('string');
    }
  });

  it('should return an empty documents array for a locale with no content', async () => {
    // fr locale has no content directory with documents
    const index: SearchIndex = await buildSearchIndex('fr');

    expect(index).toBeDefined();
    expect(index.locale).toBe('fr');
    expect(Array.isArray(index.documents)).toBe(true);
    expect(index.documents.length).toBe(0);
  });

  it('should strip markup from document content', async () => {
    const index = await buildSearchIndex('zh');
    const introDoc = index.documents.find((d) => d.slug === 'intro');

    if (introDoc) {
      // Content should not contain raw markdown syntax
      expect(introDoc.content).not.toContain('# ');
      expect(introDoc.content).not.toContain('## ');
      expect(introDoc.content).not.toContain('### ');
      expect(introDoc.content).not.toContain('```');

      // But should contain the actual text
      expect(introDoc.content).toContain('编程');
    }
  });

  it('should generate excerpts within expected length', async () => {
    const index = await buildSearchIndex('zh');

    for (const doc of index.documents) {
      // Excerpts should be a reasonable length (max ~200 chars + "...")
      expect(doc.excerpt.length).toBeLessThanOrEqual(210);
    }
  });

  it('should assign correct category to documents', async () => {
    const index = await buildSearchIndex('zh');

    const programmingDocs = index.documents.filter(
      (d) => d.category === 'programming'
    );

    // We know there is at least one programming doc in zh (intro.md)
    expect(programmingDocs.length).toBeGreaterThan(0);

    // All programming docs should have their id start with "programming/"
    for (const doc of programmingDocs) {
      expect(doc.id).toMatch(/^programming\//);
    }
  });
});
