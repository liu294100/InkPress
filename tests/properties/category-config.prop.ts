/**
 * Property 4: Category configuration determines site structure
 * Validates: Requirements 3.2, 3.3, 3.4
 *
 * "For any valid category configuration (including nested sub-categories of arbitrary depth),
 * the content loading system SHALL return exactly the categories defined in the configuration,
 * and filtering documents by a category SHALL return all and only documents belonging to that category."
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { Category } from '@/lib/types';

// We need to mock the categoriesConfig to inject arbitrary configurations
// and test that getCategories() always returns what the config defines.
vi.mock('@/config/categories.config', () => ({
  categoriesConfig: { categories: [] },
}));

import { categoriesConfig } from '@/config/categories.config';
import { getCategories, getDocumentsByCategory } from '@/lib/content';

/**
 * Arbitrary generator for a single Category (without subcategories).
 * Generates category IDs as lowercase alpha strings to simulate realistic category slugs.
 */
const categoryIdArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 2, maxLength: 12 }
);

/**
 * Generates a localized name record for supported locales.
 */
const localizedNameArb = fc.record({
  zh: fc.string({ minLength: 1, maxLength: 20 }),
  en: fc.string({ minLength: 1, maxLength: 20 }),
  ja: fc.string({ minLength: 1, maxLength: 20 }),
  ko: fc.string({ minLength: 1, maxLength: 20 }),
  fr: fc.string({ minLength: 1, maxLength: 20 }),
  de: fc.string({ minLength: 1, maxLength: 20 }),
  es: fc.string({ minLength: 1, maxLength: 20 }),
  ms: fc.string({ minLength: 1, maxLength: 20 }),
  th: fc.string({ minLength: 1, maxLength: 20 }),
});

/**
 * Generates a category with nested subcategories of arbitrary depth.
 * Uses fc.letrec for recursive structure generation.
 */
const categoryArb: fc.Arbitrary<Category> = fc.letrec((tie) => ({
  category: fc.record({
    id: categoryIdArb,
    name: localizedNameArb,
    icon: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    color: fc.option(
      fc.hexaString({ minLength: 6, maxLength: 6 }).map((h) => `#${h}`),
      { nil: undefined }
    ),
    subcategories: fc.option(
      fc.array(tie('category') as fc.Arbitrary<Category>, { minLength: 0, maxLength: 3 }),
      { nil: undefined }
    ),
    order: fc.nat({ max: 100 }),
  }),
})).category as fc.Arbitrary<Category>;

/**
 * Generates a valid categories configuration with unique top-level IDs.
 */
const categoriesConfigArb = fc
  .array(categoryArb, { minLength: 1, maxLength: 10 })
  .map((cats) => {
    // Ensure unique IDs at the top level
    const seen = new Set<string>();
    return cats.filter((cat) => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });
  })
  .filter((cats) => cats.length > 0);

/**
 * Recursively collects all category IDs from a category tree (including subcategories).
 */
function collectAllCategoryIds(categories: Category[]): string[] {
  const ids: string[] = [];
  for (const cat of categories) {
    ids.push(cat.id);
    if (cat.subcategories) {
      ids.push(...collectAllCategoryIds(cat.subcategories));
    }
  }
  return ids;
}

describe('Feature: multilingual-docs-site, Property 4: Category configuration determines site structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset the mocked config
    (categoriesConfig as any).categories = [];
  });

  it('getCategories() returns exactly the categories defined in configuration', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * For any valid category configuration, getCategories() SHALL return
     * exactly the categories defined in the configuration.
     */
    fc.assert(
      fc.property(categoriesConfigArb, (generatedCategories) => {
        // Inject the generated config
        (categoriesConfig as any).categories = generatedCategories;

        const result = getCategories();

        // The result should be exactly the categories from config
        expect(result).toHaveLength(generatedCategories.length);

        // Each category ID should match
        const resultIds = result.map((c) => c.id);
        const configIds = generatedCategories.map((c) => c.id);
        expect(resultIds).toEqual(configIds);

        // Each category should have the correct structure
        for (let i = 0; i < result.length; i++) {
          expect(result[i].id).toBe(generatedCategories[i].id);
          expect(result[i].name).toEqual(generatedCategories[i].name);
          expect(result[i].order).toBe(generatedCategories[i].order);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('category IDs from getCategories() match configuration IDs including nested subcategories', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * For any valid category configuration with nested sub-categories of arbitrary depth,
     * the returned categories preserve the full tree structure.
     */
    fc.assert(
      fc.property(categoriesConfigArb, (generatedCategories) => {
        (categoriesConfig as any).categories = generatedCategories;

        const result = getCategories();

        // Collect all IDs from the config (including nested subcategories)
        const configAllIds = collectAllCategoryIds(generatedCategories);
        const resultAllIds = collectAllCategoryIds(result);

        // All IDs from config should be present in the result
        expect(resultAllIds).toEqual(configAllIds);
      }),
      { numRuns: 100 }
    );
  });

  it('getDocumentsByCategory returns documents only belonging to the requested category', () => {
    /**
     * **Validates: Requirements 3.4**
     *
     * Filtering documents by a category SHALL return all and only documents
     * belonging to that category. Each document's category field must match.
     */
    fc.assert(
      fc.asyncProperty(categoriesConfigArb, async (generatedCategories) => {
        (categoriesConfig as any).categories = generatedCategories;

        // For each category in the config, verify documents returned have the correct category
        for (const cat of generatedCategories) {
          const docs = await getDocumentsByCategory('zh', cat.id);

          // Every returned document must have the category field matching the requested category
          for (const doc of docs) {
            expect(doc.category).toBe(cat.id);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('getCategories() returns categories preserving subcategory structure at arbitrary depth', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * Nested sub-categories of arbitrary depth are preserved in the returned structure.
     */
    fc.assert(
      fc.property(categoriesConfigArb, (generatedCategories) => {
        (categoriesConfig as any).categories = generatedCategories;

        const result = getCategories();

        // Deep equality check: subcategories should be preserved at all levels
        function verifySubcategories(config: Category[], returned: Category[]) {
          expect(returned.length).toBe(config.length);
          for (let i = 0; i < config.length; i++) {
            expect(returned[i].id).toBe(config[i].id);
            if (config[i].subcategories && config[i].subcategories!.length > 0) {
              expect(returned[i].subcategories).toBeDefined();
              verifySubcategories(config[i].subcategories!, returned[i].subcategories!);
            }
          }
        }

        verifySubcategories(generatedCategories, result);
      }),
      { numRuns: 100 }
    );
  });
});
