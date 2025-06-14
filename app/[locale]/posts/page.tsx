import { getAllPosts } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('posts')
  
  return {
    title: `${t('allPosts')} | InkPress`,
    description: t('allPostsDescription'),
  }
}

export default async function PostsPage() {
  const posts = await getAllPosts()
  const t = await getTranslations('posts')
  const tCategories = await getTranslations('categories')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('allPosts')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('allPostsDescription')}
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Link
                    href={`/category/${post.category}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                  >
                    {post.categoryName}
                  </Link>
                  <span className="mx-3 text-gray-300">•</span>
                  <time className="text-gray-500">
                    {formatDate(post.date)}
                  </time>
                  {post.readingTime && (
                    <>
                      <span className="mx-3 text-gray-300">•</span>
                      <span className="text-gray-500">
                        {t('readingTime', { minutes: post.readingTime })}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
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

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {post.author && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{t('by')} {post.author}</span>
                    </div>
                  )}
                  <Link
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                  >
                    {t('readMore')}
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('noPosts')}
            </h3>
            <p className="text-gray-500">
              {t('noPostsDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}