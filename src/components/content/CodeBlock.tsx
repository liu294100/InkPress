'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';

export interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ code, language, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // Clear previous highlighting
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.className = `language-${language}`;
      codeRef.current.textContent = code;
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className="code-block group relative rounded-lg border border-[rgb(var(--color-border))] overflow-hidden my-4 transition-theme">
      {/* Header bar with language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border))]">
        <span className="text-xs font-mono text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <CopyCheckIcon />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="leading-relaxed">
                  <td className="select-none text-right pr-4 pl-4 py-0 text-xs font-mono text-[rgb(var(--color-text-tertiary))] border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-secondary))] w-[1%] whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="pl-4 pr-4 py-0">
                    <pre className="m-0 p-0 bg-transparent"><code
                      ref={index === 0 ? undefined : undefined}
                      className={`language-${language}`}
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlight(line || ' ', { language, ignoreIllegals: true }).value,
                      }}
                    /></pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="m-0 p-4 bg-transparent overflow-x-auto">
            <code ref={codeRef} className={`language-${language}`}>
              {code}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopyCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
