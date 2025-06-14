import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getCategories, getPostsByCategory } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

interface CategoryPageProps {
  params: {
    locale: string
    slug: string
  }
  searchParams: {
    sort?: 'date' | 'title'
    order?: 'asc' | 'desc'
  }
}

export async function generateStaticParams() {
  const categories = await getCategories()
  const locales = ['zh', 'en', 'ja', 'fr', 'ko']
  
  const params = []
  for (const locale of locales) {
    for (const category of categories) {
      params.push({
        locale,
        slug: category.slug,
      })
    }
  }
  return params
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getCategories()
  const category = categories.find(cat => cat.slug === params.slug)
  const t = await getTranslations('categories')
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${t(category.slug)} | InkPress`,
    description: category.description || `Browse all ${t(category.slug).toLowerCase()} articles`,
    keywords: `${t(category.slug).toLowerCase()}, blog, articles`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categories = await getCategories()
  const category = categories.find(cat => cat.slug === params.slug)
  const t = await getTranslations('categories')
  const tCommon = await getTranslations('common')
  
  if (!category) {
    notFound()
  }

  const posts = await getPostsByCategory(params.slug)
  const sortBy = searchParams.sort || 'date'
  const order = searchParams.order || 'desc'

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    } else {
      return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href={`/${params.locale}`} className="hover:text-gray-700">
              {tCommon('home')}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${params.locale}/category`} className="hover:text-gray-700">
              {tCommon('categories')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{t(category.slug)}</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t(category.slug)}
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-600 mb-6">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </p>
            
            {/* Sort controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('sort', e.target.value)
                  window.location.href = url.toString()
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <select
                value={order}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('order', e.target.value)
                  window.location.href = url.toString()
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {sortedPosts.length > 0 ? (
          <div className="grid gap-8">
            {sortedPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <time dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                    {post.readingTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.readingTime} {tCommon('readingTime')}</span>
                      </>
                    )}
                    {post.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{tCommon('author')}: {post.author}</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link 
                      href={`/${params.locale}/posts/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      href={`/${params.locale}/posts/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      {tCommon('readMore')} →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No articles found in this category.
            </p>
          </div>
        )}

        {/* Other Categories */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Other Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories
              .filter(cat => cat.slug !== params.slug)
              .map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${params.locale}/category/${cat.slug}`}
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900 mb-1">
                    {t(cat.slug)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {cat.count} articles
                  </p>
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}