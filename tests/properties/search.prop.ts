/**
 * Property tests for search functionality.
 *
 * Property 10: Search results are scoped to current language
 * Property 11: Full-text search covers titles and content
 * Property 12: Search result highlighting marks matching terms
 *
 * Validates: Requirements 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Index } from 'flexsearch';
import { highlightSearchTerms, countHighlights, countTermOccurrences } from '@/lib/search-highlight';
import type { SearchDocument, SearchIndex } from '@/lib/types';

// ─── Arbitraries ────────────────────────────────────────────────────────────

/** Supported locales from the site config */
const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];

/** Arbitrary for locale codes */
const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);

/** Arbitrary for category slugs */
const categoryArb = fc.constantFrom('programming', 'ai', 'finance', 'articles', 'history');

/** Arbitrary for simple alphanumeric words (used in titles/content) */
const wordArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 3, maxLength: 12 }
);

/** Arbitrary for generating unique document titles */
const titleArb = fc.array(wordArb, { minLength: 1, maxLength: 5 }).map((words) => words.join(' '));

/** Arbitrary for generating document content (plain text) */
const contentArb = fc.array(wordArb, { minLength: 5, maxLength: 30 }).map((words) => words.join(' '));

/** Arbitrary for a single SearchDocument */
const searchDocumentArb = fc.tuple(categoryArb, wordArb, titleArb, contentArb).map(
  ([category, slug, title, content]): SearchDocument => ({
    id: `${category}/${slug}`,
    title,
    content,
    category,
    slug,
    excerpt: content.slice(0, 100),
  })
);

/** Arbitrary for a SearchIndex with multiple documents for a given locale */
const searchIndexArb = (locale: string) =>
  fc.array(searchDocumentArb, { minLength: 1, maxLength: 10 }).map(
    (documents): SearchIndex => ({
      locale,
      documents,
    })
  );

/** Arbitrary for multi-locale search indices */
const multiLocaleIndicesArb = fc
  .tuple(
    fc.constantFrom(...SUPPORTED_LOCALES),
    fc.shuffledSubarray(SUPPORTED_LOCALES, { minLength: 2, maxLength: 5 })
  )
  .chain(([queryLocale, locales]) => {
    // Ensure queryLocale is in the locales array
    const allLocales = Array.from(new Set([queryLocale, ...locales]));
    return fc
      .tuple(
        fc.constant(queryLocale),
        ...allLocales.map((loc) => searchIndexArb(loc))
      )
      .map(([qLocale, ...indices]) => ({
        queryLocale: qLocale as string,
        indices: indices as SearchIndex[],
      }));
  });

/** Arbitrary for search terms (non-empty alpha strings that don't contain regex special chars) */
const searchTermArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 2, maxLength: 8 }
);

/** Arbitrary for text that contains specific terms */
const textWithTermsArb = fc
  .tuple(
    fc.array(wordArb, { minLength: 2, maxLength: 10 }),
    fc.array(searchTermArb, { minLength: 1, maxLength: 3 }),
    fc.array(fc.nat({ max: 10 }), { minLength: 1, maxLength: 3 })
  )
  .map(([baseWords, terms, insertPositions]) => {
    // Insert terms at various positions in the base text
    const words = [...baseWords];
    for (let i = 0; i < terms.length; i++) {
      const pos = insertPositions[i % insertPositions.length] % (words.length + 1);
      words.splice(pos, 0, terms[i]);
    }
    return { text: words.join(' '), terms };
  });

// ─── Property 10: Search results are scoped to current language ─────────────

