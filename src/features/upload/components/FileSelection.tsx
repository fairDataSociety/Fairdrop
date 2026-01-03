/**
 * FileSelection Component
 *
 * File selection step with dropzone and file info display.
 */

import { useCallback, useMemo, useEffect, useRef } from 'react'
import { FileDropzone } from '@/shared/components'
import { Button } from '@/shared/components'
import { formatFileSize } from '@/shared/utils/format'

/**
 * Get file type icon
 */
function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return '📦'
  if (type.includes('text') || type.includes('document')) return '📝'
  return '📎'
}

/**
 * FileSelection props
 */
interface FileSelectionProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  onContinue: () => void
  maxSize?: number
}

/**
 * FileSelection component
 */
export function FileSelection({
  file,
  onFileSelect,
  onContinue,
  maxSize = 100 * 1024 * 1024, // 100MB default
}: FileSelectionProps) {
  // Create object URL for image preview with proper cleanup
  const previewUrlRef = useRef<string | null>(null)

  const previewUrl = useMemo(() => {
    // Revoke previous URL if exists
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    // Create new URL for image files
    if (file?.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      return url
    }
    return null
  }, [file])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const selectedFile = files[0]
      if (selectedFile) {
        onFileSelect(selectedFile)
      }
    },
    [onFileSelect]
  )

  const handleClear = useCallback(() => {
    onFileSelect(null)
  }, [onFileSelect])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Select a file
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose a file to share securely via Swarm
        </p>
      </div>

      {!file ? (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          maxSize={maxSize}
          multiple={false}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            {/* File icon */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
              {getFileIcon(file.type)}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatFileSize(file.size)}
                {file.type && ` · ${file.type}`}
              </p>
            </div>

            {/* Clear button */}
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Change
            </Button>
          </div>

          {/* Preview for images */}
          {previewUrl && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-h-48 w-full object-contain"
              />
            </div>
          )}
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={!file} size="lg">
          Continue
        </Button>
      </div>
    </div>
  )
}

export default FileSelection
