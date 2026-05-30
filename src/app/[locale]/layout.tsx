import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const { supportedLocales, defaultLocale } = siteConfig;

/** Locale-specific descriptions for SEO metadata. */
const localeDescriptions: Record<string, string> = {
  zh: '多语言文档知识库 - 涵盖编程、AI、投资理财、历史等领域',
  en: 'Multilingual Documentation Knowledge Base - Programming, AI, Finance, History and more',
  ja: '多言語ドキュメントナレッジベース - プログラミング、AI、金融、歴史など',
  ko: '다국어 문서 지식 기반 - 프로그래밍, AI, 금융, 역사 등',
  fr: 'Base de connaissances documentaire multilingue - Programmation, IA, Finance, Histoire et plus',
  de: 'Mehrsprachige Dokumentations-Wissensbasis - Programmierung, KI, Finanzen, Geschichte und mehr',
  es: 'Base de conocimiento documental multilingüe - Programación, IA, Finanzas, Historia y más',
  ms: 'Pangkalan Pengetahuan Dokumentasi Berbilang Bahasa - Pengaturcaraan, AI, Kewangan, Sejarah dan lagi',
  th: 'ฐานความรู้เอกสารหลายภาษา - การเขียนโปรแกรม, AI, การเงิน, ประวัติศาสตร์ และอื่นๆ',
};

/** Locale-specific titles. */
const localeTitles: Record<string, string> = {
  zh: 'InkPress - 多语言文档知识库',
  en: 'InkPress - Multilingual Documentation Knowledge Base',
  ja: 'InkPress - 多言語ドキュメントナレッジベース',
  ko: 'InkPress - 다국어 문서 지식 기반',
  fr: 'InkPress - Base de connaissances multilingue',
  de: 'InkPress - Mehrsprachige Wissensbasis',
  es: 'InkPress - Base de conocimiento multilingüe',
  ms: 'InkPress - Pangkalan Pengetahuan Berbilang Bahasa',
  th: 'InkPress - ฐานความรู้เอกสารหลายภาษา',
};

/**
 * Generate static params for all supported locales (SSG).
 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/**
 * Generate locale-specific metadata for SEO.
 */
export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = params.locale;
  const title = localeTitles[locale] || localeTitles[defaultLocale];
  const description = localeDescriptions[locale] || localeDescriptions[defaultLocale];

  return {
    title,
    description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((loc) => [loc, `/${loc}`])
      ),
    },
    openGraph: {
      title,
      description,
      locale,
      type: 'website',
      siteName: siteConfig.name,
    },
  };
}

/**
 * Build social links array from site config for the Footer.
 */
function getSocialLinks() {
  const platforms = ['facebook', 'youtube', 'x', 'instagram', 'threads', 'wechat'] as const;
  return platforms.map((platform) => ({
    platform,
    url: siteConfig.social[platform] || undefined,
    icon: platform,
  }));
}

/**
 * Locale layout shell.
 * Validates the locale param and wraps content with Header and Footer.
 */
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale — return 404 if invalid (allows static routes like /privacy-policy to be served)
  if (!supportedLocales.includes(params.locale)) {
    notFound();
  }

  const socialLinks = getSocialLinks();
  const currentYear = new Date().getFullYear();

  return (
    <div data-locale={params.locale} className="flex flex-col min-h-screen">
      {/* Header with glassmorphism navigation */}
      <Header
        locale={params.locale}
        supportedLocales={supportedLocales}
        showSearch={true}
        isImmersiveMode={false}
      />

      {/* Main content area with subtle gradient background */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--color-bg-secondary))/0.3] to-transparent pointer-events-none h-64" aria-hidden="true" />
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer
        socialLinks={socialLinks}
        year={currentYear}
        siteName={siteConfig.name}
      />
    </div>
  );
}
