/**
 * HTML Sanitization utility for removing XSS vectors from HTML content.
 *
 * This module provides a pure-function sanitizer that works in both
 * Node.js and browser environments without DOM dependencies.
 * In the browser (HtmlRenderer component), DOMPurify is used for
 * robust DOM-based sanitization. This utility serves as the shared
 * configuration and a fallback regex-based sanitizer for SSG/SSR/testing.
 */

/**
 * Allowed HTML tags that are considered safe for rendering content.
 */
export const ALLOWED_TAGS = new Set([
  // Text formatting
  'p', 'span', 'div', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Links and media
  'a', 'img',
  // Block elements
  'br', 'hr', 'blockquote', 'pre', 'code', 'figure', 'figcaption',
  // Semantic
  'article', 'section', 'aside', 'details', 'summary', 'mark', 'time', 'abbr',
]);

/**
 * Allowed HTML attributes that are considered safe.
 */
export const ALLOWED_ATTR = new Set([
  'class', 'id',
  'href', 'src', 'alt', 'title',
  'width', 'height',
  'style',
  'target', 'rel',
  'colspan', 'rowspan', 'scope',
  'datetime', 'cite',
  'lang', 'dir',
]);

/**
 * Tags that are explicitly forbidden (dangerous elements).
 */
export const FORBIDDEN_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button',
  'link', 'meta', 'base', 'applet', 'frame', 'frameset', 'style',
]);

/**
 * Event handler attribute prefixes that are always dangerous.
 */
const EVENT_HANDLER_PREFIX = 'on';

/**
 * Dangerous URI schemes.
 */
const DANGEROUS_URI_PATTERN = /^\s*(javascript|vbscript|data)\s*:/i;

/**
 * Checks if a URI is safe (not using dangerous protocols).
 */
function isSafeUri(value: string): boolean {
  return !DANGEROUS_URI_PATTERN.test(value);
}

/**
 * Checks if an attribute is an event handler.
 */
function isEventHandler(attrName: string): boolean {
  return attrName.toLowerCase().startsWith(EVENT_HANDLER_PREFIX);
}

/**
 * Sanitizes HTML content by removing dangerous elements and attributes
 * while preserving safe formatting elements.
 *
 * Uses regex-based parsing for Node.js/SSR/testing environments.
 * The HtmlRenderer component uses DOMPurify for browser-side sanitization.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let result = html;

  // Remove forbidden tags and their content (script, iframe, etc.)
  for (const tag of FORBIDDEN_TAGS) {
    // Remove tags with content (e.g., <script>...</script>)
    const contentRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    );
    result = result.replace(contentRegex, '');

    // Remove self-closing forbidden tags (e.g., <embed ... />, <embed ...>)
    const selfClosingRegex = new RegExp(
      `<${tag}\\b[^>]*\\/?>`,
      'gi'
    );
    result = result.replace(selfClosingRegex, '');
  }

  // Process remaining tags: keep allowed, strip disallowed
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    const isClosing = match.startsWith('</');

    // Remove disallowed tags entirely (strip the tag but keep inner text)
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }

    // For closing tags, no attributes to process
    if (isClosing) {
      return `</${tag}>`;
    }

    // Process attributes for allowed tags
    const cleanAttrs = sanitizeAttributes(attrs, tag);
    const isSelfClosing = match.endsWith('/>') || ['br', 'hr', 'img', 'col'].includes(tag);

    if (cleanAttrs) {
      return `<${tag} ${cleanAttrs}${isSelfClosing && !match.endsWith('>') ? ' /' : ''}>`;
    }
    return `<${tag}>`;
  });

  return result;
}

/**
 * Sanitizes attributes string, keeping only allowed and safe attributes.
 */
function sanitizeAttributes(attrsStr: string, tagName: string): string {
  if (!attrsStr.trim()) return '';

  const attrs: string[] = [];
  // Match attributes: name="value", name='value', name=value, or just name
  const attrRegex = /([a-zA-Z][a-zA-Z0-9\-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

    // Skip event handlers
    if (isEventHandler(attrName)) {
      continue;
    }

    // Skip disallowed attributes
    if (!ALLOWED_ATTR.has(attrName)) {
      continue;
    }

    // For href and src, check for dangerous URIs
    if ((attrName === 'href' || attrName === 'src') && !isSafeUri(attrValue)) {
      continue;
    }

    // Add safe attribute
    if (attrValue !== undefined && attrValue !== '') {
      attrs.push(`${attrName}="${attrValue}"`);
    } else {
      attrs.push(attrName);
    }
  }

  return attrs.join(' ');
}
