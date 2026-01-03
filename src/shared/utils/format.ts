/**
 * Shared formatting utilities
 */

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Maximum file size in bytes (100MB)
 */
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

/**
 * Maximum file size in MB
 */
export const MAX_FILE_SIZE_MB = 100
