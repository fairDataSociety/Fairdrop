/**
 * HonestInboxManager Component
 *
 * Lists and manages all Honest Inboxes.
 * Allows viewing, copying links, and deleting inboxes.
 */

import { useState, useCallback } from 'react'
import { useHonestInbox } from '../hooks/useHonestInbox'
import { HonestInboxCreate } from './HonestInboxCreate'
import { Button, Card, Badge, Modal } from '@/shared/components'
import type { HonestInbox } from '@/shared/types'

/**
 * HonestInboxManager props
 */
interface HonestInboxManagerProps {
  onInboxSelect?: (inbox: HonestInbox) => void
}

/**
 * Format date
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Inbox row component
 */
function InboxRow({
  inbox,
  onSelect,
  onCopyLink,
  onDelete,
}: {
  inbox: HonestInbox
  onSelect: () => void
  onCopyLink: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
        <span className="text-2xl">📥</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {inbox.name}
          </h3>
          {inbox.gsocParams && (
            <Badge variant="info" size="sm">
              GSOC
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Created {formatDate(inbox.created)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={onCopyLink} title="Copy Link">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
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

/**
 * Empty state
 */
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">📥</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No Honest Inboxes
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        Create an inbox to receive anonymous files from others.
      </p>
      <Button onClick={onCreateClick}>Create Inbox</Button>
    </div>
  )
}

/**
 * HonestInboxManager component
 */
export function HonestInboxManager({ onInboxSelect }: HonestInboxManagerProps) {
  const {
    inboxes,
    isLoading,
    error,
    selectInbox,
    getInboxLink,
    deleteInbox,
    hasInboxes,
    clearError,
  } = useHonestInbox()

  const [showCreate, setShowCreate] = useState(false)
  const [inboxToDelete, setInboxToDelete] = useState<HonestInbox | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Handle create click
  const handleCreateClick = useCallback(() => {
    setShowCreate(true)
  }, [])

  // Handle create cancel
  const handleCreateCancel = useCallback(() => {
    setShowCreate(false)
  }, [])

  // Handle inbox created
  const handleInboxCreated = useCallback(
    (inbox: HonestInbox) => {
      setShowCreate(false)
      selectInbox(inbox)
      onInboxSelect?.(inbox)
    },
    [selectInbox, onInboxSelect]
  )

  // Handle inbox select
  const handleInboxSelect = useCallback(
    (inbox: HonestInbox) => {
      selectInbox(inbox)
      onInboxSelect?.(inbox)
    },
    [selectInbox, onInboxSelect]
  )

  // Handle copy link
  const handleCopyLink = useCallback(
    (inbox: HonestInbox) => {
      const link = getInboxLink(inbox)
      navigator.clipboard.writeText(link)
      setCopiedId(inbox.id)
      setTimeout(() => setCopiedId(null), 2000)
    },
    [getInboxLink]
  )

  // Handle delete click
  const handleDeleteClick = useCallback((inbox: HonestInbox) => {
    setInboxToDelete(inbox)
  }, [])

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(() => {
    if (inboxToDelete) {
      deleteInbox(inboxToDelete.id)
      setInboxToDelete(null)
    }
  }, [inboxToDelete, deleteInbox])

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setInboxToDelete(null)
  }, [])

  // Show create form
  if (showCreate) {
    return <HonestInboxCreate onCreated={handleInboxCreated} onCancel={handleCreateCancel} />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Honest Inboxes
        </h2>
        {hasInboxes && (
          <Button variant="primary" size="sm" onClick={handleCreateClick}>
            New Inbox
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Copied toast */}
      {copiedId && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Link copied to clipboard!
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card padding="lg">
          <div className="flex items-center justify-center py-8">
            <svg
              className="w-8 h-8 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !hasInboxes && <EmptyState onCreateClick={handleCreateClick} />}

      {/* Inbox list */}
      {!isLoading && hasInboxes && (
        <Card padding="none">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {inboxes.map((inbox) => (
              <InboxRow
                key={inbox.id}
                inbox={inbox}
                onSelect={() => handleInboxSelect(inbox)}
                onCopyLink={() => handleCopyLink(inbox)}
                onDelete={() => handleDeleteClick(inbox)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={inboxToDelete !== null}
        onClose={handleDeleteCancel}
        title="Delete Inbox?"
      >
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900 dark:text-gray-100">
              {inboxToDelete?.name}
            </strong>
            ?
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            This action cannot be undone. You will lose access to all messages sent to this inbox.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default HonestInboxManager
