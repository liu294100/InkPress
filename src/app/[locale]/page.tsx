import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { categoriesConfig } from '@/config/categories.config';

/**
 * Generate static params for all locales (SSG).
 */
export function generateStaticParams() {
  return siteConfig.supportedLocales.map((locale) => ({ locale }));
}

/**
 * Category icon components mapped by icon name.
 */
const categoryIcons: Record<string, JSX.Element> = {
  code: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  cpu: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  'trending-up': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  'file-text': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

/** Localized hero titles */
const heroTitles: Record<string, string> = {
  zh: '探索知识，发现智慧',
  en: 'Explore Knowledge, Discover Wisdom',
  ja: '知識を探求し、知恵を発見する',
  ko: '지식을 탐구하고, 지혜를 발견하세요',
  fr: 'Explorez le savoir, découvrez la sagesse',
  de: 'Wissen erkunden, Weisheit entdecken',
  es: 'Explora el conocimiento, descubre la sabiduría',
  ms: 'Terokai Pengetahuan, Temui Kebijaksanaan',
  th: 'สำรวจความรู้ ค้นพบปัญญา',
};

/** Localized hero subtitles */
const heroSubtitles: Record<string, string> = {
  zh: '涵盖编程、人工智能、投资理财、历史等多领域的多语言文档知识库',
  en: 'A multilingual documentation knowledge base covering programming, AI, finance, history and more',
  ja: 'プログラミング、AI、金融、歴史など幅広い分野をカバーする多言語ドキュメントナレッジベース',
  ko: '프로그래밍, AI, 금융, 역사 등 다양한 분야를 다루는 다국어 문서 지식 기반',
  fr: 'Une base de connaissances multilingue couvrant la programmation, l\'IA, la finance, l\'histoire et plus',
  de: 'Eine mehrsprachige Wissensbasis für Programmierung, KI, Finanzen, Geschichte und mehr',
  es: 'Una base de conocimiento multilingüe que cubre programación, IA, finanzas, historia y más',
  ms: 'Pangkalan pengetahuan dokumentasi berbilang bahasa meliputi pengaturcaraan, AI, kewangan, sejarah dan lagi',
  th: 'ฐานความรู้เอกสารหลายภาษา ครอบคลุมการเขียนโปรแกรม, AI, การเงิน, ประวัติศาสตร์ และอื่นๆ',
};

/**
 * Homepage displaying hero section with parallax-style effect and category cards.
 */
export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const categories = categoriesConfig.categories;
  const title = heroTitles[locale] || heroTitles['en'];
  const subtitle = heroSubtitles[locale] || heroSubtitles['en'];

  return (
    <div className="flex-1">
      {/* Hero Section with parallax-style subtle background effect */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Parallax-style gradient background layers */}
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{ transform: 'translateZ(-1px) scale(1.5)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-3xl" />
        </div>

        <div className="content-container text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance text-[rgb(var(--color-text-primary))]">
            {title}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[rgb(var(--color-text-secondary))] max-w-3xl mx-auto text-balance">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Category Sections */}
      <section className="content-container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const icon = categoryIcons[category.icon || ''] || categoryIcons['file-text'];
            const name = category.name[locale] || category.name['en'] || category.id;

            return (
              <Link
                key={category.id}
                href={`/${locale}/${category.id}`}
                className="glass-card group p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon with category accent color */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                  }}
                >
                  {icon}
                </div>

                {/* Category name */}
                <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors duration-200">
                  {name}
                </h2>

                {/* Subtle arrow indicator */}
                <div className="mt-auto flex items-center text-sm text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-accent))] transition-colors duration-200">
                  <svg className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
