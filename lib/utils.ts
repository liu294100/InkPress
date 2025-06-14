import { type ClassValue, clsx } from 'clsx'

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  // If the date is today
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      if (diffInMinutes < 1) {
        return 'Just now'
      }
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  // If the date is within the last week
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  // For older dates, show the formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date for metadata (ISO format)
export function formatDateISO(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString()
}

// Get relative time string
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  const units = [
    { name: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { name: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { name: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { name: 'day', ms: 1000 * 60 * 60 * 24 },
    { name: 'hour', ms: 1000 * 60 * 60 },
    { name: 'minute', ms: 1000 * 60 },
  ]

  for (const unit of units) {
    const value = Math.floor(diffInMs / unit.ms)
    if (value >= 1) {
      return `${value} ${unit.name}${value > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength).trim() + '...'
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, ' ')
  
  // Remove extra whitespace
  const cleanText = textContent.replace(/\s+/g, ' ').trim()
  
  return truncateText(cleanText, maxLength)
}

// Slugify text (convert to URL-friendly format)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Capitalize first letter of each word
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Calculate reading time
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Check if string is valid URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Get domain from URL
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any }
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    
    return clonedObj as T
  }
  
  return obj
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  return Object.keys(obj).length === 0
}

// Get contrast color (black or white) for a given background color
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}