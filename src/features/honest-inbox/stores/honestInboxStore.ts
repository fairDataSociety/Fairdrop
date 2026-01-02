/**
 * Honest Inbox Store
 *
 * Manages Honest Inbox (Mode 2: Anonymous Sending) using Zustand.
 * Allows fully anonymous file delivery where sender identity is not revealed.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  createHonestInbox,
  getAllHonestInboxes,
  deleteHonestInbox as removeHonestInbox,
  sendAnonymousFile,
  getHonestInboxMessages,
  subscribeToHonestInbox,
  getHonestInboxLink,
  type AnonymousMessage,
  type AnonymousSendResult,
} from '@/services/swarm'
import type { HonestInbox, UploadStatus } from '@/shared/types'

/**
 * Subscription control interface
 */
interface SubscriptionControl {
  cancel: () => void
}

/**
 * Anonymous send state
 */
interface AnonymousSendState {
  file: File | null
  recipientPublicKey: string
  status: UploadStatus
  progress: number
  result: AnonymousSendResult | null
  error: string | null
}

/**
 * Honest inbox state
 */
interface HonestInboxState {
  // Inboxes
  inboxes: HonestInbox[]
  activeInbox: HonestInbox | null
  isLoading: boolean
  error: string | null

  // Messages for active inbox
  messages: AnonymousMessage[]
  isLoadingMessages: boolean
  lastMessageIndex: number

  // Subscription
  subscription: SubscriptionControl | null
  isSubscribed: boolean

  // Anonymous send state
  send: AnonymousSendState
}

/**
 * Honest inbox actions
 */
interface HonestInboxActions {
  // Inbox management
  loadInboxes: () => void
  createInbox: (name: string, targetOverlay?: string) => Promise<HonestInbox>
  deleteInbox: (id: string) => void
  setActiveInbox: (inbox: HonestInbox | null) => void
  getInboxLink: (inbox: HonestInbox) => string

  // Messages
  loadMessages: () => Promise<void>
  refreshMessages: () => Promise<void>

  // Subscription
  subscribe: () => void
  unsubscribe: () => void

  // Anonymous sending
  setSendFile: (file: File | null) => void
  setRecipientPublicKey: (key: string) => void
  sendAnonymously: () => Promise<AnonymousSendResult>
  resetSend: () => void

  // State management
  clearError: () => void
  reset: () => void
}

/**
 * Combined store type
 */
type HonestInboxStore = HonestInboxState & HonestInboxActions

/**
 * Initial send state
 */
const initialSendState: AnonymousSendState = {
  file: null,
  recipientPublicKey: '',
  status: 'idle',
  progress: 0,
  result: null,
  error: null,
}

/**
 * Initial state
 */
const initialState: HonestInboxState = {
  inboxes: [],
  activeInbox: null,
  isLoading: false,
  error: null,
  messages: [],
  isLoadingMessages: false,
  lastMessageIndex: 0,
  subscription: null,
  isSubscribed: false,
  send: initialSendState,
}

/**
 * Honest inbox store
 */
