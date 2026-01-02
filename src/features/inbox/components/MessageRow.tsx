/**
 * MessageRow Component
 *
 * Single message item in the inbox list.
 */

import { useCallback } from 'react'
import { Button, Badge } from '@/shared/components'
import type { Message } from '@/shared/types'

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
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString()
  } else if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return 'Just now'
  }
}

/**
 * Get file type icon
 */
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return '🖼️'
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return '🎬'
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) return '🎵'
  if (ext === 'pdf') return '📄'
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext || '')) return '📦'
  if (['doc', 'docx', 'txt', 'md'].includes(ext || '')) return '📝'
  return '📎'
}

/**
 * MessageRow props
 */
interface MessageRowProps {
  message: Message
  type: 'received' | 'sent' | 'stored'
  onOpen: (message: Message) => void
  onDelete: (reference: string) => void
  onDownload: (message: Message) => void
}

/**
 * MessageRow component
 */
export function MessageRow({
  message,
  type,
  onOpen,
  onDelete,
  onDownload,
}: MessageRowProps) {
  const handleOpen = useCallback(() => {
    onOpen(message)
  }, [message, onOpen])

  const handleDelete = useCallback(() => {
    onDelete(message.reference)
  }, [message.reference, onDelete])

  const handleDownload = useCallback(() => {
    onDownload(message)
  }, [message, onDownload])

  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
      {/* File icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
        {getFileIcon(message.filename)}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleOpen}>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {message.filename}
          </h3>
          {message.encrypted && (
            <Badge variant="info" size="sm">
              Encrypted
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
          {message.size > 0 && <span>{formatSize(message.size)}</span>}
          {type === 'received' && message.from && (
            <>
              <span>·</span>
              <span>from {message.from}</span>
            </>
          )}
          {type === 'sent' && message.to && (
            <>
              <span>·</span>
              <span>to {message.to}</span>
            </>
          )}
          <span>·</span>
          <span>{formatRelativeTime(message.timestamp)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          title="Download"
        >
          <svg
            className="w-4 h-4"
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
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Delete"
        >
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </div>
    </div>
  )
}

export default MessageRow
