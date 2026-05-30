import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDocumentBySlug, getAllDocuments, getCategories, buildHeadingTree } from '@/lib/content';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { siteConfig } from '@/config/site.config';
import DocumentPageClient from './DocumentPageClient';

interface DocumentPageProps {
  params: {
    locale: string;
    category: string;
    slug: string[];
  };
}

/**
 * Generate static params for all document pages across all locales and categories.
 * This enables SSG (Static Site Generation) for Vercel deployment.
 */
export async function generateStaticParams() {
  const params: { locale: string; category: string; slug: string[] }[] = [];

  for (const locale of siteConfig.supportedLocales) {
    const documents = await getAllDocuments(locale);
    for (const doc of documents) {
      params.push({
        locale,
        category: doc.category,
        slug: doc.slug.split('/'),
      });
    }
  }

  return params;
}

/**
 * Generate SEO metadata for the document page.
 */
export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const { locale, category, slug } = params;
  const document = await getDocumentBySlug(locale, category, slug);

  if (!document) {
    return { title: 'Not Found' };
  }

  const seo = generateSeoMetadata(document, locale);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonicalUrl,
      languages: Object.fromEntries(
        seo.hreflangAlternates.map((alt) => [alt.locale, alt.url])
      ),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      type: seo.ogType as 'article',
      siteName: siteConfig.name,
      locale,
    },
  };
}

/**
 * Document page - server component that loads document content at build time.
 * Delegates interactive features to the DocumentPageClient component.
 */
export default async function DocumentPage({ params }: DocumentPageProps) {
  const { locale, category, slug } = params;
  const document = await getDocumentBySlug(locale, category, slug);

  if (!document) {
    notFound();
  }

  // Extract headings for TOC on the server side
  const headings = buildHeadingTree(document.content);

  const pageUrl = `${siteConfig.url}/${locale}/${category}/${slug.join('/')}`;

  return (
    <DocumentPageClient
      document={document}
      headings={headings}
      pageUrl={pageUrl}
      locale={locale}
    />
  );
}
