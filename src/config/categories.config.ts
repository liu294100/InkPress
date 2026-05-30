/**
 * Categories configuration implementing the CategoriesConfig interface.
 * Defines the default content categories with localized names for all 9 supported languages.
 */

export interface Category {
  id: string;
  name: Record<string, string>;
  icon?: string;
  color?: string;
  subcategories?: Category[];
  order: number;
}

export interface CategoriesConfig {
  categories: Category[];
}

export const categoriesConfig: CategoriesConfig = {
  categories: [
    {
      id: "programming",
      name: {
        zh: "编程",
        en: "Programming",
        ja: "プログラミング",
        ko: "프로그래밍",
        fr: "Programmation",
        de: "Programmierung",
        es: "Programación",
        ms: "Pengaturcaraan",
        th: "การเขียนโปรแกรม",
      },
      icon: "code",
      color: "#3B82F6",
      order: 1,
    },
    {
      id: "ai",
      name: {
        zh: "AI",
        en: "AI",
        ja: "AI",
        ko: "AI",
        fr: "IA",
        de: "KI",
        es: "IA",
        ms: "AI",
        th: "AI",
      },
      icon: "cpu",
      color: "#8B5CF6",
      order: 2,
    },
    {
      id: "finance",
      name: {
        zh: "投资理财",
        en: "Finance & Investment",
        ja: "投資・資産運用",
        ko: "투자 및 재테크",
        fr: "Finance et investissement",
        de: "Finanzen und Investitionen",
        es: "Finanzas e inversiones",
        ms: "Kewangan dan pelaburan",
        th: "การเงินและการลงทุน",
      },
      icon: "trending-up",
      color: "#10B981",
      order: 3,
    },
    {
      id: "articles",
      name: {
        zh: "文章",
        en: "Articles",
        ja: "記事",
        ko: "기사",
        fr: "Articles",
        de: "Artikel",
        es: "Artículos",
        ms: "Artikel",
        th: "บทความ",
      },
      icon: "file-text",
      color: "#F59E0B",
      order: 4,
    },
    {
      id: "history",
      name: {
        zh: "历史",
        en: "History",
        ja: "歴史",
        ko: "역사",
        fr: "Histoire",
        de: "Geschichte",
        es: "Historia",
        ms: "Sejarah",
        th: "ประวัติศาสตร์",
      },
      icon: "clock",
      color: "#EF4444",
      order: 5,
    },
  ],
};
