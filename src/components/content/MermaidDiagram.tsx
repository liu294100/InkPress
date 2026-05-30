'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { validateMermaidSyntax } from '@/lib/mermaid';

export interface MermaidDiagramProps {
  chart: string; // Mermaid syntax string
}

/**
 * MermaidDiagram renders a Mermaid chart client-side.
 *
 * Supports flowchart, sequence diagram, class diagram, state diagram,
 * and other Mermaid diagram types. Displays an error message for invalid
 * syntax instead of crashing.
 *
 * Validates: Requirements 7.1, 7.2, 7.3
 */
export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const uniqueId = useId();
  // Create a stable ID for mermaid (it doesn't like colons from useId)
  const diagramId = `mermaid-${uniqueId.replace(/:/g, '')}`;

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      setLoading(true);
      setError('');
      setSvg('');

      // Pre-validate syntax before loading mermaid
      const preCheck = validateMermaidSyntax(chart);
      if (!preCheck.valid) {
        setError(preCheck.error || 'Invalid Mermaid syntax');
        setLoading(false);
        return;
      }

      try {
        // Dynamically import mermaid to keep it client-side only
        const mermaid = (await import('mermaid')).default;

        // Initialize mermaid with config
        mermaid.initialize({
          startOnLoad: false,
          theme: getPreferredTheme(),
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart.trim());

        if (!cancelled) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to render Mermaid diagram';
          setError(errorMessage);
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  if (loading) {
    return (
      <div
        className="mermaid-loading flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
        role="status"
        aria-label="Loading diagram"
      >
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Rendering diagram...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mermaid-error border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-950"
        role="alert"
        aria-label="Diagram error"
      >
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Diagram rendering failed
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram overflow-x-auto p-4 flex justify-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
      role="img"
      aria-label="Mermaid diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Detects the user's preferred color scheme for mermaid theme config.
 */
function getPreferredTheme(): 'dark' | 'default' {
  if (typeof window === 'undefined') return 'default';

  // Check for dark class on html element (Tailwind dark mode)
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  // Fallback to system preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'default';
}
