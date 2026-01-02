/**
 * HonestInboxCreate Component
 *
 * Form for creating a new Honest Inbox.
 * Generates a keypair and optionally mines GSOC parameters.
 */

import { useState, useCallback } from 'react'
import { useHonestInbox } from '../hooks/useHonestInbox'
import { Button, Card, Input } from '@/shared/components'
import type { HonestInbox } from '@/shared/types'

/**
 * HonestInboxCreate props
 */
interface HonestInboxCreateProps {
  onCreated?: (inbox: HonestInbox) => void
  onCancel?: () => void
}

/**
 * HonestInboxCreate component
 */
export function HonestInboxCreate({ onCreated, onCancel }: HonestInboxCreateProps) {
  const { createInbox, isLoading, error, clearError } = useHonestInbox()

  const [name, setName] = useState('')
  const [enableGsoc, setEnableGsoc] = useState(false)
  const [targetOverlay, setTargetOverlay] = useState('')

  // Handle name change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value)
      if (error) clearError()
    },
    [error, clearError]
  )

  // Handle target overlay change
  const handleOverlayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetOverlay(e.target.value)
  }, [])

  // Handle GSOC toggle
  const handleGsocToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnableGsoc(e.target.checked)
  }, [])

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!name.trim()) return

    try {
      const overlay = enableGsoc && targetOverlay.trim() ? targetOverlay.trim() : undefined
      const inbox = await createInbox(name.trim(), overlay)
      onCreated?.(inbox)
    } catch {
      // Error is handled by the hook
    }
  }, [name, enableGsoc, targetOverlay, createInbox, onCreated])

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  return (
    <Card padding="lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Create Honest Inbox
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Create an inbox where others can send you files anonymously.
        </p>
      </div>

      {/* Inbox name */}
      <div className="mb-6">
        <label
          htmlFor="inbox-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Inbox Name
        </label>
        <Input
          id="inbox-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g., Anonymous Tips"
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          A friendly name to identify this inbox.
        </p>
      </div>

      {/* GSOC option */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enableGsoc}
            onChange={handleGsocToggle}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable real-time notifications (GSOC)
          </span>
        </label>
        <p className="mt-1 ml-7 text-xs text-gray-500 dark:text-gray-400">
          Allow senders to notify you when they send a file. Requires a target overlay.
        </p>
      </div>

      {/* Target overlay (conditional) */}
      {enableGsoc && (
        <div className="mb-6">
          <label
            htmlFor="target-overlay"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Target Overlay (Optional)
          </label>
          <Input
            id="target-overlay"
            type="text"
            value={targetOverlay}
            onChange={handleOverlayChange}
            placeholder="Leave empty to use default"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The Swarm node overlay address for GSOC mining. Uses default if empty.
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 mr-2 animate-spin"
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
              Creating...
            </>
          ) : (
            'Create Inbox'
          )}
        </Button>
      </div>
    </Card>
  )
}

export default HonestInboxCreate
