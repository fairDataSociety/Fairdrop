/**
 * ModeSelection Component
 *
 * Upload mode selection and confirmation step.
 */

import { useCallback } from 'react'
import { Button, Card } from '@/shared/components'
import type { UploadMode } from '@/shared/types'

/**
 * Mode option data
 */
interface ModeOption {
  id: UploadMode
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  requiresRecipient: boolean
}

/**
 * Available upload modes
 */
const MODES: ModeOption[] = [
  {
    id: 'send',
    title: 'Send Encrypted',
    description: 'Encrypt and send securely to a specific recipient',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    features: ['End-to-end encrypted', 'Only recipient can decrypt', 'Inbox notification'],
    requiresRecipient: true,
  },
  {
    id: 'store',
    title: 'Store for Myself',
    description: 'Encrypted storage with your own key',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    features: ['Encrypted with your key', 'Access from any device', 'Private storage'],
    requiresRecipient: false,
  },
  {
    id: 'quick',
    title: 'Quick Share',
    description: 'Public link anyone can access',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    features: ['No encryption', 'Public URL', 'Easy sharing'],
    requiresRecipient: false,
  },
]

/**
 * Format file size for display
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * ModeSelection props
 */
interface ModeSelectionProps {
  mode: UploadMode
  onModeChange: (mode: UploadMode) => void
  file: File
  recipient?: { displayName: string } | null
  onUpload: () => void
  onBack: () => void
  isUploading: boolean
}

/**
 * ModeSelection component
 */
export function ModeSelection({
  mode,
  onModeChange,
  file,
  recipient,
  onUpload,
  onBack,
  isUploading,
}: ModeSelectionProps) {
  const handleModeClick = useCallback(
    (newMode: UploadMode) => {
      onModeChange(newMode)
    },
    [onModeChange]
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          How would you like to share?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose an upload mode for your file
        </p>
      </div>

      {/* File summary */}
      <Card padding="sm" className="bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatSize(file.size)}</p>
          </div>
          {recipient && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">To:</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {recipient.displayName}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mode options */}
      <div className="grid gap-4">
        {MODES.map((option) => {
          const isSelected = mode === option.id
          const isDisabled = option.requiresRecipient && !recipient

          return (
            <button
              key={option.id}
              onClick={() => handleModeClick(option.id)}
              disabled={isDisabled}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isDisabled
                    ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {option.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {option.title}
                    </h3>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {option.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isUploading}>
          Back
        </Button>
        <Button onClick={onUpload} isLoading={isUploading} size="lg">
          {mode === 'send' ? 'Send File' : mode === 'store' ? 'Store File' : 'Share File'}
        </Button>
      </div>
    </div>
  )
}

export default ModeSelection
