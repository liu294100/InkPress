'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { locales, localeNames, type Locale, getUserLocale, setUserLocale } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLocale(getUserLocale());
  }, [pathname]); // 当路径变化时重新检测语言

  const handleLanguageChange = (locale: Locale) => {
    setUserLocale(locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    
    // 更新URL路径
    const segments = pathname.split('/').filter(Boolean);
    // 移除当前语言前缀（如果存在）
    const pathWithoutLocale = segments[0] && locales.includes(segments[0] as Locale) 
      ? segments.slice(1) 
      : segments;
    
    const newPath = `/${locale}${pathWithoutLocale.length > 0 ? '/' + pathWithoutLocale.join('/') : ''}`;
    router.push(newPath);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors"
        aria-label={t('language')}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    locale === currentLocale
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{localeNames[locale]}</span>
                    {locale === currentLocale && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}