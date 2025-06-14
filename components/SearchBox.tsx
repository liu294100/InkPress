'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from '@/lib/utils'

interface SearchBoxProps {
  defaultValue?: string
  compact?: boolean
  placeholder?: string
  locale?: string
  onSearch?: (query: string) => void
}

const SearchBox = ({ 
  defaultValue = '', 
  compact = false, 
  placeholder = 'Search articles...', 
  locale = '',
  onSearch 
}: SearchBoxProps) => {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // In a real implementation, you might fetch suggestions from an API
      // For now, we'll use some mock suggestions
      const mockSuggestions = [
        'React hooks',
        'Next.js tutorial',
        'TypeScript guide',
        'JavaScript tips',
        'CSS tricks',
        'Web development',
        'Frontend frameworks',
        'Backend development',
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      
      setSuggestions(mockSuggestions)
      setShowSuggestions(mockSuggestions.length > 0)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  // Perform search
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setShowSuggestions(false)
    
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      const searchPath = locale ? `/${locale}/search` : '/search'
      router.push(`${searchPath}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    performSearch(suggestion)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Update query when defaultValue changes
  useEffect(() => {
    setQuery(defaultValue)
  }, [defaultValue])

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={`w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              compact ? 'w-64' : 'w-full'
            }`}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setShowSuggestions(false)
                inputRef.current?.focus()
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {suggestion}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBox