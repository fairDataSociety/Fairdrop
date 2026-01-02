/**
 * useGSOCSubscription Hook
 *
 * Manages GSOC WebSocket subscription for real-time inbox updates.
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { subscribeToInbox, type InboxSubscription, type GSOCMessage } from '@/services/swarm'
import type { InboxParams } from '@/shared/types'

/**
 * Subscription state
 */
interface SubscriptionState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  messageCount: number
}

/**
 * Hook options
 */
interface UseGSOCSubscriptionOptions {
  onMessage?: (message: GSOCMessage) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
  reconnectDelay?: number
}

/**
 * Hook return type
 */
interface UseGSOCSubscriptionReturn extends SubscriptionState {
  subscribe: () => void
  unsubscribe: () => void
}

/**
 * useGSOCSubscription hook
 */
export function useGSOCSubscription(
  inboxParams: InboxParams | null,
  startIndex = 0,
  options: UseGSOCSubscriptionOptions = {}
): UseGSOCSubscriptionReturn {
  const {
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectDelay = 5000,
  } = options

  const [state, setState] = useState<SubscriptionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    messageCount: 0,
  })

  const subscriptionRef = useRef<InboxSubscription | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Subscribe to inbox
  const subscribe = useCallback(() => {
    if (!inboxParams) {
      setState((prev) => ({ ...prev, error: 'No inbox params provided' }))
      return
    }

    // Cancel any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.cancel()
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const subscription = subscribeToInbox(inboxParams, startIndex, {
        onMessage: (msg: GSOCMessage) => {
          if (!mountedRef.current) return

          setState((prev) => ({
            ...prev,
            messageCount: prev.messageCount + 1,
          }))

          onMessage?.(msg)
        },
        onError: (error: Error) => {
          if (!mountedRef.current) return

          console.error('[GSOC] Subscription error:', error)
          setState((prev) => ({
            ...prev,
            isConnected: false,
            error: error.message,
          }))

          onError?.(error)

          // Auto-reconnect
          if (autoReconnect) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                subscribe()
              }
            }, reconnectDelay)
          }
        },
        onClose: () => {
          if (!mountedRef.current) return

          setState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
          }))

          onDisconnect?.()

          // Auto-reconnect
          if (autoReconnect) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                subscribe()
              }
            }, reconnectDelay)
          }
        },
      })

      subscriptionRef.current = subscription

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
      }))

      onConnect?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe'
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }))
    }
  }, [inboxParams, startIndex, onMessage, onError, onConnect, onDisconnect, autoReconnect, reconnectDelay])

  // Unsubscribe
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cancel()
      subscriptionRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [unsubscribe])

  return {
    ...state,
    subscribe,
    unsubscribe,
  }
}

export default useGSOCSubscription
