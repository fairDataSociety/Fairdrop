/**
 * FileDropzone Component
 *
 * Drag-and-drop file selection area.
 * Uses Tailwind CSS for styling.
 */

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'

/**
 * Dropzone props
 */
interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string // MIME types, e.g., "image/*,application/pdf"
  multiple?: boolean
  maxSize?: number // Max file size in bytes
  maxFiles?: number
  disabled?: boolean
  className?: string
}

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
 * Upload icon
 */
function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

/**
 * FileDropzone component
 */
export function FileDropzone({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  disabled = false,
  className = '',
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error: string | null } => {
      const validFiles: File[] = []
      let errorMsg: string | null = null

      // Check file count
      if (!multiple && files.length > 1) {
        // files[0] is guaranteed to exist since files.length > 1
        return { valid: [files[0] as File], error: 'Only one file allowed' }
      }

      if (files.length > maxFiles) {
        return { valid: [], error: `Maximum ${maxFiles} files allowed` }
      }

      // Validate each file
      for (const file of files) {
        // Check file size
        if (maxSize && file.size > maxSize) {
          errorMsg = `File "${file.name}" exceeds maximum size of ${formatSize(maxSize)}`
          continue
        }

        // Check file type if accept is specified
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim())
          const isAccepted = acceptedTypes.some((type) => {
            if (type.endsWith('/*')) {
              // Wildcard MIME type (e.g., "image/*")
              const category = type.slice(0, -2)
              return file.type.startsWith(category)
            }
            return file.type === type || file.name.endsWith(type)
          })

          if (!isAccepted) {
            errorMsg = `File type "${file.type || 'unknown'}" is not accepted`
            continue
          }
        }

        validFiles.push(file)
      }

      return { valid: validFiles, error: errorMsg }
    },
    [accept, maxSize, maxFiles, multiple]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return

      const fileArray = Array.from(files)
      const { valid, error: validationError } = validateFiles(fileArray)

      setError(validationError)

      if (valid.length > 0) {
        onFilesSelected(valid)
      }
    },
    [onFilesSelected, validateFiles, disabled]
  )

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (!disabled) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles, disabled]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [handleFiles]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  const baseClasses =
    'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'

  const stateClasses = disabled
    ? 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
    : isDragging
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'

  const classes = [baseClasses, stateClasses, className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-hidden="true"
      />

      <UploadIcon />

      <div className="mt-4 text-center">
        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
          {isDragging ? 'Drop files here' : 'Drag files here or click to browse'}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {multiple ? `Up to ${maxFiles} files` : 'Single file'}
          {maxSize && ` · Max ${formatSize(maxSize)}`}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default FileDropzone
