/**
 * Property 13: SEO metadata generation is complete
 * Validates: Requirements 10.1, 10.3, 10.5, 16.3
 *
 * "For any document with frontmatter (title, description, keywords), the SEO metadata generator
 * SHALL produce output containing: a title tag, meta description, meta keywords, canonical URL,
 * og:title, og:description, og:url, og:type, and hreflang alternate links for all supported locales."
 *
 * Property 14: Sitemap contains all document URLs across all languages
 * Validates: Requirements 10.2
 *
 * "For any set of documents across all supported locales, the sitemap generator SHALL produce
 * an entry for every document×locale combination, and each entry SHALL include alternateLinks
 * referencing all locale versions of that document."
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { Document, DocumentFrontmatter, Category } from '@/lib/types';

// Mock content module to control documents returned per locale (needed for sitemap tests)
vi.mock('@/lib/content', () => ({
  getAllDocuments: vi.fn(),
  getCategories: vi.fn(),
}));

// Mock site config with a controlled set of locales
vi.mock('@/config/site.config', () => ({
  siteConfig: {
    name: 'WebDoc',
    description: 'Test',
    url: 'https://webdoc.example.com',
    defaultLocale: 'zh',
    supportedLocales: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'],
    features: { paywall: { enabled: false }, ads: { enabled: false }, analytics: { enabled: false } },
    social: {},
    footer: { privacyPolicyUrl: '/privacy', copyrightHolder: 'WebDoc' },
  },
}));

import { getAllDocuments, getCategories } from '@/lib/content';
import { siteConfig } from '@/config/site.config';
import { generateMetadata } from '@/lib/seo';
import sitemapFn from '@/app/sitemap';

const SUPPORTED_LOCALES = siteConfig.supportedLocales;

// ============================================================
// Arbitraries for Property 13 (SEO metadata)
// ============================================================

/**
 * Arbitrary generator for a non-empty string suitable for slugs/paths.
 */
const slugArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 2, maxLength: 20 }
).filter((s) => !s.startsWith('-') && !s.endsWith('-') && !s.includes('--'));

/**
 * Arbitrary generator for a non-empty title string.
 */
const titleArb = fc.string({ minLength: 1, maxLength: 100 });

/**
 * Arbitrary generator for a description string.
 */
const descriptionArb = fc.string({ minLength: 1, maxLength: 200 });

/**
 * Arbitrary generator for keywords array.
 */
const keywordsArb = fc.array(
  fc.string({ minLength: 1, maxLength: 30 }),
  { minLength: 1, maxLength: 10 }
);

/**
 * Arbitrary generator for a locale from the supported list.
 */
const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);

/**
 * Arbitrary generator for DocumentFrontmatter with title, description, and keywords present.
 */
const frontmatterArb: fc.Arbitrary<DocumentFrontmatter> = fc.record({
  title: titleArb,
  description: descriptionArb,
  keywords: keywordsArb,
  author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  date: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
      (d) => d.toISOString().split('T')[0]
    ),
    { nil: undefined }
  ),
  paywallEnabled: fc.option(fc.boolean(), { nil: undefined }),
  draft: fc.option(fc.boolean(), { nil: undefined }),
});

/**
 * Arbitrary generator for a Document object with frontmatter containing title, description, keywords.
 */
const documentArb: fc.Arbitrary<Document> = fc.record({
  slug: slugArb,
  locale: localeArb,
  category: slugArb,
  subcategory: fc.option(slugArb, { nil: undefined }),
  title: titleArb,
  content: fc.string({ minLength: 0, maxLength: 500 }),
  contentType: fc.constantFrom('markdown' as const, 'html' as const),
  frontmatter: frontmatterArb,
  headings: fc.constant([]),
  readingTime: fc.nat({ max: 60 }),
  lastModified: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
    (d) => d.toISOString()
  ),
});

// ============================================================
// Arbitraries for Property 14 (Sitemap)
// ============================================================

/**
 * Arbitrary generator for a category ID.
 */
const categoryIdArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 2, maxLength: 10 }
);

/**
 * Generates a minimal Document object for sitemap testing.
 */
function makeDocument(locale: string, category: string, slug: string): Document {
  return {
    slug,
    locale,
    category,
    title: `Title ${slug}`,
    content: 'Test content',
    contentType: 'markdown',
    frontmatter: {
      title: `Title ${slug}`,
      paywallEnabled: false,
      draft: false,
    },
    headings: [],
    readingTime: 1,
    lastModified: '2024-01-15T00:00:00.000Z',
  };
}

/**
 * Generates a set of document definitions (category + slug pairs) that exist
 * across locales. Each document is assumed to exist in all locales.
 */
