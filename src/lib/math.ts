import katex from 'katex';

/**
 * Renders a LaTeX math expression to HTML using KaTeX.
 *
 * @param latex - The LaTeX math expression string
 * @param displayMode - true for block math ($$...$$), false for inline ($...$)
 * @returns An object with the rendered HTML string and an optional error message
 */
export function renderMath(
  latex: string,
  displayMode: boolean
): { html: string; error?: string } {
  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      strict: false,
    });
    return { html };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown KaTeX parse error';
    return { html: latex, error: errorMessage };
  }
}
