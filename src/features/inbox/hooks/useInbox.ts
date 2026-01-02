/**
 * useInbox Hook
 *
 * Inbox management hook that wraps the inbox store
 * with additional logic for message handling.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useInboxStore } from '../stores/inboxStore'
import { useAccountStore } from '@/features/account/stores/accountStore'
import type { Message, InboxParams } from '@/shared/types'

/**
 * Message tab type
 */
export type MessageTab = 'received' | 'sent' | 'stored'

/**
 * Hook return type
 */
interface UseInboxReturn {
  // Messages by type
  received: Message[]
  sent: Message[]
  stored: Message[]

  // Current tab messages
  messages: Message[]
  activeTab: MessageTab

  // State
  isLoading: boolean
  isSyncing: boolean
  isSubscribed: boolean
  lastSync: number | null
  error: string | null

  // Actions
  loadMessages: () => void
  syncInbox: () => Promise<void>
  deleteMessage: (type: MessageTab, reference: string) => void
  subscribe: () => void
  unsubscribe: () => void
  clearError: () => void

  // Computed
  totalCount: number
  unreadCount: number
  hasAccount: boolean
  hasInboxParams: boolean
}

/**
 * useInbox hook
 */
export function useInbox(tab: MessageTab = 'received'): UseInboxReturn {
  // Get inbox store state and actions
  const received = useInboxStore((s) => s.received)
  const sent = useInboxStore((s) => s.sent)
  const stored = useInboxStore((s) => s.stored)
  const isLoading = useInboxStore((s) => s.isLoading)
  const isSyncing = useInboxStore((s) => s.isSyncing)
  const isSubscribed = useInboxStore((s) => s.isSubscribed)
  const lastSync = useInboxStore((s) => s.lastSync)
  const error = useInboxStore((s) => s.error)

  const storeLoadMessages = useInboxStore((s) => s.loadMessages)
  const storeSyncInbox = useInboxStore((s) => s.syncInbox)
  const storeDeleteMessage = useInboxStore((s) => s.deleteMessage)
  const storeSubscribe = useInboxStore((s) => s.subscribe)
  const storeUnsubscribe = useInboxStore((s) => s.unsubscribe)
  const clearError = useInboxStore((s) => s.clearError)

  // Get active account
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isUnlocked = useAccountStore((s) => s.isUnlocked)

  // Get messages for current tab
  const messages = useMemo(() => {
    switch (tab) {
      case 'received':
        return received
      case 'sent':
        return sent
      case 'stored':
        return stored
      default:
        return received
    }
  }, [tab, received, sent, stored])

  // Load messages when account changes
  const loadMessages = useCallback(() => {
    if (activeAccount?.subdomain) {
      storeLoadMessages(activeAccount.subdomain)
    }
  }, [activeAccount?.subdomain, storeLoadMessages])

  // Sync inbox with GSOC
  const syncInbox = useCallback(async () => {
    if (!activeAccount?.subdomain) return

    // For now, we need inbox params from somewhere
    // This would come from ENS or account settings
    // TODO: Get inbox params from account or ENS
    const inboxParams: InboxParams | null = null

    if (inboxParams) {
      await storeSyncInbox(activeAccount.subdomain, inboxParams)
    }
  }, [activeAccount?.subdomain, storeSyncInbox])

  // Delete message
  const deleteMessage = useCallback(
    (type: MessageTab, reference: string) => {
      if (activeAccount?.subdomain) {
        storeDeleteMessage(activeAccount.subdomain, type, reference)
      }
    },
    [activeAccount?.subdomain, storeDeleteMessage]
  )

  // Subscribe to real-time updates
  const subscribe = useCallback(() => {
    if (!activeAccount?.subdomain) return

    // TODO: Get inbox params from account or ENS
    const inboxParams: InboxParams | null = null

    if (inboxParams) {
      storeSubscribe(activeAccount.subdomain, inboxParams)
    }
  }, [activeAccount?.subdomain, storeSubscribe])

  // Unsubscribe
  const unsubscribe = useCallback(() => {
    storeUnsubscribe()
  }, [storeUnsubscribe])

  // Auto-load messages when account is unlocked
  useEffect(() => {
    if (isUnlocked && activeAccount?.subdomain) {
      loadMessages()
    }
  }, [isUnlocked, activeAccount?.subdomain, loadMessages])

  // Computed values
  const totalCount = received.length + sent.length + stored.length
  const unreadCount = 0 // TODO: Implement unread tracking
  const hasAccount = isUnlocked && activeAccount !== null
  const hasInboxParams = false // TODO: Check if account has inbox params

  return {
    // Messages by type
    received,
    sent,
    stored,

    // Current tab
    messages,
    activeTab: tab,

    // State
    isLoading,
    isSyncing,
    isSubscribed,
    lastSync,
    error,

    // Actions
    loadMessages,
    syncInbox,
    deleteMessage,
    subscribe,
    unsubscribe,
    clearError,

    // Computed
    totalCount,
    unreadCount,
    hasAccount,
    hasInboxParams,
  }
}

export default useInbox
