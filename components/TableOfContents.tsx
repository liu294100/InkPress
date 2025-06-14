'use client'

import { useState, useEffect } from 'react'
import { Heading } from '@/lib/posts'

interface TableOfContentsProps {
  headings: Heading[]
  className?: string
}

const TableOfContents = ({ headings, className = '' }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1:
        return 'ml-0'
      case 2:
        return 'ml-4'
      case 3:
        return 'ml-8'
      case 4:
        return 'ml-12'
      case 5:
        return 'ml-16'
      case 6:
        return 'ml-20'
      default:
        return 'ml-0'
    }
  }

  const getFontSizeClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-sm font-semibold'
      case 2:
        return 'text-sm font-medium'
      case 3:
        return 'text-sm'
      case 4:
        return 'text-xs'
      case 5:
        return 'text-xs'
      case 6:
        return 'text-xs'
      default:
        return 'text-sm'
    }
  }

  if (!headings || headings.length === 0) {
    return null
  }

  return (
    <div className={`toc-container ${className}`}>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <span>Table of Contents</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isVisible ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Table of Contents */}
      <div className={`toc-content ${isVisible ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Table of Contents
          </h3>
          
          <nav className="toc-nav">
            <ul className="space-y-1">
              {headings.map((heading, index) => {
                const isActive = activeId === heading.id
                
                return (
                  <li key={`${heading.id}-${index}`} className={getIndentClass(heading.level)}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-left py-1 px-2 rounded transition-all duration-200 ${
                        getFontSizeClass(heading.level)
                      } ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={heading.text}
                    >
                      <span className="line-clamp-2">{heading.text}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Floating TOC for Desktop */}
      <div className="hidden xl:block fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs max-h-96 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            On this page
          </div>
          <nav>
            <ul className="space-y-1">
              {headings.slice(0, 8).map((heading, index) => {
                const isActive = activeId === heading.id
                const indentLevel = Math.min(heading.level - 1, 3) // Limit indent levels
                
                return (
                  <li key={`floating-${heading.id}-${index}`}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-left py-1 px-2 rounded text-xs transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{ paddingLeft: `${8 + indentLevel * 8}px` }}
                      title={heading.text}
                    >
                      <span className="line-clamp-1 text-left">
                        {heading.text.length > 25 
                          ? `${heading.text.substring(0, 25)}...` 
                          : heading.text
                        }
                      </span>
                    </button>
                  </li>
                )
              })}
              {headings.length > 8 && (
                <li className="text-xs text-gray-400 px-2 py-1">
                  +{headings.length - 8} more sections
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default TableOfContents