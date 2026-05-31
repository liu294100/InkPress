'use client';

import { useEffect, useState } from 'react';
import { sanitizeHtml, ALLOWED_TAGS, ALLOWED_ATTR, FORBIDDEN_TAGS } from '@/lib/sanitize';

interface HtmlRendererProps {
  html: string; // Raw HTML content to sanitize and render
}

/**
 * HtmlRenderer sanitizes and renders raw HTML content safely.
 *
 * On the client side, it uses DOMPurify for robust DOM-based sanitization.
 * Falls back to the regex-based sanitizer from sanitize.ts as initial value.
 *
 * Removes XSS vectors: script tags, event handlers, javascript: URLs,
 * iframes, etc. while preserving legitimate formatting elements like
 * headings, lists, tables, links, and images.
 */
export function HtmlRenderer({ html }: HtmlRendererProps) {
  // Use regex sanitizer for initial render (SSR-safe)
  const [cleanHtml, setCleanHtml] = useState(() => sanitizeHtml(html));

  useEffect(() => {
    // On the client, upgrade to DOMPurify for more robust sanitization
    let cancelled = false;

    async function sanitizeWithDomPurify() {
      try {
        const DOMPurify = (await import('dompurify')).default;

        if (cancelled) return;

        const result = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: Array.from(ALLOWED_TAGS),
          ALLOWED_ATTR: Array.from(ALLOWED_ATTR),
          FORBID_TAGS: Array.from(FORBIDDEN_TAGS),
          FORBID_ATTR: [
            'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
            'onmousemove', 'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup',
            'onload', 'onerror', 'onabort', 'onblur', 'onchange', 'onfocus',
            'onreset', 'onresize', 'onscroll', 'onselect', 'onsubmit', 'onunload',
          ],
          ALLOW_UNKNOWN_PROTOCOLS: false,
          ALLOW_DATA_ATTR: false,
        });

        if (!cancelled) {
          setCleanHtml(result);
        }
      } catch {
        // DOMPurify not available, keep regex sanitized version
      }
    }

    sanitizeWithDomPurify();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      className="html-content prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

export default HtmlRenderer;
