'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site.config';

/**
 * Display names for each supported locale in their native language.
 */
const localeDisplayNames: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ms: 'Bahasa Melayu',
  th: 'ไทย',
};

interface LanguageSwitcherProps {
  /** The currently active locale */
  currentLocale: string;
}

/**
 * Language Switcher component.
 * Displays a dropdown menu with all 9 supported locales.
 * On selection, navigates to the same page in the chosen locale.
 *
 * Validates: Requirements 4.3
 */
export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Navigate to the same page path under a different locale.
   * Strips the current locale prefix from the pathname and replaces with the new locale.
   */
  function handleLocaleChange(newLocale: string) {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Strip the current locale prefix from pathname to get the sub-path
    // e.g., "/zh/programming/intro" -> "/programming/intro"
    const localePrefix = `/${currentLocale}`;
    let subPath = pathname;
    if (pathname.startsWith(localePrefix)) {
      subPath = pathname.slice(localePrefix.length) || '/';
    }

    // Build new path with the target locale
    const newPath = subPath === '/' ? `/${newLocale}` : `/${newLocale}${subPath}`;
    setIsOpen(false);
    router.push(newPath);
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className="
          inline-flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm font-medium
          bg-[var(--glass-bg)] border border-[var(--glass-border)]
          backdrop-blur-[var(--glass-blur)]
          text-[rgb(var(--color-text-primary))]
          hover:bg-[rgb(var(--color-bg-tertiary))]
          transition-all duration-[var(--transition-normal)]
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-[rgb(var(--color-accent))]
        "
      >
        {/* Globe icon */}
        <svg
          className="w-4 h-4 text-[rgb(var(--color-text-secondary))]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        <span>{localeDisplayNames[currentLocale] || currentLocale}</span>
        {/* Chevron icon with rotation on open */}
        <svg
          className={`w-3 h-3 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown menu with smooth transition */}
      <ul
        role="listbox"
        aria-label="Available languages"
        aria-activedescendant={isOpen ? `lang-option-${currentLocale}` : undefined}
        className={`
          md:absolute md:right-0 md:w-48 md:shadow-lg md:origin-top-right
          relative w-full
          z-50 mt-2
          rounded-xl overflow-hidden
          bg-[var(--glass-bg)] border border-[var(--glass-border)]
          backdrop-blur-[var(--glass-blur)]
          transition-all duration-200 ease-in-out
          ${isOpen
            ? 'opacity-100 scale-100 pointer-events-auto max-h-[30rem]'
            : 'opacity-0 scale-95 pointer-events-none max-h-0 border-transparent'
          }
        `}
      >
        {siteConfig.supportedLocales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <li
              key={locale}
              id={`lang-option-${locale}`}
              role="option"
              aria-selected={isActive}
              onClick={() => handleLocaleChange(locale)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLocaleChange(locale);
                }
              }}
              tabIndex={isOpen ? 0 : -1}
              className={`
                flex items-center justify-between px-4 py-2.5
                text-sm cursor-pointer
                transition-colors duration-[var(--transition-fast)]
                ${
                  isActive
                    ? 'bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] font-medium'
                    : 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]'
                }
              `}
            >
              <span>{localeDisplayNames[locale] || locale}</span>
              {isActive && (
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