const documentDefsArb = fc
  .array(
    fc.tuple(categoryIdArb, slugArb),
    { minLength: 1, maxLength: 8 }
  )
  .map((pairs) => {
    // Ensure unique category+slug combinations
    const seen = new Set<string>();
    return pairs.filter(([cat, slug]) => {
      const key = `${cat}/${slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })
  .filter((defs) => defs.length > 0);


// ============================================================
// Property 13: SEO metadata generation is complete
// ============================================================

describe('Feature: multilingual-docs-site, Property 13: SEO metadata generation is complete', () => {
  it('should produce output containing title for any document with frontmatter', () => {
    /**
     * **Validates: Requirements 10.1**
     *
     * The SEO metadata SHALL contain a title tag derived from the document frontmatter title.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // Title must be a non-empty string containing the frontmatter title
        expect(metadata.title).toBeDefined();
        expect(typeof metadata.title).toBe('string');
        expect(metadata.title.length).toBeGreaterThan(0);
        expect(metadata.title).toContain(document.frontmatter.title);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce output containing meta description for any document with frontmatter', () => {
    /**
     * **Validates: Requirements 10.1**
     *
     * The SEO metadata SHALL contain a meta description.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // Description must be a non-empty string
        expect(metadata.description).toBeDefined();
        expect(typeof metadata.description).toBe('string');
        expect(metadata.description.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce output containing meta keywords for any document with frontmatter keywords', () => {
    /**
     * **Validates: Requirements 10.1**
     *
     * The SEO metadata SHALL contain meta keywords matching the frontmatter keywords.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // Keywords must be an array containing the frontmatter keywords
        expect(metadata.keywords).toBeDefined();
        expect(Array.isArray(metadata.keywords)).toBe(true);
        expect(metadata.keywords).toEqual(document.frontmatter.keywords);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce output containing a canonical URL for any document', () => {
    /**
     * **Validates: Requirements 10.1**
     *
     * The SEO metadata SHALL contain a canonical URL that is a valid absolute URL.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // Canonical URL must be a non-empty string starting with site URL
        expect(metadata.canonicalUrl).toBeDefined();
        expect(typeof metadata.canonicalUrl).toBe('string');
        expect(metadata.canonicalUrl).toContain(siteConfig.url);
        expect(metadata.canonicalUrl).toContain(locale);
        expect(metadata.canonicalUrl).toContain(document.category);
        expect(metadata.canonicalUrl).toContain(document.slug);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce output containing og:title, og:description, og:url, og:type', () => {
    /**
     * **Validates: Requirements 10.5, 16.3**
     *
     * The SEO metadata SHALL contain Open Graph tags: og:title (in title field),
     * og:description (in description field), og:url (in canonicalUrl field), og:type.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // og:title is represented by metadata.title (non-empty)
        expect(metadata.title).toBeDefined();
        expect(metadata.title.length).toBeGreaterThan(0);

        // og:description is represented by metadata.description (non-empty)
        expect(metadata.description).toBeDefined();
        expect(metadata.description.length).toBeGreaterThan(0);

        // og:url is represented by metadata.canonicalUrl (valid URL)
        expect(metadata.canonicalUrl).toBeDefined();
        expect(metadata.canonicalUrl.startsWith('http')).toBe(true);

        // og:type must be present and non-empty
        expect(metadata.ogType).toBeDefined();
        expect(typeof metadata.ogType).toBe('string');
        expect(metadata.ogType.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce hreflang alternate links for all 9 supported locales', () => {
    /**
     * **Validates: Requirements 10.3**
     *
     * The SEO metadata SHALL contain hreflang alternate links for all supported locales
     * (zh, en, ja, ko, fr, de, es, ms, th).
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // hreflangAlternates must be defined and contain exactly 9 entries
        expect(metadata.hreflangAlternates).toBeDefined();
        expect(Array.isArray(metadata.hreflangAlternates)).toBe(true);
        expect(metadata.hreflangAlternates).toHaveLength(SUPPORTED_LOCALES.length);

        // Each supported locale must have an entry
        const alternateLocales = metadata.hreflangAlternates.map((alt) => alt.locale);
        for (const supportedLocale of SUPPORTED_LOCALES) {
          expect(alternateLocales).toContain(supportedLocale);
        }

        // Each alternate must have a valid URL containing the locale
        for (const alt of metadata.hreflangAlternates) {
          expect(alt.url).toBeDefined();
          expect(typeof alt.url).toBe('string');
          expect(alt.url).toContain(siteConfig.url);
          expect(alt.url).toContain(alt.locale);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should produce complete metadata with all required fields for any valid document', () => {
    /**
     * **Validates: Requirements 10.1, 10.3, 10.5, 16.3**
     *
     * Comprehensive check: for any document with frontmatter, ALL required SEO fields
     * must be present and correctly populated in a single pass.
     */
    fc.assert(
      fc.property(documentArb, localeArb, (document, locale) => {
        const metadata = generateMetadata(document, locale);

        // All fields must be defined
        expect(metadata).toHaveProperty('title');
        expect(metadata).toHaveProperty('description');
        expect(metadata).toHaveProperty('keywords');
        expect(metadata).toHaveProperty('canonicalUrl');
        expect(metadata).toHaveProperty('ogType');
        expect(metadata).toHaveProperty('hreflangAlternates');

        // Title contains frontmatter title
        expect(metadata.title).toContain(document.frontmatter.title);

        // Description is non-empty
        expect(metadata.description.length).toBeGreaterThan(0);

        // Keywords match frontmatter
        expect(metadata.keywords).toEqual(document.frontmatter.keywords);

        // Canonical URL is absolute and contains document path info
        expect(metadata.canonicalUrl.startsWith(siteConfig.url)).toBe(true);

        // OG type is present
        expect(metadata.ogType.length).toBeGreaterThan(0);

        // Hreflang covers all 9 locales
        expect(metadata.hreflangAlternates).toHaveLength(9);
        const locales = metadata.hreflangAlternates.map((a) => a.locale).sort();
        expect(locales).toEqual([...SUPPORTED_LOCALES].sort());
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 14: Sitemap contains all document URLs across all languages
// ============================================================

describe('Feature: multilingual-docs-site, Property 14: Sitemap contains all document URLs across all languages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sitemap produces an entry for every document×locale combination', async () => {
    /**
     * **Validates: Requirements 10.2**
     *
     * For any set of documents, the sitemap SHALL contain an entry for
     * every document in every supported locale.
     */
    await fc.assert(
      fc.asyncProperty(documentDefsArb, async (docDefs) => {
        const supportedLocales = siteConfig.supportedLocales;

        // Extract unique categories from generated doc definitions
        const uniqueCategories = [...new Set(docDefs.map(([cat]) => cat))];
        const categories: Category[] = uniqueCategories.map((id, idx) => ({
          id,
          name: { zh: id, en: id, ja: id, ko: id, fr: id, de: id, es: id, ms: id, th: id },
          order: idx,
        }));

        // Mock getCategories to return our generated categories
        vi.mocked(getCategories).mockReturnValue(categories);

        // Mock getAllDocuments to return the generated documents for each locale
        vi.mocked(getAllDocuments).mockImplementation(async (locale: string) => {
          return docDefs.map(([cat, slug]) => makeDocument(locale, cat, slug));
        });

        const entries = await sitemapFn();

        // Calculate expected document entries: docDefs.length × supportedLocales.length
        // Plus homepage entries (supportedLocales.length) and category entries (uniqueCategories.length × supportedLocales.length)
        const expectedHomepageEntries = supportedLocales.length;
        const expectedCategoryEntries = uniqueCategories.length * supportedLocales.length;
        const expectedDocEntries = docDefs.length * supportedLocales.length;
        const expectedTotal = expectedHomepageEntries + expectedCategoryEntries + expectedDocEntries;

        expect(entries).toHaveLength(expectedTotal);

        // Verify every document×locale combination has an entry
        const baseUrl = siteConfig.url;
        for (const locale of supportedLocales) {
          for (const [cat, slug] of docDefs) {
            const expectedUrl = `${baseUrl}/${locale}/${cat}/${slug}`;
            const entry = entries.find((e) => e.url === expectedUrl);
            expect(entry).toBeDefined();
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('each document entry includes alternateLinks for all locale versions', async () => {
    /**
     * **Validates: Requirements 10.2**
     *
     * Each sitemap entry for a document SHALL include alternateLinks
     * referencing all locale versions of that document.
     */
    await fc.assert(
      fc.asyncProperty(documentDefsArb, async (docDefs) => {
        const supportedLocales = siteConfig.supportedLocales;

        const uniqueCategories = [...new Set(docDefs.map(([cat]) => cat))];
        const categories: Category[] = uniqueCategories.map((id, idx) => ({
          id,
          name: { zh: id, en: id, ja: id, ko: id, fr: id, de: id, es: id, ms: id, th: id },
          order: idx,
        }));

        vi.mocked(getCategories).mockReturnValue(categories);
        vi.mocked(getAllDocuments).mockImplementation(async (locale: string) => {
          return docDefs.map(([cat, slug]) => makeDocument(locale, cat, slug));
        });

        const entries = await sitemapFn();
        const baseUrl = siteConfig.url;

        // Check document entries have alternateLinks for all locales
        for (const locale of supportedLocales) {
          for (const [cat, slug] of docDefs) {
            const expectedUrl = `${baseUrl}/${locale}/${cat}/${slug}`;
            const entry = entries.find((e) => e.url === expectedUrl);

            expect(entry).toBeDefined();
            expect(entry!.alternates).toBeDefined();
            expect(entry!.alternates!.languages).toBeDefined();

            const languages = entry!.alternates!.languages as Record<string, string>;

            // Must have an alternate link for every supported locale
            for (const altLocale of supportedLocales) {
              const altUrl = `${baseUrl}/${altLocale}/${cat}/${slug}`;
              expect(languages[altLocale]).toBe(altUrl);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
