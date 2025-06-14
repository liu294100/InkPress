import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getCategories, getPostsByCategory } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: 'date' | 'title'
    order?: 'asc' | 'desc'
  }
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getCategories()
  const category = categories.find(cat => cat.slug === params.slug)
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | InkPress`,
    description: category.description || `Browse all ${category.name.toLowerCase()} articles`,
    keywords: `${category.name.toLowerCase()}, blog, articles`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categories = await getCategories()
  const category = categories.find(cat => cat.slug === params.slug)
  
  if (!category) {
    notFound()
  }

  const posts = await getPostsByCategory(params.slug)
  const sortBy = searchParams.sort || 'date'
  const order = searchParams.order || 'desc'

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title)
    }
    
    return order === 'desc' ? -comparison : comparison
  })

  const getSortUrl = (newSort: string, newOrder: string) => {
    const params = new URLSearchParams()
    params.set('sort', newSort)
    params.set('order', newOrder)
    return `?${params.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>→</li>
            <li className="text-gray-900">{category.name}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-gray-600 mb-6">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-gray-500">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </p>
            
            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="flex items-center space-x-2">
                <Link
                  href={getSortUrl('date', order)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors duration-200 ${
                    sortBy === 'date'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Date
                </Link>
                <Link
                  href={getSortUrl('title', order)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors duration-200 ${
                    sortBy === 'title'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Title
                </Link>
                <Link
                  href={getSortUrl(sortBy, order === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {order === 'asc' ? '↑' : '↓'}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Posts List */}
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found in this category.</p>
            <Link
              href="/"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-3">
                  <time className="text-sm text-gray-500">
                    {formatDate(post.date)}
                  </time>
                  {post.readingTime && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {post.readingTime} min read
                      </span>
                    </>
                  )}
                </div>
                
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="hover:text-blue-600 transition-colors duration-200"
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
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            ← Browse All Categories
          </Link>
        </div>
      </div>
    </div>
  )
}