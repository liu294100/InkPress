'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { renderMath } from '@/lib/math';

export interface MathBlockProps {
  math: string;     // LaTeX math expression
  display: boolean; // true = block ($$...$$), false = inline ($...$)
}

/**
 * MathBlock renders LaTeX math expressions using KaTeX.
 * Supports both inline ($...$) and block ($$...$$) display modes.
 * On parse error, displays raw LaTeX text with error styling instead of crashing.
 */
export default function MathBlock({ math, display }: MathBlockProps) {
  const { html, error } = renderMath(math, display);

  if (error) {
    return display ? (
      <div
        className="math-error-block bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 my-4 font-mono text-sm text-red-700 dark:text-red-300"
        role="alert"
        aria-label="Math rendering error"
      >
        <span className="block text-xs text-red-500 dark:text-red-400 mb-1">
          LaTeX Error
        </span>
        <code>{math}</code>
      </div>
    ) : (
      <span
        className="math-error-inline bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-1 font-mono text-sm text-red-700 dark:text-red-300"
        role="alert"
        aria-label="Math rendering error"
      >
        <code>{math}</code>
      </span>
    );
  }

  if (display) {
    return (
      <div
        className="math-block my-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
        aria-label={`Math formula: ${math}`}
        role="math"
      />
    );
  }

  return (
    <span
      className="math-inline"
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={`Math formula: ${math}`}
      role="math"
    />
  );
}
