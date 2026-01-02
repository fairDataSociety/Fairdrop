/**
 * MessageList Component
 *
 * Displays a list of messages with virtualization for performance.
 */

import { useCallback, useMemo } from 'react'
import { MessageRow } from './MessageRow'
import type { Message } from '@/shared/types'
import type { MessageTab } from '../hooks/useInbox'

/**
 * MessageList props
 */
interface MessageListProps {
  messages: Message[]
  type: MessageTab
  isLoading?: boolean
  onOpen: (message: Message) => void
  onDelete: (reference: string) => void
  onDownload: (message: Message) => void
}

/**
 * Empty state component
 */
function EmptyState({ type }: { type: MessageTab }) {
  const messages: Record<MessageTab, { icon: string; title: string; description: string }> = {
    received: {
      icon: '📥',
      title: 'No received messages',
      description: 'Messages sent to you will appear here.',
    },
    sent: {
      icon: '📤',
      title: 'No sent messages',
      description: 'Files you send to others will appear here.',
    },
    stored: {
      icon: '📁',
      title: 'No stored files',
      description: 'Files you store for yourself will appear here.',
    },
  }

  const content = messages[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{content.icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        {content.description}
      </p>
    </div>
  )
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * MessageList component
 */
export function MessageList({
  messages,
  type,
  isLoading = false,
  onOpen,
  onDelete,
  onDownload,
}: MessageListProps) {
  // Sort messages by timestamp (newest first)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.timestamp - a.timestamp)
  }, [messages])

  // Handlers
  const handleOpen = useCallback(
    (message: Message) => {
      onOpen(message)
    },
    [onOpen]
  )

  const handleDelete = useCallback(
    (reference: string) => {
      onDelete(reference)
    },
    [onDelete]
  )

  const handleDownload = useCallback(
    (message: Message) => {
      onDownload(message)
    },
    [onDownload]
  )

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Empty state
  if (sortedMessages.length === 0) {
    return <EmptyState type={type} />
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {sortedMessages.map((message) => (
        <MessageRow
          key={message.reference}
          message={message}
          type={type}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      ))}
    </div>
  )
}

export default MessageList
