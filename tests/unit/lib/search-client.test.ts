import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { truncateQuery, highlightTerms, searchDocuments, clearSearchCache } from '@/lib/search-client';
import type { SearchIndex } from '@/lib/types';

describe('search-client', () => {
  describe('truncateQuery', () => {
    it('should return the same string if under 200 chars', () => {
      const query = 'hello world';
      expect(truncateQuery(query)).toBe('hello world');
    });

    it('should truncate strings longer than 200 chars', () => {
      const query = 'a'.repeat(250);
      expect(truncateQuery(query)).toHaveLength(200);
    });

    it('should handle empty string', () => {
      expect(truncateQuery('')).toBe('');
    });

    it('should handle exactly 200 chars', () => {
      const query = 'b'.repeat(200);
      expect(truncateQuery(query)).toHaveLength(200);
      expect(truncateQuery(query)).toBe(query);
    });
  });

  describe('highlightTerms', () => {
    it('should wrap matching terms with mark tags', () => {
      const result = highlightTerms('hello world', 'hello');
      expect(result).toContain('<mark');
      expect(result).toContain('hello');
      expect(result).toContain('</mark>');
    });

    it('should highlight multiple occurrences', () => {
      const result = highlightTerms('hello world hello again', 'hello');
      const matches = result.match(/<mark/g);
      expect(matches).toHaveLength(2);
    });

    it('should be case insensitive', () => {
      const result = highlightTerms('Hello World HELLO', 'hello');
      const matches = result.match(/<mark/g);
      expect(matches).toHaveLength(2);
    });

    it('should highlight multiple query terms', () => {
      const result = highlightTerms('hello beautiful world', 'hello world');
      expect(result).toContain('<mark');
      // Both "hello" and "world" should be highlighted
      const matches = result.match(/<mark/g);
      expect(matches).toHaveLength(2);
    });

    it('should return original text when query is empty', () => {
      expect(highlightTerms('hello world', '')).toBe('hello world');
      expect(highlightTerms('hello world', '   ')).toBe('hello world');
    });

    it('should return original text when text is empty', () => {
      expect(highlightTerms('', 'hello')).toBe('');
    });

    it('should handle special regex characters in query', () => {
      const result = highlightTerms('price is $100 (USD)', '$100');
      expect(result).toContain('<mark');
      expect(result).toContain('$100');
    });

    it('should work with CJK characters', () => {
      const result = highlightTerms('这是一个中文测试', '中文');
      expect(result).toContain('<mark');
      expect(result).toContain('中文');
    });
  });
});


describe('searchDocuments', () => {
  const mockSearchIndex: SearchIndex = {
    locale: 'en',
    documents: [
      {
        id: 'programming/intro',
        title: 'Introduction to Programming',
        content: 'Learn the basics of programming with examples and exercises',
        category: 'programming',
        slug: 'intro',
        excerpt: 'Learn the basics of programming...',
      },
      {
        id: 'programming/advanced',
        title: 'Advanced Patterns',
        content: 'Design patterns and advanced programming techniques for experienced developers',
        category: 'programming',
        slug: 'advanced',
        excerpt: 'Design patterns and advanced...',
      },
      {
        id: 'ai/machine-learning',
        title: 'Machine Learning Basics',
        content: 'Introduction to machine learning algorithms and neural networks',
        category: 'ai',
        slug: 'machine-learning',
        excerpt: 'Introduction to machine learning...',
      },
    ],
  };

  beforeEach(() => {
    clearSearchCache();
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSearchIndex),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const results = await searchDocuments('', 'en');
    expect(results).toEqual([]);
  });

  it('should return empty array for whitespace-only query', async () => {
    const results = await searchDocuments('   ', 'en');
    expect(results).toEqual([]);
  });

  it('should find documents by title match', async () => {
    const results = await searchDocuments('programming', 'en');
    expect(results.length).toBeGreaterThan(0);
    // The document with "Programming" in title should be found
    const found = results.find((r) => r.id === 'programming/intro');
    expect(found).toBeDefined();
  });

  it('should find documents by content match', async () => {
    const results = await searchDocuments('neural networks', 'en');
    expect(results.length).toBeGreaterThan(0);
    const found = results.find((r) => r.id === 'ai/machine-learning');
    expect(found).toBeDefined();
  });

  it('should return results with score-based ranking', async () => {
    const results = await searchDocuments('programming', 'en');
    expect(results.length).toBeGreaterThan(0);
    // Results should be sorted by score descending
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('should fetch index for the specified locale', async () => {
    await searchDocuments('test', 'en');
    expect(global.fetch).toHaveBeenCalledWith('/search-index/en.json');
  });

  it('should cache the index after first load', async () => {
    await searchDocuments('test', 'en');
    await searchDocuments('another', 'en');
    // fetch should only be called once for the same locale
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return results with required fields', async () => {
    const results = await searchDocuments('programming', 'en');
    for (const result of results) {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('highlights');
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.highlights)).toBe(true);
    }
  });

  it('should handle fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    clearSearchCache();

    await expect(searchDocuments('test', 'missing')).rejects.toThrow(
      /Failed to load search index/
    );
  });

  it('should truncate query to 200 characters', async () => {
    const longQuery = 'a'.repeat(300);
    // Should not throw, just process truncated query
    await searchDocuments(longQuery, 'en');
    // Verify fetch was called (index was loaded)
    expect(global.fetch).toHaveBeenCalled();
  });
});

describe('searchDocuments with CJK locale', () => {
  const mockCJKIndex: SearchIndex = {
    locale: 'zh',
    documents: [
      {
        id: 'programming/intro',
        title: '编程入门',
        content: '学习编程的基础知识包括变量函数和控制流',
        category: 'programming',
        slug: 'intro',
        excerpt: '学习编程的基础知识...',
      },
      {
        id: 'ai/basics',
        title: '人工智能基础',
        content: '了解人工智能和机器学习的基本概念',
        category: 'ai',
        slug: 'basics',
        excerpt: '了解人工智能和机器学习...',
      },
    ],
  };

  beforeEach(() => {
    clearSearchCache();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCJKIndex),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should find CJK documents by Chinese characters', async () => {
    const results = await searchDocuments('编程', 'zh');
    expect(results.length).toBeGreaterThan(0);
    const found = results.find((r) => r.id === 'programming/intro');
    expect(found).toBeDefined();
  });

  it('should find documents with partial CJK matches', async () => {
    const results = await searchDocuments('人工智能', 'zh');
    expect(results.length).toBeGreaterThan(0);
    const found = results.find((r) => r.id === 'ai/basics');
    expect(found).toBeDefined();
  });
});
