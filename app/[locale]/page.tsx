import Link from 'next/link'
import { getAllPosts, getCategories } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import SearchBox from '@/components/SearchBox'

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const posts = await getAllPosts()
  const categories = await getCategories()
  const recentPosts = posts.slice(0, 6)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">InkPress</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A modern markdown-based blog platform built with Next.js. 
          Discover articles across various categories and topics.
        </p>
        <SearchBox />
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/${locale}/category/${category.slug}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 card-hover"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {category.description || `Explore ${category.name.toLowerCase()} articles`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.count} {category.count === 1 ? 'article' : 'articles'}
                </span>
                <span className="text-blue-600 font-medium">View →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
          <Link
            href={`/${locale}/posts`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden card-hover"
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Link
                    href={`/${locale}/category/${post.category}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {post.categoryName}
                  </Link>
                  <span className="mx-2 text-gray-300">•</span>
                  <time className="text-sm text-gray-500">
                    {formatDate(post.date)}
                  </time>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link
                    href={`/${locale}/posts/${post.slug}`}
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}