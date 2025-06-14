import FlexSearch from 'flexsearch'

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined'

// 动态导入 nodejieba（仅在 Node.js 环境中）
let nodejieba: any = null
if (!isBrowser) {
  try {
    nodejieba = require('nodejieba')
  } catch (error) {
    console.warn('nodejieba not available, falling back to simple tokenization')
  }
}

export interface SearchIndex {
  posts: SearchablePost[]
  index: any
}

export interface SearchablePost {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  category: string
  categoryName: string
  tags?: string[]
  author?: string
  date: string
  readingTime?: number
}

// 中文分词函数
function segmentChinese(text: string): string[] {
  if (nodejieba) {
    try {
      return nodejieba.cut(text, true)
    } catch (error) {
      console.warn('Chinese segmentation failed, using fallback')
    }
  }
  
  // 简单的中文分词回退方案
  const chineseRegex = /[\u4e00-\u9fff]+/g
  const englishRegex = /[a-zA-Z]+/g
  
  const chineseWords = text.match(chineseRegex) || []
  const englishWords = text.match(englishRegex) || []
  
  // 对中文进行简单的字符级分割
  const chineseChars = chineseWords.join('').split('')
  
  return [...englishWords, ...chineseChars]
}

// 文本预处理和分词
function tokenize(text: string): string[] {
  if (!text) return []
  
  // 移除 HTML 标签
  const cleanText = text.replace(/<[^>]*>/g, ' ')
  
  // 转换为小写
  const lowerText = cleanText.toLowerCase()
  
  // 分词
  const tokens = segmentChinese(lowerText)
  
  // 过滤空字符串和单字符（除了中文字符）
  return tokens.filter(token => {
    if (!token || token.trim().length === 0) return false
    // 保留中文字符，即使是单字符
    if (/[\u4e00-\u9fff]/.test(token)) return true
    // 英文单词至少2个字符
    return token.length >= 2
  })
}

// 创建搜索索引
export function createSearchIndex(posts: SearchablePost[]): SearchIndex {
  const index = new FlexSearch.Index({
    tokenize: (text: string) => tokenize(text),
    resolution: 9,
    depth: 4,
    bidirectional: true,
    suggest: true,
  })

  // 为每个文章创建搜索文档
  posts.forEach((post, i) => {
    const searchableContent = [
      post.title,
      post.content,
      post.excerpt || '',
      post.categoryName,
      ...(post.tags || []),
      post.author || '',
    ].join(' ')

    index.add(i, searchableContent)
  })

  return { posts, index }
}

// 执行搜索
export function searchPosts(
  query: string,
  searchIndex: SearchIndex,
  limit: number = 20
): SearchablePost[] {
  if (!query.trim() || !searchIndex) {
    return []
  }

  try {
    // 使用 FlexSearch 进行搜索
    const results = searchIndex.index.search(query, { limit })
    
    // 返回匹配的文章
    return results.map((index: number) => searchIndex.posts[index]).filter(Boolean)
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

// 高亮搜索关键词
export function highlightText(text: string, query: string): string {
  if (!query.trim() || !text) {
    return text
  }

  // 分词查询
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) {
    return text
  }

  let highlightedText = text
  
  // 为每个查询词添加高亮
  queryTokens.forEach(token => {
    if (token.length >= 1) {
      // 创建正则表达式，支持中英文
      const regex = new RegExp(
        `(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      )
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="search-highlight">$1</mark>'
      )
    }
  })

  return highlightedText
}

// 生成搜索建议
export function generateSearchSuggestions(
  query: string,
  searchIndex: SearchIndex,
  limit: number = 5
): string[] {
  if (!query.trim() || !searchIndex) {
    return []
  }

  const suggestions = new Set<string>()
  const queryLower = query.toLowerCase()

  // 从文章标题中提取建议
  searchIndex.posts.forEach(post => {
    const title = post.title.toLowerCase()
    if (title.includes(queryLower)) {
      suggestions.add(post.title)
    }

    // 从标签中提取建议
    if (post.tags) {
      post.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag)
        }
      })
    }

    // 从分类中提取建议
    if (post.categoryName.toLowerCase().includes(queryLower)) {
      suggestions.add(post.categoryName)
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

// 获取热门搜索词（基于标签和分类）
export function getPopularSearchTerms(searchIndex: SearchIndex, limit: number = 10): string[] {
  if (!searchIndex) {
    return []
  }

  const termCounts = new Map<string, number>()

  searchIndex.posts.forEach(post => {
    // 统计标签
    if (post.tags) {
      post.tags.forEach(tag => {
        const count = termCounts.get(tag) || 0
        termCounts.set(tag, count + 1)
      })
    }

    // 统计分类
    const categoryCount = termCounts.get(post.categoryName) || 0
    termCounts.set(post.categoryName, categoryCount + 1)
  })

  // 按出现频率排序
  return Array.from(termCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term)
}

// 搜索统计
export interface SearchStats {
  totalPosts: number
  totalCategories: number
  totalTags: number
  averageReadingTime: number
}

export function getSearchStats(searchIndex: SearchIndex): SearchStats {
  if (!searchIndex) {
    return {
      totalPosts: 0,
      totalCategories: 0,
      totalTags: 0,
      averageReadingTime: 0,
    }
  }

  const categories = new Set<string>()
  const tags = new Set<string>()
  let totalReadingTime = 0
  let postsWithReadingTime = 0

  searchIndex.posts.forEach(post => {
    categories.add(post.category)
    
    if (post.tags) {
      post.tags.forEach(tag => tags.add(tag))
    }
    
    if (post.readingTime) {
      totalReadingTime += post.readingTime
      postsWithReadingTime++
    }
  })

  return {
    totalPosts: searchIndex.posts.length,
    totalCategories: categories.size,
    totalTags: tags.size,
    averageReadingTime: postsWithReadingTime > 0 
      ? Math.round(totalReadingTime / postsWithReadingTime) 
      : 0,
  }
}