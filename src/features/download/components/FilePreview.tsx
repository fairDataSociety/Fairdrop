/**
 * FilePreview Component
 *
 * Previews downloaded files (images, videos, audio, PDFs, text).
 */

import { useState, useEffect } from 'react'
import { Button, Badge } from '@/shared/components'

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
 * FilePreview props
 */
interface FilePreviewProps {
  blobUrl: string | null
  filename: string | null
  contentType: string | null
  fileSize?: number
  isEncrypted: boolean
  onDownload: () => void
}

/**
 * FilePreview component
 */
export function FilePreview({
  blobUrl,
  filename,
  contentType,
  fileSize,
  isEncrypted,
  onDownload,
}: FilePreviewProps) {
  const [textContent, setTextContent] = useState<string | null>(null)

  // Load text content for text files
  useEffect(() => {
    if (blobUrl && contentType?.startsWith('text/')) {
      fetch(blobUrl)
        .then((res) => res.text())
        .then(setTextContent)
        .catch(() => setTextContent(null))
    } else {
      setTextContent(null)
    }
  }, [blobUrl, contentType])

  const isImage = contentType?.startsWith('image/')
  const isVideo = contentType?.startsWith('video/')
  const isAudio = contentType?.startsWith('audio/')
  const isPdf = contentType === 'application/pdf'
  const isText = contentType?.startsWith('text/')

  const canPreview = blobUrl && (isImage || isVideo || isAudio || isPdf || isText)

  return (
    <div className="space-y-6">
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          File Ready
        </h2>
      </div>

      {/* File info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
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
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {filename || 'Unknown file'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {fileSize && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatSize(fileSize)}
                </span>
              )}
              {contentType && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  · {contentType}
                </span>
              )}
            </div>
          </div>
          {isEncrypted && <Badge variant="success">Decrypted</Badge>}
        </div>
      </div>

      {/* Preview area */}
      {canPreview && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {isImage && blobUrl && (
            <img
              src={blobUrl}
              alt={filename || 'Preview'}
              className="max-h-96 w-full object-contain bg-gray-100 dark:bg-gray-800"
            />
          )}

          {isVideo && blobUrl && (
            <video
              src={blobUrl}
              controls
              className="max-h-96 w-full bg-black"
            >
              Your browser does not support video playback.
            </video>
          )}

          {isAudio && blobUrl && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800">
              <audio src={blobUrl} controls className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {isPdf && blobUrl && (
            <iframe
              src={blobUrl}
              title={filename || 'PDF Preview'}
              className="w-full h-96"
            />
          )}

          {isText && textContent && (
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 overflow-auto max-h-96 text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
              {textContent}
            </pre>
          )}
        </div>
      )}

      {/* No preview available */}
      {!canPreview && blobUrl && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <svg
            className="mx-auto w-12 h-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            No preview available for this file type
          </p>
        </div>
      )}

      {/* Download button */}
      <div className="flex justify-center">
        <Button onClick={onDownload} size="lg">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download File
        </Button>
      </div>
    </div>
  )
}

export default FilePreview
