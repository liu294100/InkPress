import { describe, it, expect } from 'vitest';
import {
  getDocumentBySlug,
  getDocumentsByCategory,
  getAllDocuments,
  getCategories,
  detectContentType,
  calculateReadingTime,
  buildHeadingTree,
} from '../../../src/lib/content';

describe('Content loading and parsing', () => {
  describe('detectContentType', () => {
    it('should detect markdown files', () => {
      expect(detectContentType('test.md')).toBe('markdown');
      expect(detectContentType('path/to/file.mdx')).toBe('markdown');
    });

    it('should detect html files', () => {
      expect(detectContentType('test.html')).toBe('html');
      expect(detectContentType('path/to/file.htm')).toBe('html');
    });

    it('should default to markdown for unknown extensions', () => {
      expect(detectContentType('test.txt')).toBe('markdown');
      expect(detectContentType('noext')).toBe('markdown');
    });
  });

  describe('calculateReadingTime', () => {
    it('should return at least 1 minute for empty content', () => {
      expect(calculateReadingTime('', 'en')).toBe(1);
    });

    it('should calculate English reading time at ~200 wpm', () => {
      // 400 words should be ~2 minutes
      const words = Array(400).fill('word').join(' ');
      expect(calculateReadingTime(words, 'en')).toBe(2);
    });

    it('should calculate CJK reading time at ~250 cpm', () => {
      // 500 CJK chars should be ~2 minutes
      const chars = '你'.repeat(500);
      expect(calculateReadingTime(chars, 'zh')).toBe(2);
    });

    it('should treat Japanese as CJK', () => {
      const chars = 'あ'.repeat(250);
      expect(calculateReadingTime(chars, 'ja')).toBe(1);
    });

    it('should treat Korean as CJK', () => {
      const chars = '가'.repeat(500);
      expect(calculateReadingTime(chars, 'ko')).toBe(2);
    });

    it('should strip markdown syntax before counting', () => {
      const markdown = '# Heading\n\n**bold** and [link](url) and `code`';
      // Should not crash and should return a reasonable value
      const time = calculateReadingTime(markdown, 'en');
      expect(time).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getCategories', () => {
    it('should return categories from config', () => {
      const categories = getCategories();
      expect(categories).toHaveLength(5);
    });

    it('should include all default category IDs', () => {
      const categories = getCategories();
      const ids = categories.map((c) => c.id);
      expect(ids).toContain('programming');
      expect(ids).toContain('ai');
      expect(ids).toContain('finance');
      expect(ids).toContain('articles');
      expect(ids).toContain('history');
    });
  });

  describe('getDocumentBySlug', () => {
    it('should load a markdown document by slug', async () => {
      const doc = await getDocumentBySlug('zh', 'programming', ['intro']);
      expect(doc).not.toBeNull();
      expect(doc!.title).toBe('编程入门');
      expect(doc!.locale).toBe('zh');
      expect(doc!.category).toBe('programming');
      expect(doc!.contentType).toBe('markdown');
      expect(doc!.slug).toBe('intro');
    });

    it('should load an HTML document by slug', async () => {
      const doc = await getDocumentBySlug('zh', 'programming', ['advanced']);
      expect(doc).not.toBeNull();
      expect(doc!.title).toBe('高级编程技巧');
      expect(doc!.contentType).toBe('html');
    });

    it('should return null for non-existent document', async () => {
      const doc = await getDocumentBySlug('zh', 'programming', ['nonexistent']);
      expect(doc).toBeNull();
    });

    it('should parse frontmatter correctly', async () => {
      const doc = await getDocumentBySlug('en', 'programming', ['getting-started']);
      expect(doc).not.toBeNull();
      expect(doc!.frontmatter.title).toBe('Getting Started with Programming');
      expect(doc!.frontmatter.description).toBe("A beginner's guide to programming");
      expect(doc!.frontmatter.keywords).toEqual(['programming', 'beginner', 'tutorial']);
      expect(doc!.frontmatter.author).toBe('WebDoc');
      expect(doc!.frontmatter.date).toBe('2024-02-01');
    });

    it('should calculate reading time', async () => {
      const doc = await getDocumentBySlug('en', 'programming', ['getting-started']);
      expect(doc).not.toBeNull();
      expect(doc!.readingTime).toBeGreaterThanOrEqual(1);
    });

    it('should have a lastModified date', async () => {
      const doc = await getDocumentBySlug('zh', 'programming', ['intro']);
      expect(doc).not.toBeNull();
      expect(doc!.lastModified).toBeTruthy();
      // Should be a valid ISO date
      expect(new Date(doc!.lastModified).toISOString()).toBe(doc!.lastModified);
    });
  });

  describe('getDocumentsByCategory', () => {
    it('should return all documents in a category', async () => {
      const docs = await getDocumentsByCategory('zh', 'programming');
      expect(docs.length).toBeGreaterThanOrEqual(2); // intro.md + advanced.html
    });

    it('should return empty array for empty category', async () => {
      const docs = await getDocumentsByCategory('zh', 'ai');
      expect(docs).toEqual([]);
    });

    it('should return empty array for non-existent category', async () => {
      const docs = await getDocumentsByCategory('zh', 'nonexistent');
      expect(docs).toEqual([]);
    });

    it('should not include draft documents', async () => {
      const docs = await getDocumentsByCategory('zh', 'programming');
      for (const doc of docs) {
        expect(doc.frontmatter.draft).not.toBe(true);
      }
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents for a locale', async () => {
      const docs = await getAllDocuments('zh');
      expect(docs.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for locale with no content', async () => {
      const docs = await getAllDocuments('fr');
      expect(docs).toEqual([]);
    });

    it('should include documents from multiple categories', async () => {
      const docs = await getAllDocuments('zh');
      const categories = new Set(docs.map((d) => d.category));
      expect(categories.has('programming')).toBe(true);
    });
  });

  describe('buildHeadingTree', () => {
    it('should return empty array for empty content', () => {
      expect(buildHeadingTree('')).toEqual([]);
      expect(buildHeadingTree('   ')).toEqual([]);
    });

    it('should return empty array for content with no headings', () => {
      expect(buildHeadingTree('Just some text\nAnother paragraph')).toEqual([]);
    });

    it('should parse markdown headings', () => {
      const content = '# Title\n## Section\n### Detail';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(1);
      expect(tree[0].text).toBe('Title');
      expect(tree[0].level).toBe(1);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].text).toBe('Section');
      expect(tree[0].children[0].level).toBe(2);
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].text).toBe('Detail');
      expect(tree[0].children[0].children[0].level).toBe(3);
    });

    it('should parse HTML headings', () => {
      const content = '<h1>Title</h1>\n<h2>Section</h2>\n<h3>Detail</h3>';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(1);
      expect(tree[0].text).toBe('Title');
      expect(tree[0].level).toBe(1);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].text).toBe('Section');
    });

    it('should generate slugified IDs', () => {
      const content = '# Hello World\n## Section A';
      const tree = buildHeadingTree(content);
      expect(tree[0].id).toBe('hello-world');
      expect(tree[0].children[0].id).toBe('section-a');
    });

    it('should generate unique IDs for duplicate headings', () => {
      const content = '## Section\n## Section\n## Section';
      const tree = buildHeadingTree(content);
      expect(tree[0].id).toBe('section');
      expect(tree[1].id).toBe('section-1');
      expect(tree[2].id).toBe('section-2');
    });

    it('should handle all same level headings as siblings', () => {
      const content = '## A\n## B\n## C';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(3);
      expect(tree[0].text).toBe('A');
      expect(tree[1].text).toBe('B');
      expect(tree[2].text).toBe('C');
      expect(tree[0].children).toHaveLength(0);
    });

    it('should build correct hierarchy with mixed levels', () => {
      const content = '# Title\n## Section A\n### Detail\n## Section B';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(1);
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].text).toBe('Section A');
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].text).toBe('Detail');
      expect(tree[0].children[1].text).toBe('Section B');
      expect(tree[0].children[1].children).toHaveLength(0);
    });

    it('should handle skipped levels (e.g. h1 followed by h3)', () => {
      const content = '# Title\n### Deep Section';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(1);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].text).toBe('Deep Section');
      expect(tree[0].children[0].level).toBe(3);
    });

    it('should strip HTML tags from heading text in HTML content', () => {
      const content = '<h2><strong>Bold</strong> Heading</h2>';
      const tree = buildHeadingTree(content);
      expect(tree[0].text).toBe('Bold Heading');
    });

    it('should handle special characters in ID generation', () => {
      const content = '## Hello, World! (Test)';
      const tree = buildHeadingTree(content);
      expect(tree[0].id).toBe('hello-world-test');
    });

    it('should handle mixed markdown and HTML headings', () => {
      const content = '# Markdown Title\n<h2>HTML Section</h2>\n## Another Section';
      const tree = buildHeadingTree(content);
      expect(tree).toHaveLength(1);
      expect(tree[0].text).toBe('Markdown Title');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].text).toBe('HTML Section');
      expect(tree[0].children[1].text).toBe('Another Section');
    });
  });
});