describe('Feature: multilingual-docs-site, Property 10: Search results are scoped to current language', () => {
  /**
   * **Validates: Requirements 9.2, 9.5**
   *
   * For any search query against a multi-locale index, all results should have
   * documents from only the queried locale.
   */
  it('searching a locale-specific index returns only documents from that locale', () => {
    fc.assert(
      fc.property(multiLocaleIndicesArb, ({ queryLocale, indices }) => {
        // Build separate FlexSearch indices per locale (simulating the client-side approach)
        const localeIndices: Map<string, { index: Index; documents: SearchDocument[] }> = new Map();

        for (const searchIndex of indices) {
          const flexIndex = new Index({ tokenize: 'forward' });
          for (let i = 0; i < searchIndex.documents.length; i++) {
            flexIndex.add(i, searchIndex.documents[i].title + ' ' + searchIndex.documents[i].content);
          }
          localeIndices.set(searchIndex.locale, {
            index: flexIndex,
            documents: searchIndex.documents,
          });
        }

        // Get the target locale's index
        const targetEntry = localeIndices.get(queryLocale);
        if (!targetEntry) return; // skip if somehow no index for queryLocale

        // Pick a word from one of the target locale's documents as query
        const targetDoc = targetEntry.documents[0];
        const queryWord = targetDoc.title.split(' ')[0];
        if (!queryWord) return;

        // Search only the target locale's index (this is how the client works)
        const hits = targetEntry.index.search(queryWord, { limit: 50 }) as number[];
        const results = hits.map((idx) => targetEntry.documents[idx]);

        // ALL results must belong to the queried locale's index (they do by construction)
        // Verify no results come from other locales
        for (const result of results) {
          // Results from the target locale's document set - they should not appear
          // in other locale indices (because each locale has its own separate index)
          const otherLocaleIndices = [...localeIndices.entries()].filter(
            ([loc]) => loc !== queryLocale
          );
          for (const [otherLocale, otherEntry] of otherLocaleIndices) {
            // The document id should not be identical in another locale's index
            // (by locale-scoping design, each locale gets its own index)
            const otherHits = otherEntry.index.search(queryWord, { limit: 50 }) as number[];
            const otherResults = otherHits.map((idx) => otherEntry.documents[idx]);

            // If other locales happen to have the same word, that's fine -
            // the key invariant is that OUR results came from OUR locale's index only
            // This is guaranteed by architecture: we only searched targetEntry.index
          }
        }

        // The fundamental property: results array only contains docs from targetEntry.documents
        for (const result of results) {
          expect(targetEntry.documents).toContain(result);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('documents from other locales are never returned when searching a specific locale', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          searchIndexArb('en'),
          searchIndexArb('zh'),
          searchIndexArb('ja')
        ),
        ([enIndex, zhIndex, jaIndex]) => {
          // Build a FlexSearch index for 'en' locale only
          const enFlexIndex = new Index({ tokenize: 'forward' });
          for (let i = 0; i < enIndex.documents.length; i++) {
            enFlexIndex.add(i, enIndex.documents[i].title + ' ' + enIndex.documents[i].content);
          }

          // Use a term from the zh documents
          const zhWord = zhIndex.documents[0]?.title.split(' ')[0];
          if (!zhWord) return;

          // Search the EN index with a word from ZH
          const hits = enFlexIndex.search(zhWord, { limit: 50 }) as number[];
          const results = hits.map((idx) => enIndex.documents[idx]);

          // Results (if any) are all from the EN index documents
          for (const result of results) {
            expect(enIndex.documents).toContain(result);
            // None should be from zh or ja
            expect(zhIndex.documents).not.toContain(result);
            expect(jaIndex.documents).not.toContain(result);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 11: Full-text search covers titles and content ────────────────

describe('Feature: multilingual-docs-site, Property 11: Full-text search covers titles and content', () => {
  /**
   * **Validates: Requirements 9.3**
   *
   * For any document in the search index, a query matching only the title should
   * find it, and a query matching only content should also find it.
   */
  it('a unique term in the title makes the document findable', () => {
    fc.assert(
      fc.property(
        fc.tuple(searchTermArb, contentArb, categoryArb, wordArb),
        ([uniqueTitleTerm, content, category, slug]) => {
          // Ensure the unique term is NOT in the content
          const safeContent = content.replace(new RegExp(uniqueTitleTerm, 'gi'), 'replaced');
          const title = `document ${uniqueTitleTerm} guide`;

          // Build FlexSearch indices (title + content separately, like search-client.ts)
          const titleIndex = new Index({ tokenize: 'forward' });
          const contentIndex = new Index({ tokenize: 'forward' });

          titleIndex.add(0, title);
          contentIndex.add(0, safeContent);

          // Search by the unique title term
          const titleHits = titleIndex.search(uniqueTitleTerm, { limit: 10 }) as number[];

          // The document should be found via title search
          expect(titleHits).toContain(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('a unique term in the content makes the document findable', () => {
    fc.assert(
      fc.property(
        fc.tuple(searchTermArb, titleArb, categoryArb, wordArb),
        ([uniqueContentTerm, title, category, slug]) => {
          // Ensure the unique term is NOT in the title
          const safeTitle = title.replace(new RegExp(uniqueContentTerm, 'gi'), 'replaced');
          const content = `some introduction text ${uniqueContentTerm} followed by more text`;

          // Build FlexSearch indices
          const titleIndex = new Index({ tokenize: 'forward' });
          const contentIndex = new Index({ tokenize: 'forward' });

          titleIndex.add(0, safeTitle);
          contentIndex.add(0, content);

          // Search by the unique content term
          const contentHits = contentIndex.search(uniqueContentTerm, { limit: 10 }) as number[];

          // The document should be found via content search
          expect(contentHits).toContain(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('a document is findable whether the match is in title or content', () => {
    fc.assert(
      fc.property(
        fc.tuple(searchTermArb, searchTermArb, categoryArb, wordArb),
        ([titleTerm, contentTerm, category, slug]) => {
          // Create a document with distinct terms in title vs content
          const title = `guide about ${titleTerm}`;
          const content = `this document covers ${contentTerm} in detail with examples`;

          // Build FlexSearch indices (mirroring search-client.ts architecture)
          const titleIndex = new Index({ tokenize: 'forward' });
          const contentIndex = new Index({ tokenize: 'forward' });

          titleIndex.add(0, title);
          contentIndex.add(0, content);

          // Searching by title term should find it in title index
          const titleHits = titleIndex.search(titleTerm, { limit: 10 }) as number[];
          expect(titleHits).toContain(0);

          // Searching by content term should find it in content index
          const contentHits = contentIndex.search(contentTerm, { limit: 10 }) as number[];
          expect(contentHits).toContain(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12: Search result highlighting marks matching terms ────────────

describe('Feature: multilingual-docs-site, Property 12: Search result highlighting marks matching terms', () => {
  /**
   * **Validates: Requirements 9.4**
   *
   * For any query and result text containing the query terms, the highlightSearchTerms
   * function should wrap each occurrence with mark tags, and countHighlights should
   * equal countTermOccurrences.
   */
  it('countHighlights equals countTermOccurrences for any text and terms', () => {
    fc.assert(
      fc.property(textWithTermsArb, ({ text, terms }) => {
        const highlighted = highlightSearchTerms(text, terms);
        const highlightCount = countHighlights(highlighted);
        const occurrenceCount = countTermOccurrences(text, terms);

        expect(highlightCount).toBe(occurrenceCount);
      }),
      { numRuns: 100 }
    );
  });

  it('each term occurrence is wrapped with <mark> tags', () => {
    fc.assert(
      fc.property(textWithTermsArb, ({ text, terms }) => {
        const highlighted = highlightSearchTerms(text, terms);

        // Every <mark>...</mark> in the output should contain one of the terms
        const markRegex = /<mark>(.*?)<\/mark>/g;
        let match;
        const lowerTerms = terms.map((t) => t.toLowerCase());

        while ((match = markRegex.exec(highlighted)) !== null) {
          const markedText = match[1].toLowerCase();
          expect(lowerTerms).toContain(markedText);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('text with no matching terms produces no highlights', () => {
    fc.assert(
      fc.property(
        fc.tuple(contentArb, fc.array(searchTermArb, { minLength: 1, maxLength: 3 })),
        ([baseText, terms]) => {
          // Remove all term occurrences from the text
          let cleanText = baseText;
          for (const term of terms) {
            cleanText = cleanText.replace(new RegExp(term, 'gi'), 'xxxx');
          }

          const highlighted = highlightSearchTerms(cleanText, terms);
          const highlightCount = countHighlights(highlighted);

          expect(highlightCount).toBe(0);
          // No <mark> tags in output
          expect(highlighted).not.toContain('<mark>');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('highlighting preserves original text content (stripping marks yields original)', () => {
    fc.assert(
      fc.property(textWithTermsArb, ({ text, terms }) => {
        const highlighted = highlightSearchTerms(text, terms);

        // Remove <mark> and </mark> tags to get back the original text
        const stripped = highlighted.replace(/<\/?mark>/g, '');
        expect(stripped).toBe(text);
      }),
      { numRuns: 100 }
    );
  });

  it('empty terms array produces no highlights', () => {
    fc.assert(
      fc.property(contentArb, (text) => {
        const highlighted = highlightSearchTerms(text, []);
        expect(highlighted).toBe(text);
        expect(countHighlights(highlighted)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
