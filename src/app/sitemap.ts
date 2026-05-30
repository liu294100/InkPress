/**
 * Dynamic sitemap generation using Next.js App Router convention.
 * Generates sitemap entries for every document×locale combination,
 * including alternate links for all locale versions of each document.
 */

import { MetadataRoute } from 'next';
import { siteConfig } from '../config/site.config';
import { getAllDocuments, getCategories } from '../lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { supportedLocales, url: baseUrl } = siteConfig;
  const entries: MetadataRoute.Sitemap = [];

  // Add homepage entries for each locale
  for (const locale of supportedLocales) {
    const languages: Record<string, string> = {};
    for (const altLocale of supportedLocales) {
      languages[altLocale] = `${baseUrl}/${altLocale}`;
    }

    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages,
      },
    });
  }

  // Add category listing pages for each locale
  const categories = getCategories();
  for (const locale of supportedLocales) {
    for (const category of categories) {
      const languages: Record<string, string> = {};
      for (const altLocale of supportedLocales) {
        languages[altLocale] = `${baseUrl}/${altLocale}/${category.id}`;
      }

      entries.push({
        url: `${baseUrl}/${locale}/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages,
        },
      });
    }
  }

  // Add document pages for each locale
  for (const locale of supportedLocales) {
    const documents = await getAllDocuments(locale);

    for (const doc of documents) {
      const languages: Record<string, string> = {};
      for (const altLocale of supportedLocales) {
        languages[altLocale] = `${baseUrl}/${altLocale}/${doc.category}/${doc.slug}`;
      }

      entries.push({
        url: `${baseUrl}/${locale}/${doc.category}/${doc.slug}`,
        lastModified: doc.lastModified ? new Date(doc.lastModified) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
