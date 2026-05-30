import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { rehypeMermaid } from '@/components/content/plugins/rehype-mermaid';
import { rehypeDrawio } from '@/components/content/plugins/rehype-drawio';

/**
 * Escapes HTML special characters to prevent XSS in fallback rendering.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Processes markdown content through the unified/remark/rehype pipeline
 * and returns rendered HTML string.
 *
 * Pipeline: remark-parse → remark-math → remark-gfm → remark-rehype →
 *           rehype-raw → rehype-katex → rehype-highlight →
 *           rehype-mermaid → rehype-drawio → rehype-stringify
 *
 * @validates Requirements 1.1, 1.2, 1.3
 */
export function processMarkdown(content: string): string {
  try {
    const result = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeHighlight, { detect: true, ignoreMissing: true })
      .use(rehypeMermaid)
      .use(rehypeDrawio)
      .use(rehypeStringify)
      .processSync(content);

    return String(result);
  } catch {
    // If processing fails, return the raw content as escaped HTML
    // This satisfies Requirement 1.3: render valid portions, display raw text for unparsable sections
    return `<pre class="markdown-error"><code>${escapeHtml(content)}</code></pre>`;
  }
}
