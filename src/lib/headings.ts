/**
 * Heading tree extraction utilities.
 * This module is safe to use in both server and client components
 * (no Node.js fs/path dependencies).
 */

import { Heading } from './types';

/**
 * Generates a URL-friendly slug from heading text.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 * Ensures uniqueness by appending a numeric suffix if a duplicate is found.
 */
function generateHeadingId(text: string, existingIds: Set<string>): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    slug = 'heading';
  }

  let uniqueSlug = slug;
  let counter = 1;
  while (existingIds.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  existingIds.add(uniqueSlug);
  return uniqueSlug;
}

/**
 * Parses headings from markdown (# syntax) and HTML (<h1>-<h6> tags) content.
 * Returns a flat list of { text, level } objects in document order.
 */
function extractRawHeadings(content: string): { text: string; level: number }[] {
  const headings: { text: string; level: number }[] = [];

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match markdown headings: # to ######
    const mdMatch = trimmed.match(/^(#{1,6})\s+(.+?)(?:\s*#*\s*)?$/);
    if (mdMatch) {
      const level = mdMatch[1].length;
      const text = mdMatch[2].trim();
      if (text) {
        headings.push({ text, level });
      }
      continue;
    }

    // Match HTML headings: <h1>...</h1> through <h6>...</h6>
    const htmlRegex = /<h([1-6])(?:\s[^>]*)?>(.+?)<\/h\1>/gi;
    let htmlMatch: RegExpExecArray | null;
    while ((htmlMatch = htmlRegex.exec(trimmed)) !== null) {
      const level = parseInt(htmlMatch[1], 10);
      const text = htmlMatch[2].replace(/<[^>]+>/g, '').trim();
      if (text) {
        headings.push({ text, level });
      }
    }
  }

  return headings;
}

/**
 * Builds a hierarchical heading tree from document content.
 * Parses h1-h6 headings from markdown (# syntax) and HTML (<h1>-<h6> tags) content,
 * then constructs a tree structure where each heading's children have a strictly deeper level.
 *
 * @param content - Raw document content (markdown or HTML)
 * @returns Array of top-level Heading nodes with nested children
 */
export function buildHeadingTree(content: string): Heading[] {
  if (!content || !content.trim()) {
    return [];
  }

  const rawHeadings = extractRawHeadings(content);
  if (rawHeadings.length === 0) {
    return [];
  }

  const existingIds = new Set<string>();
  const tree: Heading[] = [];

  const stack: Heading[] = [];

  for (const raw of rawHeadings) {
    const heading: Heading = {
      id: generateHeadingId(raw.text, existingIds),
      text: raw.text,
      level: raw.level,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      tree.push(heading);
    } else {
      stack[stack.length - 1].children.push(heading);
    }

    stack.push(heading);
  }

  return tree;
}
