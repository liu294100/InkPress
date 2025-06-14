import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllCategories } from '@/lib/posts'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('categories')
  
  return {
    title: `${t('title')} | InkPress`,
    description: t('description'),
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()
  const t = await getTranslations('categories')
  const tCommon = await getTranslations('common')
  const tNav = await getTranslations('navigation')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                {tNav('home')}
              </Link>
            </li>
            <li>→</li>
            <li className="text-gray-900">{t('title')}</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                {category.latestPost && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-1">{t('latestPost')}</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {category.latestPost.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(category.latestPost.date)}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  {t('viewAllPosts')}
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noCategories')}</h3>
            <p className="text-gray-500">{t('noCategoriesDescription')}</p>
          </div>
        )}
      </div>
    </div>
  )
}