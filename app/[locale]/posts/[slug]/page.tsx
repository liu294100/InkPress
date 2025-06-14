import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import TableOfContents from '@/components/TableOfContents'
import ShareButtons from '@/components/ShareButtons'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface PostPageProps {
  params: {
    slug: string
    locale: string
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  const t = await getTranslations('posts')
  
  if (!post) {
    return {
      title: t('notFound'),
    }
  }

  return {
    title: `${post.title} | InkPress`,
    description: post.excerpt || post.title,
    keywords: post.tags?.join(', '),
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug)
  const t = await getTranslations('posts')
  const tNav = await getTranslations('navigation')
  const tCommon = await getTranslations('common')

  if (!post) {
    notFound()
  }

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inkpress.vercel.app'}/${params.locale}/posts/${post.slug}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                {tNav('home')}
              </Link>
            </li>
            <li>→</li>
            <li>
              <Link
                href={`/category/${post.category}`}
                className="hover:text-blue-600"
              >
                {post.categoryName}
              </Link>
            </li>
            <li>→</li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Article Header */}
              <header className="p-8 border-b border-gray-200">
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-xl text-gray-600 mb-6">
                    {post.excerpt}
                  </p>
                )}
                {post.author && (
                  <div className="flex items-center">
                    <span className="text-gray-500">{t('by')} </span>
                    <span className="ml-1 font-medium text-gray-900">
                      {post.author}
                    </span>
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Article Content */}
              <div className="p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Article Footer */}
              <footer className="p-8 border-t border-gray-200 bg-gray-50">
                <ShareButtons
                  title={post.title}
                  url={currentUrl}
                />
              </footer>
            </article>

            {/* Navigation */}
            <nav className="mt-8 flex justify-between">
              {post.previousPost && (
                <Link
                  href={`/posts/${post.previousPost.slug}`}
                  className="flex-1 mr-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="text-sm text-gray-500 mb-1">← {t('previous')}</div>
                  <div className="font-medium text-gray-900 line-clamp-2">
                    {post.previousPost.title}
                  </div>
                </Link>
              )}
              {post.nextPost && (
                <Link
                  href={`/posts/${post.nextPost.slug}`}
                  className="flex-1 ml-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-right"
                >
                  <div className="text-sm text-gray-500 mb-1">{t('next')} →</div>
                  <div className="font-medium text-gray-900 line-clamp-2">
                    {post.nextPost.title}
                  </div>
                </Link>
              )}
            </nav>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-4 space-y-6">
              {/* Table of Contents */}
              {post.headings && post.headings.length > 0 && (
                <TableOfContents headings={post.headings} />
              )}

              {/* Related Posts */}
              {post.relatedPosts && post.relatedPosts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('relatedPosts')}
                  </h3>
                  <div className="space-y-3">
                    {post.relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/posts/${relatedPost.slug}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {relatedPost.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(relatedPost.date)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}