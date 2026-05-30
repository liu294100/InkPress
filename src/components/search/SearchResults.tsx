'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { SearchResult } from '@/lib/types';
import { highlightTerms } from '@/lib/search-client';

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  locale: string;
  isLoading?: boolean;
}

/**
 * Displays search results with highlighted matching keywords.
 * Handles empty query, no results, and loading states.
 */
export default function SearchResults({
  results,
  query,
  locale,
  isLoading = false,
}: SearchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[rgb(var(--color-text-secondary))]">
          <LoadingSpinner />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  // Empty query state
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <SearchPromptIcon />
        <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
          Enter a search term to find documents
        </p>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <NoResultsIcon />
        <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-tertiary))]">
          Try different keywords or check the spelling
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>

      {results.map((result) => (
        <SearchResultItem
          key={result.id}
          result={result}
          query={query}
          locale={locale}
        />
      ))}
    </div>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  locale: string;
}

function SearchResultItem({ result, query, locale }: SearchResultItemProps) {
  const highlightedTitle = useMemo(
    () => highlightTerms(result.title, query),
    [result.title, query]
  );

  const highlightedExcerpt = useMemo(
    () => highlightTerms(result.excerpt, query),
    [result.excerpt, query]
  );

  const highlightedFragments = useMemo(
    () => result.highlights.map((h) => highlightTerms(h, query)),
    [result.highlights, query]
  );

  return (
    <article className="p-4 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-primary))] hover:border-[rgb(var(--color-accent))] transition-colors duration-200">
      <Link
        href={`/${locale}/${result.category}/${result.slug}`}
        className="block group"
      >
        {/* Title */}
        <h3
          className="text-lg font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />

        {/* Category badge */}
        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
          {result.category}
        </span>

        {/* Excerpt */}
        <p
          className="mt-2 text-sm text-[rgb(var(--color-text-secondary))] line-clamp-2"
          dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
        />

        {/* Highlighted fragments from content */}
        {highlightedFragments.length > 0 && (
          <div className="mt-3 space-y-1">
            {highlightedFragments.map((fragment, idx) => (
              <p
                key={idx}
                className="text-xs text-[rgb(var(--color-text-tertiary))] line-clamp-1 pl-3 border-l-2 border-[rgb(var(--color-border))]"
                dangerouslySetInnerHTML={{ __html: fragment }}
              />
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}

/* Icons */

function LoadingSpinner() {
  return (
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function SearchPromptIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-[rgb(var(--color-text-tertiary))]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-[rgb(var(--color-text-tertiary))]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}
