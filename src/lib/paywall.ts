/**
 * Paywall gating logic - pure functions for determining content access.
 *
 * Validates: Requirements 20.1, 20.2, 20.3, 20.4
 *
 * Rules:
 * - When global paywall is disabled, always show full content regardless of document flags.
 * - When global paywall is enabled AND document has paywallEnabled: true, show preview only.
 * - paywallEnabled defaults to false when absent from frontmatter.
 */

import type { Document, DocumentFrontmatter } from './types';

export interface ContentAccessResult {
  /** Whether the user has full access to the content */
  fullAccess: boolean;
  /** The content to display (full or preview) */
  content: string;
  /** Whether the paywall prompt should be shown */
  showPaywallPrompt: boolean;
}

/**
 * Default number of characters to show as preview when content is paywalled.
 */
const DEFAULT_PREVIEW_LENGTH = 500;

/**
 * Determines whether a document's paywall flag is enabled.
 * Defaults to false when the flag is absent from frontmatter.
 */
export function isDocumentPaywalled(frontmatter: DocumentFrontmatter): boolean {
  return frontmatter.paywallEnabled === true;
}

/**
 * Generates a content preview by truncating at a word boundary.
 * Returns the first `maxLength` characters, trimmed to the last complete word.
 */
export function generatePreview(content: string, maxLength: number = DEFAULT_PREVIEW_LENGTH): string {
  if (content.length <= maxLength) {
    return content;
  }

  const truncated = content.slice(0, maxLength);
  // Try to break at the last space to avoid cutting mid-word
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + '...';
  }
  return truncated + '...';
}

/**
 * Determines content access for a document based on global paywall setting
 * and document-level paywall flag.
 *
 * @param document - The document to check access for
 * @param globalPaywallEnabled - Whether the global paywall feature is enabled
 * @param previewLength - Optional custom preview length (defaults to 500 chars)
 * @returns ContentAccessResult with fullAccess flag, content to display, and whether to show paywall prompt
 */
export function getContentAccess(
  document: Document,
  globalPaywallEnabled: boolean,
  previewLength: number = DEFAULT_PREVIEW_LENGTH
): ContentAccessResult {
  // When global paywall is disabled, always show full content (Requirement 20.2)
  if (!globalPaywallEnabled) {
    return {
      fullAccess: true,
      content: document.content,
      showPaywallPrompt: false,
    };
  }

  // When global paywall is enabled, check document-level flag (Requirement 20.4)
  // paywallEnabled defaults to false when absent (Requirement 20.1)
  const documentPaywalled = isDocumentPaywalled(document.frontmatter);

  if (!documentPaywalled) {
    return {
      fullAccess: true,
      content: document.content,
      showPaywallPrompt: false,
    };
  }

  // Document is paywalled: show preview with paywall prompt (Requirement 20.4)
  return {
    fullAccess: false,
    content: generatePreview(document.content, previewLength),
    showPaywallPrompt: true,
  };
}
