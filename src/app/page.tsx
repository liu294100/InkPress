'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];
const DEFAULT_LOCALE = 'zh';

/**
 * Root page - detects browser language and redirects to the matching locale.
 * Falls back to default locale (zh) if no match found.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Get browser language preferences
    const languages = navigator.languages || [navigator.language];

    let matched = DEFAULT_LOCALE;

    for (const lang of languages) {
      // Try exact match first (e.g., "zh", "en")
      const lower = lang.toLowerCase();
      if (SUPPORTED_LOCALES.includes(lower)) {
        matched = lower;
        break;
      }
      // Try primary subtag (e.g., "en-US" -> "en", "zh-CN" -> "zh")
      const primary = lower.split('-')[0];
      if (SUPPORTED_LOCALES.includes(primary)) {
        matched = primary;
        break;
      }
    }

    router.replace(`/${matched}`);
  }, [router]);

  // Minimal loading state while detecting language
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-[rgb(var(--color-text-tertiary))]">
        Loading...
      </div>
    </div>
  );
}
