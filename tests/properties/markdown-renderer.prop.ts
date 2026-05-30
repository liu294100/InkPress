/**
 * Property 1: Markdown rendering preserves document structure
 * Property 2: Markdown error tolerance
 * Validates: Requirements 1.1, 1.2, 1.3
 *
 * Property 1: "For any valid Markdown document containing standard elements (headings, lists,
 * links, images, code blocks, tables, blockquotes), rendering it through the Markdown pipeline
 * SHALL produce HTML output that contains the corresponding HTML structural elements
 * (h1-h6, ul/ol/li, a, img, pre/code, table, blockquote) in the correct hierarchical order."
 *
 * Property 2: "For any Markdown document containing a mix of valid and invalid syntax sections,
 * the renderer SHALL produce output where all valid sections are rendered as formatted HTML while
 * invalid/unparsable sections appear as raw text, and the renderer SHALL NOT throw or crash."
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { processMarkdown } from '@/lib/markdown';

// --- Arbitraries for Markdown elements ---

/** Generate a heading level 1-6 */
const headingLevelArb = fc.integer({ min: 1, max: 6 });

/** Generate safe text content (no markdown special chars that would break structure) */
const safeTextArb = fc.stringOf(
  fc.constantFrom(
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ',
  ),
  { minLength: 1, maxLength: 30 }
).filter(s => s.trim().length > 0);

/** Generate a markdown heading */
const headingArb = fc.tuple(headingLevelArb, safeTextArb).map(
  ([level, text]) => `${'#'.repeat(level)} ${text.trim()}`
);

/** Generate an unordered list with 1-4 items */
const unorderedListArb = fc.array(safeTextArb, { minLength: 1, maxLength: 4 }).map(
  (items) => items.map(item => `- ${item.trim()}`).join('\n')
);

/** Generate an ordered list with 1-4 items */
const orderedListArb = fc.array(safeTextArb, { minLength: 1, maxLength: 4 }).map(
  (items) => items.map((item, i) => `${i + 1}. ${item.trim()}`).join('\n')
);

/** Generate a markdown link */
const linkArb = fc.tuple(safeTextArb, safeTextArb).map(
  ([text, url]) => `[${text.trim()}](https://${url.trim().replace(/\s/g, '')}.com)`
);

/** Generate a markdown image */
const imageArb = fc.tuple(safeTextArb, safeTextArb).map(
  ([alt, url]) => `![${alt.trim()}](https://${url.trim().replace(/\s/g, '')}.com/img.png)`
);

/** Generate a code block */
const codeBlockArb = fc.tuple(
  fc.constantFrom('js', 'python', 'typescript', 'rust', 'go', 'java'),
  safeTextArb
).map(
  ([lang, code]) => '```' + lang + '\n' + code.trim() + '\n```'
);

/** Generate a blockquote */
const blockquoteArb = safeTextArb.map(text => `> ${text.trim()}`);

/** Generate a simple table */
const tableArb = fc.tuple(safeTextArb, safeTextArb, safeTextArb, safeTextArb).map(
  ([h1, h2, c1, c2]) => [
    `| ${h1.trim() || 'H1'} | ${h2.trim() || 'H2'} |`,
    '| --- | --- |',
    `| ${c1.trim() || 'C1'} | ${c2.trim() || 'C2'} |`,
  ].join('\n')
);

/** Arbitrary string (for error tolerance testing) */
const arbitraryStringArb = fc.string({ minLength: 0, maxLength: 500 });

/** Generate a document with a specific markdown element for targeted testing */
const markdownWithHeadingArb = fc.tuple(headingLevelArb, safeTextArb).map(
  ([level, text]) => ({
    markdown: `${'#'.repeat(level)} ${text.trim()}\n\nSome paragraph text.`,
    expectedTag: `h${level}`,
  })
);

const markdownWithUnorderedListArb = unorderedListArb.map(list => ({
  markdown: `# Title\n\n${list}\n`,
  expectedTags: ['ul', 'li'],
}));

const markdownWithOrderedListArb = orderedListArb.map(list => ({
  markdown: `# Title\n\n${list}\n`,
  expectedTags: ['ol', 'li'],
}));

