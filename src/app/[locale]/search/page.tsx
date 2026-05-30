'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchDocuments, truncateQuery } from '@/lib/search-client';
import { SearchResult } from '@/lib/types';
import SearchResults from '@/components/search/SearchResults';
import SearchInput from '@/components/search/SearchInput';

interface SearchPageProps {
  params: { locale: string };
}

/**
 * Search results page.
 * Reads the ?q= parameter to perform a search and display results.
 * Handles empty query, no results, and long query (truncated to 200 chars) states.
 */
export default function SearchPage({ params }: SearchPageProps) {
  const { locale } = params;
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const query = truncateQuery(rawQuery.trim());

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async () => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchDocuments(query, locale);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, locale]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <div className="content-container py-8 max-w-4xl mx-auto px-4">
      {/* Page header */}
      <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6">
        Search
      </h1>

      {/* Search input for refining query */}
      <div className="mb-8">
        <SearchInput
          locale={locale}
          expanded={true}
          placeholder="Search documents..."
          className="max-w-xl"
        />
      </div>

      {/* Truncation notice */}
      {rawQuery.length > 200 && (
        <p className="mb-4 text-xs text-[rgb(var(--color-text-tertiary))]">
          Query was truncated to 200 characters.
        </p>
      )}

      {/* Search results */}
      <SearchResults
        results={results}
        query={query}
        locale={locale}
        isLoading={isLoading}
      />
    </div>
  );
}
