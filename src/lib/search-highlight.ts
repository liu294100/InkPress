/**
 * Search highlight utility.
 * Wraps matching search terms with <mark> tags for display in search results.
 */

/**
 * Escapes special regex characters in a string to allow safe use in a RegExp constructor.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights all occurrences of the given search terms in the text
 * by wrapping them with <mark> tags.
 *
 * - Matching is case-insensitive.
 * - Each occurrence of each term is wrapped individually.
 * - The number of <mark> segments in the output equals the total number
 *   of term occurrences found in the text.
 * - If terms overlap in the text, longer terms take priority.
 *
 * @param text - The source text to highlight within.
 * @param terms - An array of search terms to highlight.
 * @returns The text with matching terms wrapped in <mark>...</mark> tags.
 */
export function highlightSearchTerms(text: string, terms: string[]): string {
  if (!text || terms.length === 0) {
    return text;
  }

  // Filter out empty terms and deduplicate
  const validTerms = terms.filter((t) => t.trim().length > 0);
  if (validTerms.length === 0) {
    return text;
  }

  // Sort terms by length descending so longer matches take priority
  const sortedTerms = [...validTerms].sort((a, b) => b.length - a.length);

  // Build a single regex that matches any of the terms (case-insensitive)
  const pattern = sortedTerms.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  // Replace each match with a <mark> wrapper
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Counts the number of highlighted segments in a highlighted string.
 * Useful for verifying highlight correctness.
 */
export function countHighlights(highlightedText: string): number {
  const matches = highlightedText.match(/<mark>/g);
  return matches ? matches.length : 0;
}

/**
 * Counts the total number of occurrences of the given terms in the text.
 * Uses case-insensitive matching consistent with highlightSearchTerms.
 */
export function countTermOccurrences(text: string, terms: string[]): number {
  if (!text || terms.length === 0) {
    return 0;
  }

  const validTerms = terms.filter((t) => t.trim().length > 0);
  if (validTerms.length === 0) {
    return 0;
  }

  // Sort terms by length descending (same as highlight logic)
  const sortedTerms = [...validTerms].sort((a, b) => b.length - a.length);

  const pattern = sortedTerms.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
