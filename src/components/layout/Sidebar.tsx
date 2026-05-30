'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Category, DocumentListItem } from '@/lib/types';

export interface SidebarProps {
  categories: Category[];
  currentCategory: string;
  currentLocale: string;
  documents: DocumentListItem[];
}

export default function Sidebar({
  categories,
  currentCategory,
  currentLocale,
  documents,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  // Sync selectedCategory when currentCategory prop changes
  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  // Close mobile sidebar on route change / escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close mobile menu when viewport becomes desktop
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed bottom-4 left-4 z-40 p-3 rounded-full bg-[rgb(var(--color-accent))] text-white shadow-lg hover:scale-105 transition-transform duration-200"
        onClick={toggleMobile}
        aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={mobileOpen}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <SidebarIcon />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-20 left-0 z-40 md:z-auto
          h-full md:h-[calc(100vh-5rem)]
          w-64 md:w-[var(--sidebar-width)]
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          glass-card md:rounded-xl overflow-hidden
          flex flex-col
        `}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
          <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            Navigation
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200"
            aria-label="Close sidebar"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Category navigation">
          {sortedCategories.map((category) => {
            const isActive = selectedCategory === category.id;
            const categoryName = category.name[currentLocale] || category.name['en'] || category.id;

            return (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-[rgb(var(--color-accent))/0.1] text-[rgb(var(--color-accent))]'
                      : 'hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                    }
                  `}
                  aria-current={isActive ? 'true' : undefined}
                  style={{ minHeight: '44px' }}
                >
                  {/* Category Icon/Color Indicator */}
                  <span
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                      transition-all duration-200
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                    style={{
                      backgroundColor: category.color ? `${category.color}20` : 'rgb(var(--color-bg-tertiary))',
                      color: category.color || 'rgb(var(--color-text-secondary))',
                    }}
                    aria-hidden="true"
                  >
                    <CategoryIcon icon={category.icon} />
                  </span>

                  <span className="text-sm font-medium truncate">
                    {categoryName}
                  </span>
                </button>

                {/* Document List (shown when category is selected) */}
                {isActive && documents.length > 0 && (
                  <div className="ml-11 mt-1 space-y-0.5 animate-fade-in">
                    {documents.map((doc) => (
                      <Link
                        key={doc.slug}
                        href={`/${currentLocale}/${category.id}/${doc.slug}`}
                        className="block px-3 py-1.5 rounded-md text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200 truncate"
                        style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}
                      >
                        {doc.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/* Icon Components */

function CategoryIcon({ icon }: { icon?: string }) {
  switch (icon) {
    case 'code':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'cpu':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'trending-up':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case 'file-text':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'clock':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

function SidebarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
