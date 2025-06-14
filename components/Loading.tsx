interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const Loading = ({ size = 'md', text, className = '' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        {/* Spinner */}
        <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
        
        {/* Pulse effect */}
        <div className={`absolute inset-0 rounded-full border-2 border-blue-200 animate-ping ${sizeClasses[size]}`}></div>
      </div>
      
      {text && (
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Skeleton loading components
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="flex space-x-2">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
)

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)

export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`bg-gray-200 rounded-full animate-pulse ${sizeClasses[size]}`}></div>
  )
}

export const SkeletonButton = ({ className = '' }: { className?: string }) => (
  <div className={`h-10 bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
)

export const SkeletonImage = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse flex items-center justify-center ${className}`}>
    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  </div>
)

// Page loading component
export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" text="Loading..." />
  </div>
)

// Inline loading component
export const InlineLoading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center py-8">
    <Loading size="sm" text={text} />
  </div>
)

// Search loading component
export const SearchLoading = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loading size="md" />
      <p className="mt-3 text-gray-600">Searching...</p>
    </div>
  </div>
)

export default Loading