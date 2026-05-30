/**
 * SEO utilities for generating metadata compatible with Next.js App Router metadata API.
 * Generates title, description, keywords, canonical URL, Open Graph tags,
 * and hreflang alternate links for all supported locales.
 */

import { siteConfig } from '@/config/site.config';
import type { Document, SEOMetadata } from './types';

/**
 * Generate SEO metadata for a document page.
 *
 * @param document - The document to generate metadata for
 * @param locale - The current locale of the page
 * @returns SEOMetadata object with all required fields
 */
export function generateMetadata(document: Document, locale: string): SEOMetadata {
  const { url, name, supportedLocales } = siteConfig;

  // Build the canonical URL path from document properties
  const documentPath = buildDocumentPath(document, locale);
  const canonicalUrl = `${url}${documentPath}`;

  // Title: use frontmatter title, append site name for branding
  const title = `${document.frontmatter.title} | ${name}`;

  // Description: use frontmatter description or generate from content
  const description = document.frontmatter.description || generateDescription(document.content);

  // Keywords: use frontmatter keywords or empty array
  const keywords = document.frontmatter.keywords || [];

  // Open Graph type: article for documents
  const ogType = 'article';

  // Generate hreflang alternate links for all supported locales
  const hreflangAlternates = supportedLocales.map((loc) => ({
    locale: loc,
    url: `${url}${buildDocumentPath(document, loc)}`,
  }));

  return {
    title,
    description,
    keywords,
    ogType,
    canonicalUrl,
    hreflangAlternates,
  };
}

/**
 * Build the URL path for a document in a given locale.
 */
function buildDocumentPath(document: Document, locale: string): string {
  const { category, subcategory, slug } = document;

  if (subcategory) {
    return `/${locale}/${category}/${subcategory}/${slug}`;
  }

  return `/${locale}/${category}/${slug}`;
}

/**
 * Generate a description from document content by extracting the first
 * meaningful text (stripping markdown/html), capped at 160 characters.
 */
function generateDescription(content: string): string {
  // Strip markdown/html tags and get plain text
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '')       // Remove inline code
    .replace(/#{1,6}\s+/g, '')     // Remove heading markers
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // Replace links with text
    .replace(/<[^>]+>/g, '')       // Remove HTML tags
    .replace(/\*\*([^*]*)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]*)\*/g, '$1')     // Remove italic
    .replace(/~~([^~]*)~~/g, '$1')     // Remove strikethrough
    .replace(/\n+/g, ' ')         // Replace newlines with spaces
    .replace(/\s+/g, ' ')         // Collapse whitespace
    .trim();

  if (plainText.length <= 160) {
    return plainText;
  }

  // Truncate at 160 chars, ending at a word boundary
  const truncated = plainText.slice(0, 160);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 120) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}
