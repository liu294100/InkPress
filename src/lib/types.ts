export interface Document {
  slug: string;
  locale: string;
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  contentType: 'markdown' | 'html';
  frontmatter: DocumentFrontmatter;
  headings: Heading[];
  readingTime: number;
  lastModified: string;
}

export interface DocumentFrontmatter {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  date?: string;
  paywallEnabled?: boolean; // Default: false
  draft?: boolean;
}

export interface Heading {
  id: string;
  text: string;
  level: number; // 1-6
  children: Heading[];
}

export interface Category {
  id: string;
  name: Record<string, string>; // Localized names
  icon?: string;
  color?: string;
  subcategories?: Category[];
  order: number;
}

export interface SearchIndex {
  locale: string;
  documents: SearchDocument[];
}

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  slug: string;
  excerpt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  highlights: string[];
  score: number;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType: string;
  canonicalUrl: string;
  hreflangAlternates: { locale: string; url: string }[];
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  alternates: { lang: string; url: string }[];
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  defaultLocale: string;
  supportedLocales: string[];
  features: {
    paywall: { enabled: boolean };
    ads: { enabled: boolean; adsenseId?: string };
    analytics: { enabled: boolean; gaId?: string };
  };
  social: {
    facebook?: string;
    youtube?: string;
    x?: string;
    instagram?: string;
    threads?: string;
    wechat?: string;
  };
  footer: {
    privacyPolicyUrl: string;
    copyrightHolder: string;
  };
}

export interface DocumentListItem {
  slug: string;
  title: string;
}

export interface SocialLink {
  platform: 'facebook' | 'youtube' | 'x' | 'instagram' | 'threads' | 'wechat';
  url?: string;
  icon: string;
}