const markdownWithLinkArb = linkArb.map(link => ({
  markdown: `# Title\n\n${link}\n`,
  expectedTag: 'a',
}));

const markdownWithImageArb = imageArb.map(img => ({
  markdown: `# Title\n\n${img}\n`,
  expectedTag: 'img',
}));

const markdownWithCodeBlockArb = codeBlockArb.map(code => ({
  markdown: `# Title\n\n${code}\n`,
  expectedTags: ['pre', 'code'],
}));

const markdownWithTableArb = tableArb.map(table => ({
  markdown: `# Title\n\n${table}\n`,
  expectedTag: 'table',
}));

const markdownWithBlockquoteArb = blockquoteArb.map(bq => ({
  markdown: `# Title\n\n${bq}\n`,
  expectedTag: 'blockquote',
}));

/** Generate a mixed document with valid markdown sections interspersed with garbage */
const mixedDocumentArb = fc.tuple(
  headingArb,
  fc.string({ minLength: 5, maxLength: 50 }),
  unorderedListArb,
  fc.string({ minLength: 5, maxLength: 50 }),
  blockquoteArb
).map(([heading, garbage1, list, garbage2, blockquote]) => ({
  markdown: `${heading}\n\n${garbage1}\n\n${list}\n\n${garbage2}\n\n${blockquote}\n`,
  validParts: { hasHeading: true, hasList: true, hasBlockquote: true },
}));

// --- Property Tests ---

