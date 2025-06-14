import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import { rehype } from 'rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export interface Post {
  slug: string
  title: string
  date: string
  excerpt?: string
  content: string
  category: string
  categoryName: string
  tags?: string[]
  author?: string
  readingTime?: number
  headings?: Heading[]
  previousPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
  relatedPosts?: { slug: string; title: string; date: string }[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface Category {
  name: string
  slug: string
  description?: string
  count: number
}

const postsDirectory = path.join(process.cwd(), 'docs')

// Calculate reading time (assuming 200 words per minute)
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Extract headings from markdown content
function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Heading[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    headings.push({ id, text, level })
  }

  return headings
}

// Process markdown content
async function processMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)

  // Apply rehype plugins for syntax highlighting and heading links
  const rehypeResult = await rehype()
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['heading-link'],
      },
    })
    .process(result.toString())

  return rehypeResult.toString()
}

// Get category name from slug
function getCategoryName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get all post files recursively
function getPostFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  
  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...getPostFiles(fullPath, baseDir))
    } else if (item.endsWith('.md')) {
      files.push(path.relative(baseDir, fullPath))
    }
  }
  
  return files
}

// Get post slug from file path
function getSlugFromPath(filePath: string): string {
  const pathWithoutExt = filePath.replace(/\.md$/, '')
  return pathWithoutExt.replace(/[\\/]/g, '-')
}

// Get category from file path
function getCategoryFromPath(filePath: string): string {
  const parts = filePath.split(path.sep)
  return parts.length > 1 ? parts[0] : 'general'
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const postFiles = getPostFiles(postsDirectory)
  const posts: Post[] = []

  for (const filePath of postFiles) {
    const fullPath = path.join(postsDirectory, filePath)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const slug = getSlugFromPath(filePath)
    const category = getCategoryFromPath(filePath)
    const categoryName = getCategoryName(category)
    const headings = extractHeadings(content)
    const readingTime = calculateReadingTime(content)
    const processedContent = await processMarkdown(content)

    const post: Post = {
      slug,
      title: data.title || path.basename(filePath, '.md'),
      date: data.date || fs.statSync(fullPath).mtime.toISOString(),
      excerpt: data.excerpt || data.description,
      content: processedContent,
      category,
      categoryName,
      tags: data.tags || [],
      author: data.author,
      readingTime,
      headings,
    }

    posts.push(post)
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Add previous/next post relationships
  for (let i = 0; i < posts.length; i++) {
    if (i > 0) {
      posts[i].nextPost = {
        slug: posts[i - 1].slug,
        title: posts[i - 1].title,
      }
    }
    if (i < posts.length - 1) {
      posts[i].previousPost = {
        slug: posts[i + 1].slug,
        title: posts[i + 1].title,
      }
    }
  }

  // Add related posts (same category, excluding current post)
  for (const post of posts) {
    const relatedPosts = posts
      .filter(p => p.category === post.category && p.slug !== post.slug)
      .slice(0, 3)
      .map(p => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
      }))
    
    if (relatedPosts.length > 0) {
      post.relatedPosts = relatedPosts
    }
  }

  return posts
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getAllPosts()
  return posts.find(post => post.slug === slug) || null
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter(post => post.category === categorySlug)
}

export async function getCategories(): Promise<Category[]> {
  const posts = await getAllPosts()
  const categoryMap = new Map<string, { count: number; posts: Post[] }>()

  // Count posts per category
  for (const post of posts) {
    const existing = categoryMap.get(post.category)
    if (existing) {
      existing.count++
      existing.posts.push(post)
    } else {
      categoryMap.set(post.category, { count: 1, posts: [post] })
    }
  }

  // Convert to category objects
  const categories: Category[] = []
  for (const [slug, { count }] of categoryMap) {
    categories.push({
      name: getCategoryName(slug),
      slug,
      count,
      description: `Explore ${getCategoryName(slug).toLowerCase()} articles and insights`,
    })
  }

  // Sort by count (descending) then by name
  categories.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.name.localeCompare(b.name)
  })

  return categories
}

export async function getAllCategories(): Promise<Array<Category & { latestPost?: { title: string; date: string } }>> {
  const posts = await getAllPosts()
  const categoryMap = new Map<string, { count: number; posts: Post[] }>()

  // Count posts per category
  for (const post of posts) {
    const existing = categoryMap.get(post.category)
    if (existing) {
      existing.count++
      existing.posts.push(post)
    } else {
      categoryMap.set(post.category, { count: 1, posts: [post] })
    }
  }

  // Convert to category objects with latest post
  const categories: Array<Category & { latestPost?: { title: string; date: string } }> = []
  for (const [slug, { count, posts }] of categoryMap) {
    // Sort posts by date to get the latest
    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestPost = sortedPosts[0]
    
    categories.push({
      name: getCategoryName(slug),
      slug,
      count,
      description: `Explore ${getCategoryName(slug).toLowerCase()} articles and insights`,
      latestPost: latestPost ? {
        title: latestPost.title,
        date: latestPost.date
      } : undefined
    })
  }

  // Sort by count (descending) then by name
  categories.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.name.localeCompare(b.name)
  })

  return categories
}

export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.slice(0, limit)
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter(post => 
    post.tags && post.tags.some(t => 
      t.toLowerCase() === tag.toLowerCase()
    )
  )
}