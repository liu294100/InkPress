import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import { categoriesConfig } from '@/config/categories.config';
import { getDocumentsByCategory } from '@/lib/content';

interface CategoryPageProps {
  params: {
    locale: string;
    category: string;
  };
}

/**
 * Generate static params for all locale × category combinations (SSG).
 */
export function generateStaticParams() {
  const params: { locale: string; category: string }[] = [];

  for (const locale of siteConfig.supportedLocales) {
    for (const category of categoriesConfig.categories) {
      params.push({ locale, category: category.id });
    }
  }

  return params;
}

/**
 * Category listing page.
 * Lists all documents in the selected category for the current locale.
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = params;

  // Validate category exists
  const categoryConfig = categoriesConfig.categories.find((c) => c.id === category);
  if (!categoryConfig) {
    notFound();
  }

  const documents = await getDocumentsByCategory(locale, category);
  const categoryName = categoryConfig.name[locale] || categoryConfig.name['en'] || category;

  return (
    <div className="content-container py-8 sm:py-12">
      {/* Category Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {categoryConfig.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryConfig.color }}
              aria-hidden="true"
            />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))]">
            {categoryName}
          </h1>
        </div>
        <p className="text-[rgb(var(--color-text-secondary))]">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </p>
      </header>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-[rgb(var(--color-text-tertiary))]">
            No documents available in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.slug}
              href={`/${locale}/${category}/${doc.slug}`}
              className="glass-card group block p-5 sm:p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors duration-200 truncate">
                    {doc.frontmatter.title}
                  </h2>
                  {doc.frontmatter.description && (
                    <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))] line-clamp-2">
                      {doc.frontmatter.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--color-text-tertiary))]">
                    {doc.frontmatter.author && <span>{doc.frontmatter.author}</span>}
                    {doc.frontmatter.date && (
                      <time dateTime={doc.frontmatter.date}>{doc.frontmatter.date}</time>
                    )}
                    <span>{doc.readingTime} min read</span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 flex-shrink-0 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-accent))] transition-all duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
