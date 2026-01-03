/**
 * InboxLayout Component
 *
 * Main inbox container that orchestrates navigation,
 * message list, and sync functionality.
 *
 * Login page matches original fairdrop.xyz design with:
 * - Dropdown to select existing accounts (+ "new mailbox" option)
 * - Either unlock form OR add form based on selection
 */

import { useState, useCallback, useEffect } from 'react'
import { useInbox, type MessageTab } from '../hooks/useInbox'
import { InboxNav } from './InboxNav'
import { MessageList } from './MessageList'
import { Button } from '@/shared/components'
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

  // Login form state
  const [isAddingMailbox, setIsAddingMailbox] = useState(false)
  const [selectedMailbox, setSelectedMailbox] = useState<string>('')
  const [password, setPassword] = useState('')
  const [passwordVerify, setPasswordVerify] = useState('')
  const [newMailboxName, setNewMailboxName] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Get account list and unlock function
  const { accounts, hasAccounts, createAccount, unlockAccount } = useAccountList()

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

  // Initialize selected mailbox when accounts load
  useEffect(() => {
    if (hasAccounts && !selectedMailbox && accounts[0]) {
      setSelectedMailbox(accounts[0].subdomain)
      setIsAddingMailbox(false)
    } else if (!hasAccounts) {
      setIsAddingMailbox(true)
    }
  }, [hasAccounts, accounts, selectedMailbox])

  // Handle dropdown change
  const handleSelectMailbox = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'new-mailbox') {
      setIsAddingMailbox(true)
      setSelectedMailbox('')
      setFeedbackMessage('')
    } else {
      setIsAddingMailbox(false)
      setSelectedMailbox(value)
      setFeedbackMessage('')
    }
  }, [])

  // Handle unlock mailbox
  const handleUnlockMailbox = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!selectedMailbox || !password) {
      setFeedbackMessage('Please select a mailbox and enter password')
      return
    }

    setIsProcessing(true)
    setFeedbackMessage('Unlocking mailbox...')

    try {
      await unlockAccount(selectedMailbox, password)
      setFeedbackMessage('Mailbox unlocked!')
    } catch (err) {
      setFeedbackMessage('Password invalid, please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedMailbox, password, unlockAccount])

  // Handle add mailbox
  const handleAddMailbox = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!newMailboxName) {
      setFeedbackMessage('Please enter a mailbox name')
      return
    }
    if (!password) {
      setFeedbackMessage('Please enter a password')
      return
    }
    if (password !== passwordVerify) {
      setFeedbackMessage('Passwords must match')
      return
    }

    setIsProcessing(true)
    setFeedbackMessage('Creating mailbox...')

    try {
      const account = await createAccount(newMailboxName.toLowerCase(), password)
      setFeedbackMessage('Mailbox created! Unlocking...')
      await unlockAccount(account.subdomain, password)
      setFeedbackMessage('Mailbox unlocked!')
    } catch (err) {
      setFeedbackMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [newMailboxName, password, passwordVerify, createAccount, unlockAccount])

  // Cancel adding mailbox
  const handleCancelAdd = useCallback(() => {
    setIsAddingMailbox(false)
    if (accounts[0]) {
      setSelectedMailbox(accounts[0].subdomain)
    }
    setFeedbackMessage('')
    setNewMailboxName('')
    setPassword('')
    setPasswordVerify('')
  }, [accounts])

  // No account state - show login/register UI (original fairdrop design)
  if (!hasAccount) {
    return (
      <div id="select-mailbox" className="select-mailbox white page-wrapper fade-in">
        <div className="select-mailbox-ui page-inner-centered">
          <div className="mist"></div>
          <div className="page-inner-wrapper">
            {/* Unlock existing mailbox */}
            {!isAddingMailbox && (
              <div className="unlock-mailbox">
                <h1 className="select-account-header">Log In / Register</h1>
                <div className="mailbox-unlock-ui">
                  <h2 className="select-account-header">Select mailbox</h2>
                  <div className="form-group clearfix">
                    <div className="select-mailbox-mailboxes">
                      <select
                        className="Dropdown-control"
                        value={selectedMailbox}
                        onChange={handleSelectMailbox}
                      >
                        {accounts.map((acc) => (
                          <option key={acc.subdomain} value={acc.subdomain}>
                            {acc.subdomain}
                          </option>
                        ))}
                        <option value="new-mailbox">new mailbox +</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group form-group-last clearfix">
                    <form onSubmit={handleUnlockMailbox}>
                      <input
                        id="mailbox-unlock-password"
                        autoComplete="off"
                        className="mailbox-unlock-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isProcessing}
                      />
                    </form>
                  </div>
                </div>
                <div className="ui-feedback">{feedbackMessage}</div>
                <div className="actions btn-grp">
                  <button
                    className="btn btn-lg btn-green btn-float-left"
                    onClick={handleUnlockMailbox}
                    disabled={isProcessing}
                  >
                    Unlock Mailbox
                  </button>
                </div>
              </div>
            )}

            {/* Add new mailbox */}
            {isAddingMailbox && (
              <div className="select-mailbox">
                <h1 className="select-account-header">Log In / Register</h1>
                <h2 className="select-account-header">Create mailbox</h2>
                <div className="mailbox-add-ui">
                  <form onSubmit={handleAddMailbox}>
                    <div className="form-group">
                      <input
                        disabled={isProcessing}
                        className="mailbox-add-name"
                        type="text"
                        autoComplete="new-name"
                        placeholder="Mailbox name"
                        value={newMailboxName}
                        onChange={(e) => setNewMailboxName(e.target.value.toLowerCase())}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        disabled={isProcessing}
                        className="mailbox-add-password"
                        type="password"
                        placeholder="Password"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group-last clearfix">
                      <input
                        disabled={isProcessing}
                        autoComplete="off"
                        className="mailbox-add-password-verification"
                        type="password"
                        placeholder="Verify password"
                        value={passwordVerify}
                        onChange={(e) => setPasswordVerify(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <div className="ui-feedback">{feedbackMessage}</div>
                <div className="actions btn-grp">
                  <button
                    className="btn btn-lg btn-green btn-float-left"
                    onClick={handleAddMailbox}
                    disabled={isProcessing}
                  >
                    Add Mailbox
                  </button>
                  {hasAccounts && (
                    <button
                      className="btn btn-sm btn-black btn-link btn-float-right"
                      onClick={handleCancelAdd}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
