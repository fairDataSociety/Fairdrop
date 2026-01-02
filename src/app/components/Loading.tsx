/**
 * Loading Components
 *
 * Loading states and skeleton placeholders.
 */

/**
 * Spinner component
 */
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <svg
      className={`${sizeClasses[size]} animate-spin text-primary-600`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

/**
 * Full page loading state
 */
export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Inline loading state
 */
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

/**
 * Skeleton box
 */
export function Skeleton({
  className = '',
  animated = true,
}: {
  className?: string
  animated?: boolean
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
    />
  )
}

/**
 * Skeleton text line
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3">
      <Skeleton className="h-6 w-1/3" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Message list skeleton
 */
export function MessageListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-4"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

/**
 * Suspense fallback for lazy-loaded pages
 */
export function SuspenseFallback() {
  return <PageLoading />
}

export default PageLoading
