/**
 * Integration test: Sitemap generation with sample content.
 * Tests that the sitemap function generates entries for all locales and documents.
 *
 * Validates: Requirements 10.2
 */

import { describe, it, expect } from 'vitest';
import sitemap from '../../src/app/sitemap';
import { siteConfig } from '../../src/config/site.config';
import { getCategories } from '../../src/lib/content';

describe('Integration: Sitemap Generation', () => {
  it('should generate a non-empty sitemap', async () => {
    const entries = await sitemap();

    expect(entries).toBeDefined();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should include homepage entries for all supported locales', async () => {
    const entries = await sitemap();
    const { supportedLocales, url: baseUrl } = siteConfig;

    for (const locale of supportedLocales) {
      const homepageEntry = entries.find(
        (entry) => entry.url === `${baseUrl}/${locale}`
      );
      expect(homepageEntry).toBeDefined();
      expect(homepageEntry!.priority).toBe(1.0);
      expect(homepageEntry!.changeFrequency).toBe('daily');
    }
  });

  it('should include category listing pages for all locale×category combinations', async () => {
    const entries = await sitemap();
    const { supportedLocales, url: baseUrl } = siteConfig;
    const categories = getCategories();

    for (const locale of supportedLocales) {
      for (const category of categories) {
        const categoryEntry = entries.find(
          (entry) => entry.url === `${baseUrl}/${locale}/${category.id}`
        );
        expect(categoryEntry).toBeDefined();
        expect(categoryEntry!.priority).toBe(0.8);
        expect(categoryEntry!.changeFrequency).toBe('weekly');
      }
    }
  });

  it('should include alternate language links in each entry', async () => {
    const entries = await sitemap();
    const { supportedLocales } = siteConfig;

    // Check that every entry has alternates with all supported locales
    for (const entry of entries) {
      expect(entry.alternates).toBeDefined();
      expect(entry.alternates!.languages).toBeDefined();

      const languages = entry.alternates!.languages as Record<string, string>;
      for (const locale of supportedLocales) {
        expect(languages[locale]).toBeDefined();
        expect(languages[locale]).toContain(`/${locale}`);
      }
    }
  });

  it('should include document pages for locales with content', async () => {
    const entries = await sitemap();
    const { url: baseUrl } = siteConfig;

    // We know zh locale has programming/intro content
    const zhDocEntry = entries.find(
      (entry) =>
        entry.url.startsWith(`${baseUrl}/zh/programming/`) &&
        entry.url !== `${baseUrl}/zh/programming`
    );

    expect(zhDocEntry).toBeDefined();
    expect(zhDocEntry!.priority).toBe(0.6);
    expect(zhDocEntry!.changeFrequency).toBe('weekly');
  });

  it('should have valid URLs starting with the base URL', async () => {
    const entries = await sitemap();
    const { url: baseUrl } = siteConfig;

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.url.startsWith(baseUrl)).toBe(true);
    }
  });

  it('should have valid lastModified dates', async () => {
    const entries = await sitemap();

    for (const entry of entries) {
      expect(entry.lastModified).toBeDefined();
      // lastModified should be a valid Date
      const date = new Date(entry.lastModified as string | Date);
      expect(date.getTime()).not.toBeNaN();
    }
  });

  it('should produce consistent structure for document entries', async () => {
    const entries = await sitemap();

    // Document entries have priority 0.6
    const docEntries = entries.filter((e) => e.priority === 0.6);

    for (const entry of docEntries) {
      // URL should have at least 3 path segments: /locale/category/slug
      const urlPath = new URL(entry.url).pathname;
      const segments = urlPath.split('/').filter(Boolean);
      expect(segments.length).toBeGreaterThanOrEqual(3);
    }
  });
});
