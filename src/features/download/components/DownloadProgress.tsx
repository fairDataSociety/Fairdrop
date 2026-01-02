/**
 * DownloadProgress Component
 *
 * Shows download/decryption progress.
 */

import { Progress, Button } from '@/shared/components'
import type { DownloadStatus } from '../stores/downloadStore'

/**
 * DownloadProgress props
 */
interface DownloadProgressProps {
  status: DownloadStatus
  progress: number
  error: string | null
  onRetry?: () => void
  onCancel?: () => void
}

/**
 * Get status message
 */
function getStatusMessage(status: DownloadStatus): string {
  switch (status) {
    case 'fetching':
      return 'Downloading from Swarm...'
    case 'decrypting':
      return 'Decrypting file...'
    case 'complete':
      return 'Download complete'
    case 'error':
      return 'Download failed'
    default:
      return 'Preparing...'
  }
}

/**
 * DownloadProgress component
 */
export function DownloadProgress({
  status,
  progress,
  error,
  onRetry,
  onCancel,
}: DownloadProgressProps) {
  const isError = status === 'error'
  const isLoading = status === 'fetching' || status === 'decrypting'

  return (
    <div className="space-y-6">
      {/* Status header */}
      <div className="text-center">
        {isError ? (
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ) : isLoading ? (
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
        ) : null}

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {getStatusMessage(status)}
        </h2>
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="space-y-2">
          <Progress
            value={progress}
            size="lg"
            variant={status === 'decrypting' ? 'success' : 'default'}
            animated
          />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Error message */}
      {isError && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        {isError && onRetry && (
          <Button onClick={onRetry} variant="primary">
            Retry
          </Button>
        )}
        {(isError || isLoading) && onCancel && (
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default DownloadProgress
