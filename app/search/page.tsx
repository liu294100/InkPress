'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import SearchBox from '@/components/SearchBox'
import { searchPosts, highlightText } from '@/lib/search'

interface SearchResult {
  slug: string
  title: string
  excerpt?: string
  content: string
  date: string
  category: string
  categoryName: string
  tags?: string[]
  author?: string
  readingTime?: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchIndex, setSearchIndex] = useState<any>(null)

  // Load search index
  useEffect(() => {
    const loadSearchIndex = async () => {
      try {
        const response = await fetch('/search-index.json')
        if (response.ok) {
          const index = await response.json()
          setSearchIndex(index)
        }
      } catch (error) {
        console.error('Failed to load search index:', error)
      }
    }

    loadSearchIndex()
  }, [])

  // Perform search
  useEffect(() => {
    if (!query.trim() || !searchIndex) {
      setResults([])
      return
    }

    setLoading(true)
    
    try {
      const searchResults = searchPosts(query, searchIndex)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, searchIndex])

  const highlightedResults = useMemo(() => {
    if (!query.trim()) return results
    
    return results.map(result => ({
      ...result,
      highlightedTitle: highlightText(result.title, query),
      highlightedExcerpt: result.excerpt ? highlightText(result.excerpt, query) : '',
      highlightedContent: highlightText(
        result.content.substring(0, 300) + '...', 
        query
      ),
    }))
  }, [results, query])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Search Articles
          </h1>
          <SearchBox defaultValue={query} />
        </header>

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-gray-600">Searching...</span>
          </div>
        ) : query.trim() ? (
          <div>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                {results.length === 0 ? (
                  <>No results found for <strong>"{query}"</strong></>
                ) : (
                  <>
                    Found <strong>{results.length}</strong> {results.length === 1 ? 'result' : 'results'} for <strong>"{query}"</strong>
                  </>
                )}
              </p>
            </div>

            {/* Results List */}
            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or browse our categories.
                </p>
                <div className="space-x-4">
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse Categories
                  </Link>
                  <Link
                    href="/posts"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    All Posts
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {highlightedResults.map((result) => (
                  <article
                    key={result.slug}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <Link
                        href={`/category/${result.category}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {result.categoryName}
                      </Link>
                      <span className="mx-2 text-gray-300">•</span>
                      <time className="text-sm text-gray-500">
                        {formatDate(result.date)}
                      </time>
                      {result.readingTime && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {result.readingTime} min read
                          </span>
                        </>
                      )}
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                      <Link
                        href={`/posts/${result.slug}`}
                        className="hover:text-blue-600 transition-colors duration-200"
                        dangerouslySetInnerHTML={{ 
                          __html: (result as any).highlightedTitle || result.title 
                        }}
                      />
                    </h2>
                    
                    {result.excerpt && (
                      <p 
                        className="text-gray-600 mb-4"
                        dangerouslySetInnerHTML={{ 
                          __html: (result as any).highlightedExcerpt || result.excerpt 
                        }}
                      />
                    )}
                    
                    <div 
                      className="text-gray-600 mb-4 text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: (result as any).highlightedContent || result.content.substring(0, 300) + '...' 
                      }}
                    />
                    
                    <div className="flex items-center justify-between">
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {result.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{result.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <Link
                        href={`/posts/${result.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Read more →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Search our articles
            </h3>
            <p className="text-gray-600 mb-6">
              Enter keywords to find articles across all categories and topics.
            </p>
            <div className="text-sm text-gray-500">
              <p className="mb-2">Search tips:</p>
              <ul className="list-disc list-inside space-y-1 max-w-md mx-auto">
                <li>Use specific keywords for better results</li>
                <li>Try different combinations of terms</li>
                <li>Search supports both English and Chinese</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}