describe('Feature: multilingual-docs-site, Property 1: Markdown rendering preserves document structure', () => {
  it('headings render to corresponding h1-h6 tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown heading (levels 1-6), the renderer SHALL produce
     * HTML output containing the corresponding heading tag.
     */
    fc.assert(
      fc.property(markdownWithHeadingArb, ({ markdown, expectedTag }) => {
        const html = processMarkdown(markdown);
        expect(html).toContain(`<${expectedTag}`);
      }),
      { numRuns: 100 }
    );
  });

  it('unordered lists render to ul/li tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid unordered list in Markdown, the renderer SHALL produce
     * HTML output containing ul and li elements.
     */
    fc.assert(
      fc.property(markdownWithUnorderedListArb, ({ markdown, expectedTags }) => {
        const html = processMarkdown(markdown);
        for (const tag of expectedTags) {
          expect(html).toContain(`<${tag}`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('ordered lists render to ol/li tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid ordered list in Markdown, the renderer SHALL produce
     * HTML output containing ol and li elements.
     */
    fc.assert(
      fc.property(markdownWithOrderedListArb, ({ markdown, expectedTags }) => {
        const html = processMarkdown(markdown);
        for (const tag of expectedTags) {
          expect(html).toContain(`<${tag}`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('links render to anchor tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown link, the renderer SHALL produce HTML output
     * containing an anchor (a) element.
     */
    fc.assert(
      fc.property(markdownWithLinkArb, ({ markdown, expectedTag }) => {
        const html = processMarkdown(markdown);
        expect(html).toContain(`<${expectedTag}`);
      }),
      { numRuns: 100 }
    );
  });

  it('images render to img tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown image, the renderer SHALL produce HTML output
     * containing an img element.
     */
    fc.assert(
      fc.property(markdownWithImageArb, ({ markdown, expectedTag }) => {
        const html = processMarkdown(markdown);
        expect(html).toContain(`<${expectedTag}`);
      }),
      { numRuns: 100 }
    );
  });

  it('code blocks render to pre/code tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown code block, the renderer SHALL produce HTML output
     * containing pre and code elements.
     */
    fc.assert(
      fc.property(markdownWithCodeBlockArb, ({ markdown, expectedTags }) => {
        const html = processMarkdown(markdown);
        for (const tag of expectedTags) {
          expect(html).toContain(`<${tag}`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('tables render to table tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown table, the renderer SHALL produce HTML output
     * containing a table element.
     */
    fc.assert(
      fc.property(markdownWithTableArb, ({ markdown, expectedTag }) => {
        const html = processMarkdown(markdown);
        expect(html).toContain(`<${expectedTag}`);
      }),
      { numRuns: 100 }
    );
  });

  it('blockquotes render to blockquote tags', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any valid Markdown blockquote, the renderer SHALL produce HTML output
     * containing a blockquote element.
     */
    fc.assert(
      fc.property(markdownWithBlockquoteArb, ({ markdown, expectedTag }) => {
        const html = processMarkdown(markdown);
        expect(html).toContain(`<${expectedTag}`);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: multilingual-docs-site, Property 2: Markdown error tolerance', () => {
  it('renderer never throws for any arbitrary string input', () => {
    /**
     * **Validates: Requirements 1.3**
     *
     * For any arbitrary string input (valid, invalid, or random), the renderer
     * SHALL NOT throw or crash; it SHALL always return a string result.
     */
    fc.assert(
      fc.property(arbitraryStringArb, (input) => {
        let result: string;
        expect(() => {
          result = processMarkdown(input);
        }).not.toThrow();
        expect(typeof result!).toBe('string');
        expect(result!.length).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 200 }
    );
  });

  it('valid sections in mixed documents are rendered as formatted HTML', () => {
    /**
     * **Validates: Requirements 1.3**
     *
     * For any document containing valid Markdown sections mixed with invalid/arbitrary
     * content, the renderer SHALL produce output where the valid sections are rendered
     * as formatted HTML elements.
     */
    fc.assert(
      fc.property(mixedDocumentArb, ({ markdown, validParts }) => {
        const html = processMarkdown(markdown);
        // The valid parts should be rendered as HTML elements
        if (validParts.hasHeading) {
          // Headings should produce h1-h6 tags
          expect(html).toMatch(/<h[1-6]/);
        }
        if (validParts.hasList) {
          // Lists should produce ul/li tags
          expect(html).toContain('<ul');
          expect(html).toContain('<li');
        }
        if (validParts.hasBlockquote) {
          // Blockquotes should produce blockquote tags
          expect(html).toContain('<blockquote');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('renderer returns non-empty output for non-empty input', () => {
    /**
     * **Validates: Requirements 1.3**
     *
     * For any non-empty input, the renderer SHALL produce non-empty output,
     * ensuring content is never silently discarded.
     */
    const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 300 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(nonEmptyStringArb, (input) => {
        const html = processMarkdown(input);
        expect(html.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('renderer handles documents with deeply nested or malformed syntax without crashing', () => {
    /**
     * **Validates: Requirements 1.3**
     *
     * For any combination of deeply nested markdown constructs or malformed syntax
     * (unclosed brackets, unbalanced backticks, nested blockquotes), the renderer
     * SHALL NOT throw or crash.
     */
    const malformedMarkdownArb = fc.oneof(
      // Unclosed brackets
      fc.nat({ max: 10 }).map(n => '['.repeat(n) + 'text' + ']'.repeat(Math.max(0, n - 2))),
      // Unbalanced backticks
      fc.nat({ max: 10 }).map(n => '`'.repeat(n) + 'code' + '`'.repeat(Math.max(0, n - 1))),
      // Deeply nested blockquotes
      fc.nat({ max: 8 }).map(n => '> '.repeat(n) + 'nested quote'),
      // Mixed unbalanced markers
      fc.stringOf(fc.constantFrom('#', '*', '_', '~', '`', '>', '-', '|', '[', ']', '(', ')'), { minLength: 1, maxLength: 50 }),
      // Incomplete tables
      fc.constant('| col1 | col2\n|---\n| data'),
      // Incomplete code blocks
      fc.constant('```javascript\nconst x = 1;\n'),
      // Mixed valid and invalid
      fc.constant('# Valid Heading\n\n[broken link(no close\n\n> valid quote\n\n```no close'),
    );

    fc.assert(
      fc.property(malformedMarkdownArb, (markdown) => {
        expect(() => processMarkdown(markdown)).not.toThrow();
        const html = processMarkdown(markdown);
        expect(typeof html).toBe('string');
      }),
      { numRuns: 100 }
    );
  });
});
