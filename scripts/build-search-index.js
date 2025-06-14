const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { remark } = require('remark')
const remarkHtml = require('remark-html')
const stripHtml = require('string-strip-html')

// Chinese word segmentation (fallback implementation)
let nodejieba
try {
  nodejieba = require('nodejieba')
} catch (error) {
  console.warn('nodejieba not available, using fallback segmentation')
}

// Configuration
const DOCS_DIR = path.join(process.cwd(), 'docs')
const OUTPUT_DIR = path.join(process.cwd(), 'public')
const INDEX_FILE = path.join(OUTPUT_DIR, 'search-index.json')

// Utility functions
function segmentText(text) {
  if (nodejieba) {
    return nodejieba.cut(text, true)
  }
  
  // Fallback: simple word splitting
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
}

function calculateReadingTime(text) {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function extractExcerpt(content, maxLength = 200) {
  const plainText = stripHtml.stripHtml(content).result
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText
}

function getSlugFromPath(filePath) {
  const relativePath = path.relative(DOCS_DIR, filePath)
  return relativePath
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function getCategoryFromPath(filePath) {
  const relativePath = path.relative(DOCS_DIR, filePath)
  const parts = relativePath.split(path.sep)
  return parts.length > 1 ? parts[0] : 'uncategorized'
}

function findMarkdownFiles(dir) {
  const files = []
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        traverse(fullPath)
      } else if (item.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir)
  }
  
  return files
}

async function processMarkdownFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(fileContent)
    
    // Process markdown to HTML
    let processedContent
    try {
      processedContent = await remark()
        .use(remarkHtml)
        .process(content)
    } catch (error) {
      console.warn(`Failed to process markdown for ${filePath}, using plain content:`, error.message)
      processedContent = { toString: () => content }
    }
    
    const htmlContent = processedContent.toString()
    const plainContent = stripHtml.stripHtml(htmlContent).result
    
    // Extract metadata
    const slug = getSlugFromPath(filePath)
    const category = getCategoryFromPath(filePath)
    const readingTime = calculateReadingTime(plainContent)
    const excerpt = extractExcerpt(htmlContent)
    
    // Create searchable content
    const searchableContent = [
      frontmatter.title || '',
      plainContent,
      frontmatter.tags ? frontmatter.tags.join(' ') : '',
      category
    ].join(' ')
    
    // Segment text for search
    const tokens = segmentText(searchableContent)
    
    return {
      id: slug,
      slug,
      title: frontmatter.title || path.basename(filePath, '.md'),
      content: plainContent,
      excerpt,
      category,
      tags: frontmatter.tags || [],
      author: frontmatter.author || 'Anonymous',
      date: frontmatter.date || fs.statSync(filePath).mtime.toISOString(),
      readingTime,
      tokens,
      searchableContent
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
    return null
  }
}

async function buildSearchIndex() {
  console.log('Building search index...')
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }
    
    // Find all markdown files
    const markdownFiles = findMarkdownFiles(DOCS_DIR)
    console.log(`Found ${markdownFiles.length} markdown files`)
    
    if (markdownFiles.length === 0) {
      console.warn('No markdown files found in docs directory')
      // Create empty index
      const emptyIndex = {
        posts: [],
        categories: [],
        tags: [],
        totalPosts: 0,
        lastUpdated: new Date().toISOString()
      }
      fs.writeFileSync(INDEX_FILE, JSON.stringify(emptyIndex, null, 2))
      return
    }
    
    // Process all files
    const posts = []
    for (const filePath of markdownFiles) {
      const post = await processMarkdownFile(filePath)
      if (post) {
        posts.push(post)
      }
    }
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Extract categories and tags
    const categories = [...new Set(posts.map(post => post.category))]
      .map(category => ({
        name: category,
        count: posts.filter(post => post.category === category).length
      }))
      .sort((a, b) => b.count - a.count)
    
    const allTags = posts.flatMap(post => post.tags)
    const tags = [...new Set(allTags)]
      .map(tag => ({
        name: tag,
        count: allTags.filter(t => t === tag).length
      }))
      .sort((a, b) => b.count - a.count)
    
    // Create search index
    const searchIndex = {
      posts: posts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags,
        author: post.author,
        date: post.date,
        readingTime: post.readingTime,
        tokens: post.tokens,
        searchableContent: post.searchableContent
      })),
      categories,
      tags,
      totalPosts: posts.length,
      lastUpdated: new Date().toISOString()
    }
    
    // Write search index
    fs.writeFileSync(INDEX_FILE, JSON.stringify(searchIndex, null, 2))
    
    console.log(`✅ Search index built successfully!`)
    console.log(`   - ${posts.length} posts indexed`)
    console.log(`   - ${categories.length} categories`)
    console.log(`   - ${tags.length} unique tags`)
    console.log(`   - Index saved to: ${INDEX_FILE}`)
    
  } catch (error) {
    console.error('❌ Error building search index:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  buildSearchIndex()
}

module.exports = { buildSearchIndex }