export const useHonestInboxStore = create<HonestInboxStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Load all honest inboxes from storage
     */
    loadInboxes: () => {
      set({ isLoading: true, error: null })

      try {
        const inboxes = getAllHonestInboxes()
        set({ inboxes, isLoading: false })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load inboxes'
        set({ error: message, isLoading: false })
      }
    },

    /**
     * Create a new honest inbox
     */
    createInbox: async (name: string, targetOverlay?: string): Promise<HonestInbox> => {
      set({ isLoading: true, error: null })

      try {
        // Only pass options if targetOverlay is defined
        const options = targetOverlay ? { targetOverlay } : undefined
        const inbox = await createHonestInbox(name, options)

        set((state) => ({
          inboxes: [...state.inboxes, inbox],
          activeInbox: inbox,
          isLoading: false,
        }))

        return inbox
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create inbox'
        set({ error: message, isLoading: false })
        throw error
      }
    },

    /**
     * Delete a honest inbox
     */
    deleteInbox: (id: string) => {
      const { activeInbox, subscription } = get()

      // Cancel subscription if deleting active inbox
      if (activeInbox?.id === id && subscription) {
        subscription.cancel()
      }

      removeHonestInbox(id)

      set((state) => ({
        inboxes: state.inboxes.filter((i) => i.id !== id),
        activeInbox: activeInbox?.id === id ? null : activeInbox,
        messages: activeInbox?.id === id ? [] : state.messages,
        subscription: activeInbox?.id === id ? null : state.subscription,
        isSubscribed: activeInbox?.id === id ? false : state.isSubscribed,
      }))
    },

    /**
     * Set the active inbox
     */
    setActiveInbox: (inbox: HonestInbox | null) => {
      const { subscription } = get()

      // Cancel subscription from previous inbox
      if (subscription) {
        subscription.cancel()
      }

      set({
        activeInbox: inbox,
        messages: [],
        lastMessageIndex: 0,
        subscription: null,
        isSubscribed: false,
      })
    },

    /**
     * Get shareable link for an inbox
     */
    getInboxLink: (inbox: HonestInbox): string => {
      return getHonestInboxLink(inbox.publicKey, inbox.name)
    },

    /**
     * Load messages for active inbox
     */
    loadMessages: async () => {
      const { activeInbox, lastMessageIndex } = get()
      if (!activeInbox) return

      set({ isLoadingMessages: true })

      try {
        const messages = await getHonestInboxMessages(activeInbox, lastMessageIndex)

        const newLastIndex = messages.reduce((max, msg) => Math.max(max, msg.index), lastMessageIndex)

        set({
          messages,
          lastMessageIndex: newLastIndex,
          isLoadingMessages: false,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load messages'
        set({ error: message, isLoadingMessages: false })
      }
    },

    /**
     * Refresh messages (poll for new ones)
     */
    refreshMessages: async () => {
      const { activeInbox, lastMessageIndex, messages } = get()
      if (!activeInbox) return

      try {
        const newMessages = await getHonestInboxMessages(activeInbox, lastMessageIndex)

        // Filter out duplicates
        const uniqueNewMessages = newMessages.filter(
          (nm) => !messages.some((m) => m.reference === nm.reference)
        )

        if (uniqueNewMessages.length > 0) {
          const newLastIndex = uniqueNewMessages.reduce(
            (max, msg) => Math.max(max, msg.index),
            lastMessageIndex
          )

          set({
            messages: [...uniqueNewMessages, ...messages],
            lastMessageIndex: newLastIndex,
          })
        }
      } catch (error) {
        console.error('[HonestInbox] Failed to refresh messages:', error)
      }
    },

    /**
     * Subscribe to real-time messages
     */
    subscribe: () => {
      const { activeInbox, lastMessageIndex, subscription: existingSub } = get()
      if (!activeInbox?.gsocParams) return

      // Cancel existing subscription
      if (existingSub) {
        existingSub.cancel()
      }

      const newSub = subscribeToHonestInbox(activeInbox, lastMessageIndex, {
        onMessage: (msg: AnonymousMessage) => {
          set((state) => ({
            messages: [msg, ...state.messages],
            lastMessageIndex: Math.max(state.lastMessageIndex, msg.index),
          }))
        },
        onError: (error: Error) => {
          console.error('[HonestInbox] Subscription error:', error)
          set({ error: error.message })
        },
        onClose: () => {
          set({ isSubscribed: false })
        },
      })

      // Wrap the subscription to use cancel() method
      const subscriptionControl: SubscriptionControl = {
        cancel: () => newSub.cancel(),
      }

      set({
        subscription: subscriptionControl,
        isSubscribed: true,
      })
    },

    /**
     * Unsubscribe from real-time messages
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
     * Set file for anonymous sending
     */
    setSendFile: (file: File | null) => {
      set((state) => ({
        send: {
          ...state.send,
          file,
          status: 'idle',
          progress: 0,
          result: null,
          error: null,
        },
      }))
    },

    /**
     * Set recipient public key for anonymous sending
     */
    setRecipientPublicKey: (key: string) => {
      set((state) => ({
        send: {
          ...state.send,
          recipientPublicKey: key,
        },
      }))
    },

    /**
     * Send file anonymously
     */
    sendAnonymously: async (): Promise<AnonymousSendResult> => {
      const { send } = get()

      if (!send.file) {
        throw new Error('No file selected')
      }

      if (!send.recipientPublicKey) {
        throw new Error('No recipient public key')
      }

      set((state) => ({
        send: {
          ...state.send,
          status: 'encrypting',
          progress: 0,
          error: null,
        },
      }))

      try {
        const result = await sendAnonymousFile(send.file, send.recipientPublicKey, {
          onProgress: (progress) => {
            set((state) => ({
              send: { ...state.send, progress },
            }))
          },
          onStatusChange: (status) => {
            set((state) => ({
              send: { ...state.send, status },
            }))
          },
        })

        set((state) => ({
          send: {
            ...state.send,
            status: 'complete',
            progress: 100,
            result,
          },
        }))

        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send anonymously'
        set((state) => ({
          send: {
            ...state.send,
            status: 'error',
            error: message,
          },
        }))
        throw error
      }
    },

    /**
     * Reset send state
     */
    resetSend: () => {
      set({ send: initialSendState })
    },

    /**
     * Clear error
     */
    clearError: () => {
      set({ error: null })
    },

    /**
     * Reset entire store
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
export const selectInboxes = (state: HonestInboxStore) => state.inboxes
export const selectActiveInbox = (state: HonestInboxStore) => state.activeInbox
export const selectMessages = (state: HonestInboxStore) => state.messages
export const selectIsLoading = (state: HonestInboxStore) => state.isLoading
export const selectIsSubscribed = (state: HonestInboxStore) => state.isSubscribed
export const selectSendState = (state: HonestInboxStore) => state.send
export const selectError = (state: HonestInboxStore) => state.error

export default useHonestInboxStore
