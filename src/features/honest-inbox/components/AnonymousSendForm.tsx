/**
 * AnonymousSendForm Component
 *
 * Form for sending files anonymously to a Honest Inbox.
 * No account or identity required - sender remains anonymous.
 */

import { useCallback } from 'react'
import { useAnonymousSend } from '../hooks/useAnonymousSend'
import { Button, Card, Progress, FileDropzone } from '@/shared/components'

/**
 * AnonymousSendForm props
 */
interface AnonymousSendFormProps {
  recipientPublicKey: string
  recipientName?: string
  onComplete?: (reference: string, downloadUrl: string) => void
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * AnonymousSendForm component
 */
export function AnonymousSendForm({
  recipientPublicKey,
  recipientName,
  onComplete,
}: AnonymousSendFormProps) {
  const {
    file,
    status,
    progress,
    result,
    error,
    setFile,
    setRecipientPublicKey,
    send,
    reset,
    canSend,
    isIdle,
    isComplete,
    hasError,
  } = useAnonymousSend()

  // Set recipient public key on mount/change
  if (recipientPublicKey && recipientPublicKey !== '') {
    setRecipientPublicKey(recipientPublicKey)
  }

  // Handle file selection
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const selectedFile = files[0]
      if (selectedFile) {
        setFile(selectedFile)
      }
    },
    [setFile]
  )

  // Handle send
  const handleSend = useCallback(async () => {
    try {
      const sendResult = await send()
      onComplete?.(sendResult.reference, sendResult.downloadUrl)
    } catch {
      // Error is handled by the hook
    }
  }, [send, onComplete])

  // Handle reset
  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  // Handle copy link
  const handleCopyLink = useCallback(() => {
    if (result?.downloadUrl) {
      navigator.clipboard.writeText(result.downloadUrl)
    }
  }, [result])

  // Render completed state
  if (isComplete && result) {
    return (
      <Card padding="lg" className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sent Anonymously
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your file has been encrypted and sent. The recipient will not know who you are.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Download Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-gray-700 px-3 py-2 rounded font-mono truncate">
              {result.downloadUrl}
            </code>
            <Button variant="secondary" size="sm" onClick={handleCopyLink}>
              Copy
            </Button>
          </div>
        </div>

        <Button onClick={handleReset}>Send Another File</Button>
      </Card>
    )
  }

  // Get status message
  const getStatusMessage = (): string => {
    switch (status) {
      case 'encrypting':
        return 'Encrypting file...'
      case 'uploading':
        return 'Uploading to Swarm...'
      case 'error':
        return error || 'An error occurred'
      default:
        return ''
    }
  }

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🕵️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Send Anonymously
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {recipientName ? (
            <>
              Send a file to <strong>{recipientName}</strong> without revealing your identity.
            </>
          ) : (
            'Send a file without revealing your identity.'
          )}
        </p>
      </div>

      {/* File selection */}
      {!file ? (
        <FileDropzone onFilesSelected={handleFilesSelected} className="mb-6" />
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
              📄
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatSize(file.size)}
              </p>
            </div>
            {isIdle && (
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {!isIdle && !isComplete && !hasError && (
        <div className="mb-6">
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {getStatusMessage()}
          </p>
        </div>
      )}

      {/* Error */}
      {hasError && error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="min-w-[200px]"
        >
          Send Anonymously
        </Button>
      </div>

      {/* Privacy notice */}
      <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
        Your identity is not stored or transmitted. The recipient will only receive the encrypted
        file.
      </p>
    </Card>
  )
}

export default AnonymousSendForm
