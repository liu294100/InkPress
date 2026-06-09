'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import SearchInput from '@/components/search/SearchInput';

export interface HeaderProps {
  locale: string;
  supportedLocales: string[];
  showSearch: boolean;
  isImmersiveMode: boolean;
}

export default function Header({
  locale,
  supportedLocales,
  showSearch,
  isImmersiveMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  if (isImmersiveMode) {
    return null;
  }

  return (
    <header
      className="glass-card sticky top-0 z-50 transition-all duration-300 ease-in-out"
      style={{ borderRadius: '0 0 1rem 1rem' }}
    >
      <div className="content-container">
        <div className="flex items-center justify-between h-16">
          {/* Site Logo/Name */}
          <Link
            href={`/${locale}`}
            className="text-xl font-bold text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent))] transition-colors duration-200"
          >
            {siteConfig.name}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4" aria-label="Main navigation">
            {/* Search */}
            {showSearch && (
              <SearchInput locale={locale} placeholder="Search..." />
            )}

            {/* Language Switcher */}
            <LanguageSwitcher currentLocale={locale} />

            {/* Theme Toggle */}
            <ThemeToggle />
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`md:hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[32rem] opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          aria-label="Mobile navigation"
          aria-hidden={!mobileMenuOpen}
        >
          <div className="flex flex-col gap-2">
            {/* Mobile Search */}
            {showSearch && (
              <div className="px-2">
                <SearchInput
                  locale={locale}
                  expanded={true}
                  placeholder="Search..."
                />
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="px-2">
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* Mobile Theme Toggle */}
            <div className="px-2 flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Theme</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* Icon Components */

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
