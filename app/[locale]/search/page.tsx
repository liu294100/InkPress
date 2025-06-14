'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import SearchBox from '@/components/SearchBox'
import { searchPosts, highlightText } from '@/lib/search'
import { useTranslations } from 'next-intl'

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

interface SearchPageProps {
  params: {
    locale: string
  }
}

export default function SearchPage({ params }: SearchPageProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchIndex, setSearchIndex] = useState<any>(null)
  const t = useTranslations('search')
  const tCommon = useTranslations('common')

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
      title: highlightText(result.title, query),
      excerpt: result.excerpt ? highlightText(result.excerpt, query) : undefined,
    }))
  }, [results, query])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h1>
          
          {/* Search Box */}
          <div className="mb-6">
            <SearchBox 
              defaultValue={query}
              placeholder={t('placeholder')}
              locale={params.locale}
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="mb-8">
          {query.trim() && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t('results')}
              </h2>
              <p className="text-gray-600">
                {loading ? (
                  tCommon('loading')
                ) : (
                  `${results.length} results for "${query}"`
                )}
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{tCommon('loading')}</span>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {t('noResults')}
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse our categories.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href={`/${params.locale}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {tCommon('home')}
                </Link>
                <Link
                  href={`/${params.locale}/posts`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse All Posts
                </Link>
              </div>
            </div>
          )}

          {!loading && highlightedResults.length > 0 && (
            <div className="space-y-6">
              {highlightedResults.map((result) => (
                <article key={result.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <time dateTime={result.date}>
                      {formatDate(result.date)}
                    </time>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{result.categoryName}</span>
                    {result.readingTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{result.readingTime} {tCommon('readingTime')}</span>
                      </>
                    )}
                    {result.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{tCommon('author')}: {result.author}</span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    <Link 
                      href={`/${params.locale}/posts/${result.slug}`}
                      className="hover:text-blue-600 transition-colors"
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                  </h3>
                  
                  {result.excerpt && (
                    <p 
                      className="text-gray-600 mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      href={`/${params.locale}/posts/${result.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      {tCommon('readMore')} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {!query.trim() && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('suggestions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Popular Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'Performance'].map((topic) => (
                    <Link
                      key={topic}
                      href={`/${params.locale}/search?q=${encodeURIComponent(topic)}`}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                <div className="space-y-2">
                  <Link
                    href={`/${params.locale}/category/tech`}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Technology
                  </Link>
                  <Link
                    href={`/${params.locale}/category/dev`}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Development
                  </Link>
                  <Link
                    href={`/${params.locale}/category/life`}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Lifestyle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}