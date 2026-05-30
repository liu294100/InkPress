import { describe, it, expect } from 'vitest';
import { generateMetadata } from '../../../src/lib/seo';
import type { Document } from '../../../src/lib/types';

function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    slug: 'getting-started',
    locale: 'en',
    category: 'programming',
    title: 'Getting Started',
    content: 'This is a guide to getting started with programming concepts and techniques.',
    contentType: 'markdown',
    frontmatter: {
      title: 'Getting Started',
      description: 'A beginner guide to programming',
      keywords: ['programming', 'beginner', 'tutorial'],
    },
    headings: [],
    readingTime: 5,
    lastModified: '2024-01-15',
    ...overrides,
  };
}

describe('generateMetadata', () => {
  it('should generate title with site name appended', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.title).toBe('Getting Started | WebDoc');
  });

  it('should use frontmatter description when available', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.description).toBe('A beginner guide to programming');
  });

  it('should generate description from content when frontmatter description is missing', () => {
    const doc = createMockDocument({
      frontmatter: { title: 'Test' },
      content: 'This is the document content that will be used as description.',
    });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.description).toBe('This is the document content that will be used as description.');
  });

  it('should truncate long generated descriptions to around 160 characters', () => {
    const longContent = 'This is a very long paragraph that goes on and on about many different topics to exceed the 160 character limit that we set for meta descriptions in SEO best practices for search engine optimization purposes.';
    const doc = createMockDocument({
      frontmatter: { title: 'Test' },
      content: longContent,
    });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.description.length).toBeLessThanOrEqual(164); // 160 + "..."
    expect(metadata.description).toContain('...');
  });

  it('should use frontmatter keywords', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.keywords).toEqual(['programming', 'beginner', 'tutorial']);
  });

  it('should return empty keywords array when none in frontmatter', () => {
    const doc = createMockDocument({
      frontmatter: { title: 'Test' },
    });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.keywords).toEqual([]);
  });

  it('should generate canonical URL with locale and document path', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.canonicalUrl).toBe('https://webdoc.example.com/en/programming/getting-started');
  });

  it('should include subcategory in canonical URL when present', () => {
    const doc = createMockDocument({ subcategory: 'basics' });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.canonicalUrl).toBe('https://webdoc.example.com/en/programming/basics/getting-started');
  });

  it('should set ogType to article', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.ogType).toBe('article');
  });

  it('should generate hreflang alternates for all 9 supported locales', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.hreflangAlternates).toHaveLength(9);

    const locales = metadata.hreflangAlternates.map((alt) => alt.locale);
    expect(locales).toEqual(['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th']);
  });

  it('should generate correct hreflang URLs for each locale', () => {
    const doc = createMockDocument();
    const metadata = generateMetadata(doc, 'en');

    for (const alt of metadata.hreflangAlternates) {
      expect(alt.url).toBe(`https://webdoc.example.com/${alt.locale}/programming/getting-started`);
    }
  });

  it('should generate correct hreflang URLs with subcategory', () => {
    const doc = createMockDocument({ subcategory: 'advanced' });
    const metadata = generateMetadata(doc, 'zh');

    for (const alt of metadata.hreflangAlternates) {
      expect(alt.url).toBe(`https://webdoc.example.com/${alt.locale}/programming/advanced/getting-started`);
    }
  });

  it('should strip markdown syntax from generated description', () => {
    const doc = createMockDocument({
      frontmatter: { title: 'Test' },
      content: '## Heading\n\nThis is **bold** and *italic* text with [a link](http://example.com).',
    });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.description).not.toContain('##');
    expect(metadata.description).not.toContain('**');
    expect(metadata.description).not.toContain('*');
    expect(metadata.description).not.toContain('[');
    expect(metadata.description).not.toContain('](');
  });

  it('should strip HTML tags from generated description', () => {
    const doc = createMockDocument({
      frontmatter: { title: 'Test' },
      content: '<p>This is <strong>formatted</strong> HTML content.</p>',
    });
    const metadata = generateMetadata(doc, 'en');
    expect(metadata.description).not.toContain('<');
    expect(metadata.description).not.toContain('>');
    expect(metadata.description).toContain('This is formatted HTML content.');
  });

  it('should handle document with different locale for canonical', () => {
    const doc = createMockDocument({ locale: 'zh' });
    const metadata = generateMetadata(doc, 'zh');
    expect(metadata.canonicalUrl).toBe('https://webdoc.example.com/zh/programming/getting-started');
  });
});
