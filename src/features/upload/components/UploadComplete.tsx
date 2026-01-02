/**
 * UploadComplete Component
 *
 * Shows upload success with shareable link and QR code.
 */

import { useState, useCallback } from 'react'
import { Button, Card } from '@/shared/components'
import type { UploadMode } from '@/shared/types'

/**
 * UploadComplete props
 */
interface UploadCompleteProps {
  result: {
    reference: string
    url: string
    ephemeralPublicKey?: string
  }
  mode: UploadMode
  fileName: string
  recipient?: { displayName: string } | null
  onUploadAnother: () => void
}

/**
 * UploadComplete component
 */
export function UploadComplete({
  result,
  mode,
  fileName,
  recipient,
  onUploadAnother,
}: UploadCompleteProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [result.url])

  const handleCopyReference = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [result.reference])

  // Get success message based on mode
  const getMessage = () => {
    switch (mode) {
      case 'send':
        return `File sent to ${recipient?.displayName || 'recipient'}`
      case 'store':
        return 'File stored securely'
      case 'quick':
        return 'File shared successfully'
      default:
        return 'Upload complete'
    }
  }

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getMessage()}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 truncate max-w-md mx-auto">
          {fileName}
        </p>
      </div>

      {/* Share link card */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result.url}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-mono truncate"
              />
              <Button onClick={handleCopyLink} variant={copied ? 'secondary' : 'primary'}>
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Swarm reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Swarm Reference
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                {result.reference}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopyReference}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Info based on mode */}
      {mode === 'send' && recipient && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Notification sent to {recipient.displayName}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                They will see this file in their inbox and can decrypt it with their private key.
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === 'quick' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Public link</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This file is not encrypted. Anyone with the link can access it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onUploadAnother} variant="primary" size="lg">
          Upload Another File
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => window.open(result.url, '_blank')}
        >
          Open Link
        </Button>
      </div>
    </div>
  )
}

export default UploadComplete
