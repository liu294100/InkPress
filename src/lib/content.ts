/**
 * Content loading and parsing utilities.
 * Handles reading documents from the filesystem, parsing frontmatter,
 * detecting content types, and calculating reading time.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Document, DocumentFrontmatter, Heading, Category } from './types';
import { categoriesConfig } from '../config/categories.config';

// Re-export buildHeadingTree from the client-safe headings module
export { buildHeadingTree } from './headings';

/** Root directory for content files */
const CONTENT_DIR = path.join(process.cwd(), 'content');

/** Supported file extensions and their content types */
const CONTENT_TYPE_MAP: Record<string, 'markdown' | 'html'> = {
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.html': 'html',
  '.htm': 'html',
};

/**
 * Detects content type based on file extension.
 */
export function detectContentType(filePath: string): 'markdown' | 'html' {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPE_MAP[ext] || 'markdown';
}

/**
 * Calculates estimated reading time in minutes.
 * Uses ~250 words/min for CJK content (Chinese, Japanese, Korean),
 * ~200 words/min for other languages.
 *
 * CJK characters are counted individually as "words" since they don't
 * use spaces as word separators.
 */
export function calculateReadingTime(content: string, locale: string): number {
  const cjkLocales = ['zh', 'ja', 'ko'];
  const isCJK = cjkLocales.includes(locale);

  // Strip markdown/html syntax for more accurate word count
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '')       // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // Remove link syntax
    .replace(/<[^>]+>/g, '')       // Remove HTML tags
    .replace(/[#*_~>`|-]/g, '')    // Remove markdown symbols
    .trim();

  if (!plainText) return 1;

  if (isCJK) {
    // Count CJK characters + word-separated tokens
    const cjkChars = (plainText.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
    const nonCjkWords = plainText
      .replace(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const totalWords = cjkChars + nonCjkWords;
    return Math.max(1, Math.ceil(totalWords / 250));
  } else {
    const words = plainText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }
}

/**
 * Gets the last modified date of a file.
 */
function getLastModified(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Parses a document file, extracting frontmatter and content.
 */
function parseDocumentFile(
  filePath: string,
  locale: string,
  category: string,
  slug: string
): Document {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const contentType = detectContentType(filePath);

  let frontmatter: DocumentFrontmatter;
  let content: string;

  if (contentType === 'markdown') {
    const parsed = matter(fileContent);
    frontmatter = {
      title: parsed.data.title || slug,
      description: parsed.data.description,
      keywords: parsed.data.keywords,
      author: parsed.data.author,
      date: parsed.data.date,
      paywallEnabled: parsed.data.paywallEnabled ?? false,
      draft: parsed.data.draft ?? false,
    };
    content = parsed.content;
  } else {
    // HTML files: attempt to parse frontmatter if present, otherwise use raw content
    const parsed = matter(fileContent);
    if (Object.keys(parsed.data).length > 0) {
      frontmatter = {
        title: parsed.data.title || slug,
        description: parsed.data.description,
        keywords: parsed.data.keywords,
        author: parsed.data.author,
        date: parsed.data.date,
        paywallEnabled: parsed.data.paywallEnabled ?? false,
        draft: parsed.data.draft ?? false,
      };
      content = parsed.content;
    } else {
      frontmatter = {
        title: slug,
        paywallEnabled: false,
        draft: false,
      };
      content = fileContent;
    }
  }

  const readingTime = calculateReadingTime(content, locale);
  const lastModified = getLastModified(filePath);

  return {
    slug,
    locale,
    category,
    title: frontmatter.title,
    content,
    contentType,
    frontmatter,
    headings: [], // Headings are extracted separately (task 2.3)
    readingTime,
    lastModified,
  };
}

/**
 * Resolves the full file path for a document given its slug parts.
 * Supports nested paths (subdirectories).
 */
function resolveDocumentPath(
  locale: string,
  category: string,
  slugParts: string[]
): string | null {
  const basePath = path.join(CONTENT_DIR, locale, category);

  // Build the file path from slug parts
  const slugPath = slugParts.join(path.sep);

  // Try supported extensions
  for (const ext of Object.keys(CONTENT_TYPE_MAP)) {
    const filePath = path.join(basePath, `${slugPath}${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // Try as directory with index file
  for (const ext of Object.keys(CONTENT_TYPE_MAP)) {
    const indexPath = path.join(basePath, slugPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

/**
 * Loads a single document by its locale, category, and slug path.
 */
export async function getDocumentBySlug(
  locale: string,
  category: string,
  slug: string[]
): Promise<Document | null> {
  const filePath = resolveDocumentPath(locale, category, slug);
  if (!filePath) return null;

  const slugStr = slug.join('/');
  const doc = parseDocumentFile(filePath, locale, category, slugStr);

  // Skip draft documents
  if (doc.frontmatter.draft) return null;

  return doc;
}

/**
 * Recursively collects all document files in a directory.
 */
function collectDocumentFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Recurse into subdirectories (skip hidden dirs)
      if (!entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        files.push(...collectDocumentFiles(fullPath));
      }
    } else if (entry.isFile()) {
      // Skip metadata and hidden files
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (ext in CONTENT_TYPE_MAP) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Computes the slug for a file relative to its category directory.
 */
function computeSlug(filePath: string, categoryDir: string): string {
  const relative = path.relative(categoryDir, filePath);
  const ext = path.extname(relative);
  let slug = relative.replace(ext, '').replace(/\\/g, '/');

  // Remove trailing /index for index files
  if (slug.endsWith('/index')) {
    slug = slug.slice(0, -6);
  }

  return slug;
}

/**
 * Lists all documents in a specific category for a locale.
 */
export async function getDocumentsByCategory(
  locale: string,
  category: string
): Promise<Document[]> {
  const categoryDir = path.join(CONTENT_DIR, locale, category);
  const files = collectDocumentFiles(categoryDir);

  const documents: Document[] = [];
  for (const filePath of files) {
    const slug = computeSlug(filePath, categoryDir);
    const doc = parseDocumentFile(filePath, locale, category, slug);
    if (!doc.frontmatter.draft) {
      documents.push(doc);
    }
  }

  return documents;
}

/**
 * Lists all documents across all categories for a locale.
 */
export async function getAllDocuments(locale: string): Promise<Document[]> {
  const localeDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) return [];

  const categories = getCategories();
  const allDocs: Document[] = [];

  for (const cat of categories) {
    const docs = await getDocumentsByCategory(locale, cat.id);
    allDocs.push(...docs);
  }

  return allDocs;
}

/**
 * Returns the list of categories from the configuration.
 */
export function getCategories(): Category[] {
  return categoriesConfig.categories;
}


