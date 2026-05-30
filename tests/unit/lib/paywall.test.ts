import { describe, it, expect } from 'vitest';
import {
  getContentAccess,
  isDocumentPaywalled,
  generatePreview,
} from '@/lib/paywall';
import type { Document, DocumentFrontmatter } from '@/lib/types';

function createDocument(overrides: Partial<Document> = {}): Document {
  return {
    slug: 'test-doc',
    locale: 'en',
    category: 'programming',
    title: 'Test Document',
    content: 'This is the full content of the document that should be displayed to the user.',
    contentType: 'markdown',
    frontmatter: {
      title: 'Test Document',
      paywallEnabled: false,
    },
    headings: [],
    readingTime: 3,
    lastModified: '2024-01-15',
    ...overrides,
  };
}

describe('isDocumentPaywalled', () => {
  it('returns false when paywallEnabled is not set in frontmatter', () => {
    const frontmatter: DocumentFrontmatter = { title: 'Test' };
    expect(isDocumentPaywalled(frontmatter)).toBe(false);
  });

  it('returns false when paywallEnabled is explicitly false', () => {
    const frontmatter: DocumentFrontmatter = { title: 'Test', paywallEnabled: false };
    expect(isDocumentPaywalled(frontmatter)).toBe(false);
  });

  it('returns true when paywallEnabled is true', () => {
    const frontmatter: DocumentFrontmatter = { title: 'Test', paywallEnabled: true };
    expect(isDocumentPaywalled(frontmatter)).toBe(true);
  });
});

describe('generatePreview', () => {
  it('returns full content if shorter than max length', () => {
    const content = 'Short content';
    expect(generatePreview(content, 500)).toBe('Short content');
  });

  it('truncates content at word boundary when longer than max length', () => {
    const content = 'Hello world this is a longer content string that exceeds the limit';
    const preview = generatePreview(content, 30);
    expect(preview.length).toBeLessThanOrEqual(34); // 30 + '...'
    expect(preview).toContain('...');
  });

  it('appends ellipsis when truncating', () => {
    const content = 'a '.repeat(300);
    const preview = generatePreview(content, 50);
    expect(preview.endsWith('...')).toBe(true);
  });
});

describe('getContentAccess', () => {
  describe('when global paywall is disabled', () => {
    it('returns full content regardless of document paywall flag', () => {
      const doc = createDocument({
        frontmatter: { title: 'Test', paywallEnabled: true },
      });

      const result = getContentAccess(doc, false);

      expect(result.fullAccess).toBe(true);
      expect(result.content).toBe(doc.content);
      expect(result.showPaywallPrompt).toBe(false);
    });

    it('returns full content when paywallEnabled is absent', () => {
      const doc = createDocument({
        frontmatter: { title: 'Test' },
      });

      const result = getContentAccess(doc, false);

      expect(result.fullAccess).toBe(true);
      expect(result.content).toBe(doc.content);
      expect(result.showPaywallPrompt).toBe(false);
    });

    it('returns full content when paywallEnabled is false', () => {
      const doc = createDocument({
        frontmatter: { title: 'Test', paywallEnabled: false },
      });

      const result = getContentAccess(doc, false);

      expect(result.fullAccess).toBe(true);
      expect(result.content).toBe(doc.content);
      expect(result.showPaywallPrompt).toBe(false);
    });
  });

  describe('when global paywall is enabled', () => {
    it('returns preview with paywall prompt when document has paywallEnabled: true', () => {
      const longContent = 'This is premium content. '.repeat(50);
      const doc = createDocument({
        content: longContent,
        frontmatter: { title: 'Test', paywallEnabled: true },
      });

      const result = getContentAccess(doc, true);

      expect(result.fullAccess).toBe(false);
      expect(result.content.length).toBeLessThan(longContent.length);
      expect(result.showPaywallPrompt).toBe(true);
    });

    it('returns full content when document has paywallEnabled: false', () => {
      const doc = createDocument({
        frontmatter: { title: 'Test', paywallEnabled: false },
      });

      const result = getContentAccess(doc, true);

      expect(result.fullAccess).toBe(true);
      expect(result.content).toBe(doc.content);
      expect(result.showPaywallPrompt).toBe(false);
    });

    it('returns full content when paywallEnabled is absent (defaults to false)', () => {
      const doc = createDocument({
        frontmatter: { title: 'Test' },
      });

      const result = getContentAccess(doc, true);

      expect(result.fullAccess).toBe(true);
      expect(result.content).toBe(doc.content);
      expect(result.showPaywallPrompt).toBe(false);
    });

    it('respects custom preview length', () => {
      const longContent = 'Word '.repeat(200);
      const doc = createDocument({
        content: longContent,
        frontmatter: { title: 'Test', paywallEnabled: true },
      });

      const result = getContentAccess(doc, true, 100);

      expect(result.fullAccess).toBe(false);
      expect(result.content.length).toBeLessThanOrEqual(104); // 100 + '...'
      expect(result.showPaywallPrompt).toBe(true);
    });
  });
});
