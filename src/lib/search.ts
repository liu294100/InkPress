/**
 * Search index builder and query utilities.
 * Generates per-locale JSON search indices at build time
 * and provides client-side search functionality.
 */

import fs from 'fs';
import path from 'path';
import { SearchIndex, SearchDocument } from './types';
import { getAllDocuments } from './content';

/** Maximum excerpt length in characters */
const EXCERPT_LENGTH = 200;

/** Output directory for search index files */
const SEARCH_INDEX_DIR = path.join(process.cwd(), 'public', 'search-index');

/**
 * Strips Markdown and HTML markup from content to produce plain text.
 * Used for indexing document content in the search index.
 */
export function stripMarkup(content: string): string {
  let text = content;

  // Remove code blocks (fenced)
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  text = text.replace(/`[^`]*`/g, '');

  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // Remove links but keep link text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove markdown headings (# symbols)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown emphasis/bold markers
  text = text.replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2');

  // Remove strikethrough
  text = text.replace(/~~(.*?)~~/g, '$1');

  // Remove blockquote markers
  text = text.replace(/^>\s?/gm, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove list markers (unordered)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');

  // Remove list markers (ordered)
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove table formatting
  text = text.replace(/\|/g, ' ');
  text = text.replace(/^[-:|\s]+$/gm, '');

  // Remove math blocks
  text = text.replace(/\$\$[\s\S]*?\$\$/g, '');
  text = text.replace(/\$[^$]*\$/g, '');

  // Collapse multiple whitespace into single space
  text = text.replace(/\s+/g, ' ');

  return text.trim();
}

/**
 * Generates an excerpt from plain text content.
 * Returns the first N characters, breaking at word boundary if possible.
 */
export function generateExcerpt(plainText: string, maxLength: number = EXCERPT_LENGTH): string {
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Try to break at a word boundary
  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Builds a search index for a specific locale.
 * Loads all documents for the locale, strips markup, and generates
 * a JSON index containing document id, title, content, category, slug, and excerpt.
 */
export async function buildSearchIndex(locale: string): Promise<SearchIndex> {
  const documents = await getAllDocuments(locale);

  const searchDocuments: SearchDocument[] = documents.map((doc) => {
    const plainContent = stripMarkup(doc.content);
    const excerpt = generateExcerpt(plainContent);

    return {
      id: `${doc.category}/${doc.slug}`,
      title: doc.title,
      content: plainContent,
      category: doc.category,
      slug: doc.slug,
      excerpt,
    };
  });

  return {
    locale,
    documents: searchDocuments,
  };
}

/**
 * Writes a search index to a JSON file in the public directory.
 * Creates the output directory if it doesn't exist.
 */
export async function writeSearchIndex(index: SearchIndex): Promise<void> {
  if (!fs.existsSync(SEARCH_INDEX_DIR)) {
    fs.mkdirSync(SEARCH_INDEX_DIR, { recursive: true });
  }

  const outputPath = path.join(SEARCH_INDEX_DIR, `${index.locale}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Builds and writes search indices for all specified locales.
 * Convenience function for build-time index generation.
 */
export async function buildAllSearchIndices(locales: string[]): Promise<void> {
  for (const locale of locales) {
    const index = await buildSearchIndex(locale);
    await writeSearchIndex(index);
  }
}
