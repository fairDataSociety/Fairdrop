/**
 * Inbox Store
 *
 * Manages inbox messages (received, sent, stored) using Zustand.
 * Handles GSOC inbox polling and real-time subscriptions.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  getMessages,
  addMessage as storageAddMessage,
  deleteMessage as storageDeleteMessage,
  type MessageType,
} from '@/services/storage'
import { pollInbox, subscribeToInbox, type InboxSubscription, type GSOCMessage } from '@/services/swarm'
import type { Message, InboxParams } from '@/shared/types'

/**
 * Inbox state
 */
interface InboxState {
  // Messages organized by type
  received: Message[]
  sent: Message[]
  stored: Message[]

  // Loading and sync state
  isLoading: boolean
  isSyncing: boolean
  lastSync: number | null
  error: string | null

  // Subscription state
  subscription: InboxSubscription | null
  isSubscribed: boolean
}

/**
 * Inbox actions
 */
interface InboxActions {
  // Message loading
  loadMessages: (subdomain: string) => void
  syncInbox: (subdomain: string, inboxParams: InboxParams) => Promise<void>

  // Message management
  addMessage: (subdomain: string, type: MessageType, message: Message) => void
  deleteMessage: (subdomain: string, type: MessageType, reference: string) => void

  // Real-time subscription
  subscribe: (subdomain: string, inboxParams: InboxParams, startIndex?: number) => void
  unsubscribe: () => void

  // State management
  clearError: () => void
  reset: () => void
}

/**
 * Combined store type
 */
type InboxStore = InboxState & InboxActions

/**
 * Initial state
 */
const initialState: InboxState = {
  received: [],
  sent: [],
  stored: [],
  isLoading: false,
  isSyncing: false,
  lastSync: null,
  error: null,
  subscription: null,
  isSubscribed: false,
}

/**
 * Convert GSOC message to our Message format
 * Note: filename/size/from are in encrypted metadata that needs decryption
 */
function gsocToMessage(gsocMsg: GSOCMessage): Message {
  return {
    reference: gsocMsg.reference,
    filename: 'Encrypted file', // Will be decrypted when opening
    size: 0, // Unknown until decrypted
    timestamp: gsocMsg.timestamp,
    encrypted: true,
  }
}

/**
 * Inbox store
 */
export const useInboxStore = create<InboxStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Load messages from storage for an account
     */
    loadMessages: (subdomain: string) => {
      set({ isLoading: true, error: null })

      try {
        const received = getMessages(subdomain, 'received')
        const sent = getMessages(subdomain, 'sent')
        const stored = getMessages(subdomain, 'stored')

        set({
          received,
          sent,
          stored,
          isLoading: false,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load messages'
        set({ error: message, isLoading: false })
      }
    },

    /**
     * Sync inbox with GSOC (poll for new messages)
     */
    syncInbox: async (subdomain: string, inboxParams: InboxParams) => {
      const { received } = get()
      set({ isSyncing: true, error: null })

      try {
        // Poll for new messages from the beginning
        const newMessages = await pollInbox(inboxParams, 0)

        // Convert GSOC messages to our Message format and filter new ones
        const messagesToAdd: Message[] = []

        for (const gsocMsg of newMessages) {
          // Check if we already have this message
          const exists = received.some((m) => m.reference === gsocMsg.reference)
          if (!exists) {
            const message = gsocToMessage(gsocMsg)
            messagesToAdd.push(message)
            // Also persist to storage
            storageAddMessage(subdomain, 'received', message)
          }
        }

        set((state) => ({
          received: [...messagesToAdd, ...state.received],
          isSyncing: false,
          lastSync: Date.now(),
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync inbox'
        set({ error: message, isSyncing: false })
      }
    },

    /**
     * Add a message to the store and persist
     */
    addMessage: (subdomain: string, type: MessageType, message: Message) => {
      // Add to storage
      storageAddMessage(subdomain, type, message)

      // Update state
      set((state) => ({
        [type]: [message, ...state[type]],
      }))
    },

    /**
     * Delete a message from the store and storage
     */
    deleteMessage: (subdomain: string, type: MessageType, reference: string) => {
      // Remove from storage
      storageDeleteMessage(subdomain, type, reference)

      // Update state
      set((state) => ({
        [type]: state[type].filter((m) => m.reference !== reference),
      }))
    },

    /**
     * Subscribe to real-time inbox updates via GSOC WebSocket
     */
    subscribe: (subdomain: string, inboxParams: InboxParams, startIndex = 0) => {
      const { subscription } = get()

      // Cancel existing subscription
      if (subscription) {
        subscription.cancel()
      }

      // Create new subscription
      const newSubscription = subscribeToInbox(inboxParams, startIndex, {
        onMessage: (gsocMsg: GSOCMessage) => {
          const message = gsocToMessage(gsocMsg)
          // Add to store (this also persists)
          get().addMessage(subdomain, 'received', message)
        },
        onError: (error: Error) => {
          console.error('[Inbox] Subscription error:', error)
          set({ error: error.message })
        },
        onClose: () => {
          console.log('[Inbox] Subscription closed')
          set({ isSubscribed: false })
        },
      })

      set({
        subscription: newSubscription,
        isSubscribed: true,
      })
    },

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribe: () => {
      const { subscription } = get()
      if (subscription) {
        subscription.cancel()
      }
      set({
        subscription: null,
        isSubscribed: false,
      })
    },

    /**
     * Clear error
     */
    clearError: () => {
      set({ error: null })
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      const { subscription } = get()
      if (subscription) {
        subscription.cancel()
      }
      set(initialState)
    },
  }))
)

/**
 * Selectors
 */
export const selectReceived = (state: InboxStore) => state.received
export const selectSent = (state: InboxStore) => state.sent
export const selectStored = (state: InboxStore) => state.stored
export const selectIsLoading = (state: InboxStore) => state.isLoading
export const selectIsSyncing = (state: InboxStore) => state.isSyncing
export const selectError = (state: InboxStore) => state.error
export const selectIsSubscribed = (state: InboxStore) => state.isSubscribed

/**
 * Get total message count
 */
export const selectTotalCount = (state: InboxStore) =>
  state.received.length + state.sent.length + state.stored.length

export default useInboxStore
