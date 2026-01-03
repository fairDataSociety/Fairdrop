/**
 * ConfirmUpload Component
 *
 * Simple confirmation step before upload.
 * Shows file info, recipient (if send mode), and upload button.
 */

import { Button, Card } from '@/shared/components'
import type { UploadMode } from '@/shared/types'
import { formatFileSize } from '@/shared/utils/format'

/**
 * Get mode display info
 */
function getModeInfo(mode: UploadMode): { title: string; description: string } {
  switch (mode) {
    case 'send':
      return {
        title: 'Send Encrypted',
        description: 'File will be encrypted and sent to the recipient',
      }
    case 'store':
      return {
        title: 'Store Encrypted',
        description: 'File will be encrypted with your key for private storage',
      }
    case 'quick':
    default:
      return {
        title: 'Quick Share',
        description: 'File will be uploaded without encryption for easy sharing',
      }
  }
}

/**
 * ConfirmUpload props
 */
interface ConfirmUploadProps {
  mode: UploadMode
  file: File
  recipient?: { displayName: string } | null
  onUpload: () => void
  onBack: () => void
  isUploading: boolean
}

/**
 * ConfirmUpload component
 */
export function ConfirmUpload({
  mode,
  file,
  recipient,
  onUpload,
  onBack,
  isUploading,
}: ConfirmUploadProps) {
  const modeInfo = getModeInfo(mode)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {modeInfo.title}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{modeInfo.description}</p>
      </div>

      {/* File info */}
      <Card padding="md" className="bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
          </div>
        </div>
      </Card>

      {/* Recipient info (for send mode) */}
      {mode === 'send' && recipient && (
        <Card padding="md" className="bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">Sending to</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {recipient.displayName}
              </p>
            </div>
          </div>
        </Card>
      )}

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

export default ConfirmUpload
