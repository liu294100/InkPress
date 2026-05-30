'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * ThemeToggle component - toggles between dark and light modes.
 * 
 * Features:
 * - Smooth icon transition between sun (dark mode) and moon (light mode)
 * - Persists preference in localStorage via ThemeProvider
 * - Defaults to system preference on initial load
 * - Minimum 44x44px touch target for accessibility
 * - Proper aria-label for screen readers
 * - Minimum 4.5:1 contrast ratio in both modes
 * 
 * Validates: Requirements 19.3, 19.9
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg
                 bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800
                 transition-colors duration-300 ease-in-out
                 text-secondary-700 dark:text-secondary-200
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {/* Sun icon - shown when in dark mode (click to switch to light) */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ease-in-out absolute
                    ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      {/* Moon icon - shown when in light mode (click to switch to dark) */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ease-in-out absolute
                    ${!isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}
