/**
 * useHonestInbox Hook
 *
 * Provides access to honest inbox functionality with
 * additional convenience methods and computed state.
 */

import { useCallback, useEffect } from 'react'
import { useHonestInboxStore } from '../stores/honestInboxStore'
import type { HonestInbox } from '@/shared/types'

/**
 * Hook return type
 */
interface UseHonestInboxReturn {
  // Inboxes
  inboxes: HonestInbox[]
  activeInbox: HonestInbox | null
  isLoading: boolean
  error: string | null

  // Messages
  messages: Array<{
    reference: string
    timestamp: number
    index: number
  }>
  isLoadingMessages: boolean
  isSubscribed: boolean

  // Actions
  loadInboxes: () => void
  createInbox: (name: string, targetOverlay?: string) => Promise<HonestInbox>
  deleteInbox: (id: string) => void
  selectInbox: (inbox: HonestInbox | null) => void
  getInboxLink: (inbox: HonestInbox) => string
  loadMessages: () => Promise<void>
  refreshMessages: () => Promise<void>
  subscribe: () => void
  unsubscribe: () => void
  clearError: () => void

  // Computed
  hasInboxes: boolean
  hasActiveInbox: boolean
  hasGsocParams: boolean
  messageCount: number
}

/**
 * useHonestInbox hook
 */
export function useHonestInbox(): UseHonestInboxReturn {
  // Get store state
  const inboxes = useHonestInboxStore((s) => s.inboxes)
  const activeInbox = useHonestInboxStore((s) => s.activeInbox)
  const isLoading = useHonestInboxStore((s) => s.isLoading)
  const error = useHonestInboxStore((s) => s.error)
  const messages = useHonestInboxStore((s) => s.messages)
  const isLoadingMessages = useHonestInboxStore((s) => s.isLoadingMessages)
  const isSubscribed = useHonestInboxStore((s) => s.isSubscribed)

  // Get store actions
  const storeLoadInboxes = useHonestInboxStore((s) => s.loadInboxes)
  const storeCreateInbox = useHonestInboxStore((s) => s.createInbox)
  const storeDeleteInbox = useHonestInboxStore((s) => s.deleteInbox)
  const storeSetActiveInbox = useHonestInboxStore((s) => s.setActiveInbox)
  const storeGetInboxLink = useHonestInboxStore((s) => s.getInboxLink)
  const storeLoadMessages = useHonestInboxStore((s) => s.loadMessages)
  const storeRefreshMessages = useHonestInboxStore((s) => s.refreshMessages)
  const storeSubscribe = useHonestInboxStore((s) => s.subscribe)
  const storeUnsubscribe = useHonestInboxStore((s) => s.unsubscribe)
  const storeClearError = useHonestInboxStore((s) => s.clearError)

  // Load inboxes on mount
  useEffect(() => {
    storeLoadInboxes()
  }, [storeLoadInboxes])

  // Actions with proper typing
  const loadInboxes = useCallback(() => {
    storeLoadInboxes()
  }, [storeLoadInboxes])

  const createInbox = useCallback(
    async (name: string, targetOverlay?: string): Promise<HonestInbox> => {
      return storeCreateInbox(name, targetOverlay)
    },
    [storeCreateInbox]
  )

  const deleteInbox = useCallback(
    (id: string) => {
      storeDeleteInbox(id)
    },
    [storeDeleteInbox]
  )

  const selectInbox = useCallback(
    (inbox: HonestInbox | null) => {
      storeSetActiveInbox(inbox)
    },
    [storeSetActiveInbox]
  )

  const getInboxLink = useCallback(
    (inbox: HonestInbox): string => {
      return storeGetInboxLink(inbox)
    },
    [storeGetInboxLink]
  )

  const loadMessages = useCallback(async () => {
    await storeLoadMessages()
  }, [storeLoadMessages])

  const refreshMessages = useCallback(async () => {
    await storeRefreshMessages()
  }, [storeRefreshMessages])

  const subscribe = useCallback(() => {
    storeSubscribe()
  }, [storeSubscribe])

  const unsubscribe = useCallback(() => {
    storeUnsubscribe()
  }, [storeUnsubscribe])

  const clearError = useCallback(() => {
    storeClearError()
  }, [storeClearError])

  // Computed values
  const hasInboxes = inboxes.length > 0
  const hasActiveInbox = activeInbox !== null
  const hasGsocParams = activeInbox?.gsocParams !== undefined
  const messageCount = messages.length

  return {
    // State
    inboxes,
    activeInbox,
    isLoading,
    error,
    messages,
    isLoadingMessages,
    isSubscribed,

    // Actions
    loadInboxes,
    createInbox,
    deleteInbox,
    selectInbox,
    getInboxLink,
    loadMessages,
    refreshMessages,
    subscribe,
    unsubscribe,
    clearError,

    // Computed
    hasInboxes,
    hasActiveInbox,
    hasGsocParams,
    messageCount,
  }
}

export default useHonestInbox
