'use client';

import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { truncateQuery } from '@/lib/search-client';

export interface SearchInputProps {
  locale: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether to show in expanded mode (for mobile menu) */
  expanded?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Search input component accessible from every page (used in Header).
 * On submit, redirects to the search results page with a ?q= parameter.
 * Truncates queries to 200 characters max.
 */
export default function SearchInput({
  locale,
  placeholder = 'Search...',
  expanded = false,
  className = '',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(expanded);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = useCallback(() => {
    const trimmed = truncateQuery(query.trim());
    if (trimmed) {
      router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
      setQuery('');
      setIsExpanded(false);
    }
  }, [query, locale, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setQuery('');
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    },
    [handleSubmit]
  );

  const handleToggle = useCallback(() => {
    setIsExpanded(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleBlur = useCallback(() => {
    if (!query) {
      setIsExpanded(false);
    }
  }, [query]);

  // Always expanded mode (e.g., in mobile menu)
  if (expanded) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={200}
          className="w-full px-3 py-2 pl-9 rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] transition-all duration-200"
          aria-label="Search documents"
        />
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
        {query && (
          <button
            type="button"
            onClick={handleSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs rounded bg-[rgb(var(--color-accent))] text-white hover:opacity-80 transition-opacity"
            aria-label="Submit search"
          >
            Go
          </button>
        )}
      </div>
    );
  }

  // Collapsible mode (desktop header)
  return (
    <div className={`relative flex items-center ${className}`}>
      {isExpanded ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={200}
            className="w-48 lg:w-64 px-3 py-1.5 pl-9 rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] text-sm text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] transition-all duration-200"
            aria-label="Search documents"
            autoFocus
          />
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
        </div>
      ) : (
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200"
          aria-label="Open search"
        >
          <SearchIcon />
        </button>
      )}
    </div>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
