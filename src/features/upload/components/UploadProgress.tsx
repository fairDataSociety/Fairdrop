/**
 * UploadProgress Component
 *
 * Shows upload progress with status indicators.
 */

import { Progress, Button } from '@/shared/components'
import type { UploadStatus } from '@/shared/types'

/**
 * Status step configuration
 */
interface StatusStep {
  status: UploadStatus
  label: string
  description: string
}

/**
 * Upload steps in order
 */
const STEPS: StatusStep[] = [
  {
    status: 'encrypting',
    label: 'Encrypting',
    description: 'Securing your file with encryption...',
  },
  {
    status: 'uploading',
    label: 'Uploading',
    description: 'Uploading to the Swarm network...',
  },
  {
    status: 'notifying',
    label: 'Notifying',
    description: 'Sending notification to recipient...',
  },
]

/**
 * Get step index for status
 */
function getStepIndex(status: UploadStatus): number {
  const idx = STEPS.findIndex((s) => s.status === status)
  return idx >= 0 ? idx : 0
}

/**
 * UploadProgress props
 */
interface UploadProgressProps {
  status: UploadStatus
  progress: number
  error: string | null
  fileName: string
  onCancel?: () => void
  onRetry?: () => void
}

/**
 * UploadProgress component
 */
export function UploadProgress({
  status,
  progress,
  error,
  fileName,
  onCancel,
  onRetry,
}: UploadProgressProps) {
  const currentStepIndex = getStepIndex(status)
  const isError = status === 'error'

  // Calculate overall progress based on step
  const overallProgress = isError
    ? 0
    : status === 'encrypting'
      ? progress * 0.3 // Encrypting is 0-30%
      : status === 'uploading'
        ? 30 + progress * 0.6 // Uploading is 30-90%
        : status === 'notifying'
          ? 90 + progress * 0.1 // Notifying is 90-100%
          : 100

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isError ? 'Upload Failed' : 'Uploading...'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 truncate max-w-md mx-auto">
          {fileName}
        </p>
      </div>

      {/* Error state */}
      {isError && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Upload failed</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {onRetry && (
              <Button variant="danger" onClick={onRetry} size="sm">
                Retry
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} size="sm">
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress state */}
      {!isError && (
        <>
          {/* Main progress bar */}
          <div className="space-y-2">
            <Progress
              value={overallProgress}
              size="lg"
              variant={status === 'notifying' ? 'success' : 'default'}
              animated
            />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {Math.round(overallProgress)}% complete
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex
                const isComplete = idx < currentStepIndex

                return (
                  <div key={step.status} className="flex items-center gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isComplete
                            ? 'bg-green-500 text-white'
                            : isActive
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isComplete ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : isActive ? (
                          <svg
                            className="w-5 h-5 animate-spin"
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
                        ) : (
                          <span className="text-sm font-medium">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : isComplete
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`w-12 h-0.5 ${
                          isComplete
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current step description */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            {STEPS[currentStepIndex]?.description}
          </p>

          {/* Cancel button */}
          {onCancel && (
            <div className="flex justify-center">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UploadProgress
