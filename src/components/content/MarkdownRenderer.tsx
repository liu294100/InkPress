'use client';

import { useEffect, useMemo } from 'react';
import { buildHeadingTree } from '@/lib/headings';
import { Heading } from '@/lib/types';
import { processMarkdown } from '@/lib/markdown';

export interface MarkdownRendererProps {
  content: string;
  onHeadingsExtracted?: (headings: Heading[]) => void;
}

/**
 * MarkdownRenderer component.
 *
 * Takes raw markdown content, processes it through the unified/remark/rehype pipeline,
 * renders the result as HTML, and extracts headings for TOC navigation.
 *
 * Supports:
 * - Standard Markdown: headings, lists, links, images, code blocks, tables, blockquotes
 * - GFM extensions: tables, strikethrough, task lists, autolinks
 * - Math: inline ($...$) and block ($$...$$) LaTeX via KaTeX
 * - Syntax highlighting for code blocks
 * - Mermaid diagram code blocks (rendered as marker divs for MermaidDiagram component)
 * - DrawIO XML code blocks (rendered as marker divs for DrawIODiagram component)
 *
 * @validates Requirements 1.1, 1.2, 1.3
 */
export function MarkdownRenderer({ content, onHeadingsExtracted }: MarkdownRendererProps) {
  const html = useMemo(() => processMarkdown(content), [content]);

  useEffect(() => {
    if (onHeadingsExtracted) {
      const headings = buildHeadingTree(content);
      onHeadingsExtracted(headings);
    }
  }, [content, onHeadingsExtracted]);

  return (
    <article
      className="markdown-content prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
