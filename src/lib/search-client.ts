/**
 * Client-side search module using FlexSearch.
 * Loads pre-built per-locale search indices dynamically
 * and provides full-text search with CJK tokenizer support.
 */

import { Index } from 'flexsearch';
import type { SearchResult, SearchIndex, SearchDocument } from './types';

/** CJK locale codes that require character-level tokenization */
const CJK_LOCALES = new Set(['zh', 'ja', 'ko']);

/** Cache of loaded search indices per locale */
const indexCache: Map<string, { titleIndex: Index; contentIndex: Index; documents: SearchDocument[] }> = new Map();

/**
 * Determines if a locale requires CJK tokenization.
 */
function isCJKLocale(locale: string): boolean {
  return CJK_LOCALES.has(locale);
}

/**
 * Creates a FlexSearch Index configured for the given locale.
 * CJK locales use the built-in CJK encoder for character-level tokenization.
 * Other locales use forward tokenization with normalization.
 */
function createIndex(locale: string): Index {
  if (isCJKLocale(locale)) {
    return new Index({
      tokenize: 'full',
      encoder: 'CJK',
      cache: true,
      resolution: 9,
    });
  }

  return new Index({
    tokenize: 'forward',
    encoder: 'LatinBalance',
    cache: true,
    resolution: 9,
  });
}

/**
 * Fetches and parses the search index JSON for a given locale.
 * Fetches from /search-index/{locale}.json.
 */
async function fetchSearchIndex(locale: string): Promise<SearchIndex> {
  const response = await fetch(`/search-index/${locale}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load search index for locale "${locale}": ${response.status}`);
  }
  return response.json();
}

/**
 * Loads and indexes the search data for a given locale.
 * Results are cached so subsequent searches reuse the same indices.
 */
async function loadIndex(locale: string): Promise<{ titleIndex: Index; contentIndex: Index; documents: SearchDocument[] }> {
  const cached = indexCache.get(locale);
  if (cached) {
    return cached;
  }

  const searchIndex = await fetchSearchIndex(locale);
  const titleIndex = createIndex(locale);
  const contentIndex = createIndex(locale);

  for (let i = 0; i < searchIndex.documents.length; i++) {
    const doc = searchIndex.documents[i];
    titleIndex.add(i, doc.title);
    contentIndex.add(i, doc.content);
  }

  const entry = { titleIndex, contentIndex, documents: searchIndex.documents };
  indexCache.set(locale, entry);
  return entry;
}

/**
 * Searches documents for a given query and locale using FlexSearch.
 * Loads the search index dynamically on first use for the locale.
 *
 * Results are ranked by score:
 * - Title matches receive a higher base score than content-only matches.
 * - Documents matching in both title and content are ranked highest.
 *
 * @param query - The search query string
 * @param locale - The locale to scope the search to
 * @returns Array of SearchResult ordered by descending score
 */
export async function searchDocuments(query: string, locale: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const trimmedQuery = query.trim().slice(0, 200);
  const { titleIndex, contentIndex, documents } = await loadIndex(locale);

  // Search both title and content indices
  const titleHits = titleIndex.search(trimmedQuery, { limit: 50 }) as number[];
  const contentHits = contentIndex.search(trimmedQuery, { limit: 50 }) as number[];

  // Build a score map: documents matching in title get higher score
  const scoreMap = new Map<number, number>();

  // Title matches get base score of 2.0
  for (let i = 0; i < titleHits.length; i++) {
    const docIndex = titleHits[i];
    const positionBoost = 1 - (i / titleHits.length) * 0.5; // 1.0 to 0.5
    scoreMap.set(docIndex, 2.0 * positionBoost);
  }

  // Content matches get base score of 1.0
  for (let i = 0; i < contentHits.length; i++) {
    const docIndex = contentHits[i];
    const positionBoost = 1 - (i / contentHits.length) * 0.5;
    const currentScore = scoreMap.get(docIndex) || 0;
    scoreMap.set(docIndex, currentScore + 1.0 * positionBoost);
  }

  // Convert to SearchResult array
  const results: SearchResult[] = [];
  scoreMap.forEach((score, docIndex) => {
    const doc = documents[docIndex];
    if (!doc) return;

    results.push({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt,
      category: doc.category,
      slug: doc.slug,
      highlights: extractHighlights(doc.content, trimmedQuery),
      score,
    });
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Extracts text fragments from content that contain the query terms.
 * Returns highlighted snippets around matching terms.
 */
function extractHighlights(content: string, query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const highlights: string[] = [];
  const contentLower = content.toLowerCase();
  const snippetRadius = 40; // characters around match to include

  for (const term of terms) {
    let searchStart = 0;
    let found = false;

    while (searchStart < contentLower.length && highlights.length < 3) {
      const matchIndex = contentLower.indexOf(term, searchStart);
      if (matchIndex === -1) break;

      found = true;
      const start = Math.max(0, matchIndex - snippetRadius);
      const end = Math.min(content.length, matchIndex + term.length + snippetRadius);

      let snippet = '';
      if (start > 0) snippet += '...';
      snippet += content.slice(start, end);
      if (end < content.length) snippet += '...';

      highlights.push(snippet);
      searchStart = matchIndex + term.length;
    }

    if (!found && highlights.length === 0) {
      // No direct match - include beginning of content as context
      highlights.push(content.slice(0, snippetRadius * 2) + (content.length > snippetRadius * 2 ? '...' : ''));
    }
  }

  return highlights.slice(0, 3);
}

/**
 * Truncates a search query to the maximum allowed length (200 characters).
 */
export function truncateQuery(query: string): string {
  return query.slice(0, 200);
}

/**
 * Highlights matching search terms in a text string by wrapping them
 * with <mark> tags. Used by SearchResults component to highlight
 * matching keywords in titles and excerpts.
 *
 * @param text - The text to highlight terms in
 * @param query - The search query containing terms to highlight
 * @returns HTML string with matching terms wrapped in <mark> tags
 */
export function highlightTerms(text: string, query: string): string {
  if (!text || !query.trim()) return text;

  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    // Escape regex special chars in terms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) return text;

  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  return text.replace(pattern, '<mark class="search-highlight bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
}

/**
 * Clears the cached search index for a specific locale or all locales.
 * Useful when search indices are updated.
 */
export function clearSearchCache(locale?: string): void {
  if (locale) {
    indexCache.delete(locale);
  } else {
    indexCache.clear();
  }
}
