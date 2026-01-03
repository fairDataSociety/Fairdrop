/**
 * InboxLayout Component
 *
 * Main inbox container that orchestrates navigation,
 * message list, and sync functionality.
 */

import { useState, useCallback, useEffect } from 'react'
import { useInbox, type MessageTab } from '../hooks/useInbox'
import { InboxNav } from './InboxNav'
import { MessageList } from './MessageList'
import { Button, Card } from '@/shared/components'
import { CreateAccountModal, UnlockModal, AccountSelector } from '@/features/account/components'
import { useAccountList } from '@/features/account/hooks/useAccountList'
import type { Message } from '@/shared/types'

/**
 * InboxLayout props
 */
interface InboxLayoutProps {
  initialTab?: MessageTab
  onMessageOpen?: (message: Message) => void
  onMessageDownload?: (message: Message) => void
}

/**
 * Format last sync time
 */
function formatLastSync(timestamp: number | null): string {
  if (!timestamp) return 'Never synced'

  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return new Date(timestamp).toLocaleDateString()
}

/**
 * InboxLayout component
 */
export function InboxLayout({
  initialTab = 'received',
  onMessageOpen,
  onMessageDownload,
}: InboxLayoutProps) {
  const [activeTab, setActiveTab] = useState<MessageTab>(initialTab)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [selectedAccountToUnlock, setSelectedAccountToUnlock] = useState<string | null>(null)

  // Get account list for login UI
  const { accounts, hasAccounts } = useAccountList()

  const {
    received,
    sent,
    stored,
    messages,
    isLoading,
    isSyncing,
    lastSync,
    error,
    loadMessages,
    syncInbox,
    deleteMessage,
    clearError,
    hasAccount,
    hasInboxParams,
  } = useInbox(activeTab)

  // Handle tab change
  const handleTabChange = useCallback((tab: MessageTab) => {
    setActiveTab(tab)
  }, [])

  // Handle message open
  const handleMessageOpen = useCallback(
    (message: Message) => {
      onMessageOpen?.(message)
    },
    [onMessageOpen]
  )

  // Handle message delete
  const handleMessageDelete = useCallback(
    (reference: string) => {
      deleteMessage(activeTab, reference)
    },
    [activeTab, deleteMessage]
  )

  // Handle message download
  const handleMessageDownload = useCallback(
    (message: Message) => {
      onMessageDownload?.(message)
    },
    [onMessageDownload]
  )

  // Handle sync
  const handleSync = useCallback(async () => {
    await syncInbox()
  }, [syncInbox])

  // Load messages on mount
  useEffect(() => {
    if (hasAccount) {
      loadMessages()
    }
  }, [hasAccount, loadMessages])

  // Counts for nav badges
  const counts = {
    received: received.length,
    sent: sent.length,
    stored: stored.length,
  }

  // Handle unlock account click
  const handleUnlockAccount = useCallback((subdomain: string) => {
    setSelectedAccountToUnlock(subdomain)
    setShowUnlockModal(true)
  }, [])

  // No account state - show login/register UI
  if (!hasAccount) {
    return (
      <>
        <div className="dropbox content-honest-inbox">
          <div className="dropbox-center">
            <h2>Welcome to your Fairdrop Inbox</h2>
            <p style={{ marginBottom: '30px' }}>Log in to an existing account or create a new one to access your files.</p>

            {/* Existing accounts */}
            {hasAccounts && (
              <div className="mailbox-list" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Your Accounts</h3>
                {accounts.map((account) => (
                  <div key={account.subdomain} style={{ marginBottom: '10px' }}>
                    <button
                      className="btn btn-lg btn-white"
                      onClick={() => handleUnlockAccount(account.subdomain)}
                    >
                      Unlock {account.subdomain}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Create new account button */}
            <div className="mailbox-actions">
              <button
                className="btn btn-lg btn-white"
                onClick={() => setShowCreateModal(true)}
              >
                {hasAccounts ? 'Create Another Account' : 'Create New Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />

        {/* Unlock Account Modal */}
        {selectedAccountToUnlock && (
          <UnlockModal
            isOpen={showUnlockModal}
            onClose={() => {
              setShowUnlockModal(false)
              setSelectedAccountToUnlock(null)
            }}
            subdomain={selectedAccountToUnlock}
            onUnlocked={() => {
              setShowUnlockModal(false)
              setSelectedAccountToUnlock(null)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Inbox
        </h1>
        <div className="flex items-center gap-4">
          {/* Last sync info */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatLastSync(lastSync)}
          </span>

          {/* Sync button */}
          {hasInboxParams && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
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
                  Syncing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </span>
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

      {/* Navigation tabs */}
      <InboxNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
        isLoading={isLoading}
      />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto mt-4">
        <MessageList
          messages={messages}
          type={activeTab}
          isLoading={isLoading}
          onOpen={handleMessageOpen}
          onDelete={handleMessageDelete}
          onDownload={handleMessageDownload}
        />
      </div>
    </div>
  )
}

export default InboxLayout
