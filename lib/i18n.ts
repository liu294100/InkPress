import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ['en', 'zh', 'ja', 'fr', 'ko'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'en';

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  fr: 'Français',
  ko: '한국어',
};

// 语言配置
export default getRequestConfig(async ({ locale }) => {
  // 验证传入的语言是否支持
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

// 获取用户首选语言
export function getUserLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale');
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }
    
    // 从浏览器语言检测
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }
  }
  
  return defaultLocale;
}

// 设置用户语言
export function setUserLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}

// 检查是否为RTL语言
export function isRTL(locale: Locale): boolean {
  // 目前支持的语言都是LTR，如果以后添加阿拉伯语等RTL语言可以在这里配置
  return false;
}