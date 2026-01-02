/**
 * useRecipientLookup Hook
 *
 * Handles ENS/public key resolution for recipients
 * with debouncing and validation.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { resolveRecipient, type RecipientResolution } from '@/services/ens'

/**
 * Resolved recipient data
 */
export interface ResolvedRecipient {
  displayName: string
  publicKey: string
  hasInbox: boolean
}

/**
 * Lookup state
 */
interface LookupState {
  isLoading: boolean
  resolved: ResolvedRecipient | null
  error: string | null
}

/**
 * Hook return type
 */
interface UseRecipientLookupReturn extends LookupState {
  input: string
  setInput: (value: string) => void
  lookup: () => Promise<void>
  clear: () => void
  isValid: boolean
}

/**
 * Check if input looks like a public key (hex string)
 */
function isPublicKey(input: string): boolean {
  const cleaned = input.replace('0x', '')
  // Uncompressed public key is 130 chars (04 + 64 bytes)
  // Compressed is 66 chars (02/03 + 32 bytes)
  return /^[0-9a-fA-F]{66}$|^[0-9a-fA-F]{130}$/.test(cleaned)
}

/**
 * Check if input looks like an ENS name
 */
function isEnsName(input: string): boolean {
  return input.includes('.') && input.length > 3
}

/**
 * useRecipientLookup hook
 */
export function useRecipientLookup(debounceMs = 500): UseRecipientLookupReturn {
  const [input, setInput] = useState('')
  const [state, setState] = useState<LookupState>({
    isLoading: false,
    resolved: null,
    error: null,
  })

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Perform the lookup
  const lookup = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) {
      setState({ isLoading: false, resolved: null, error: null })
      return
    }

    // Cancel any pending request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result: RecipientResolution = await resolveRecipient(trimmed)

      // Check if request was aborted
      if (abortRef.current?.signal.aborted) return

      if (!result.publicKey) {
        setState({
          isLoading: false,
          resolved: null,
          error: `Could not resolve "${trimmed}"`,
        })
        return
      }

      setState({
        isLoading: false,
        resolved: {
          displayName: result.ensName ?? trimmed,
          publicKey: result.publicKey,
          hasInbox: result.inboxParams !== null,
        },
        error: null,
      })
    } catch (err) {
      // Check if request was aborted
      if (abortRef.current?.signal.aborted) return

      const message = err instanceof Error ? err.message : 'Failed to resolve recipient'
      setState({
        isLoading: false,
        resolved: null,
        error: message,
      })
    }
  }, [input])

  // Clear state
  const clear = useCallback(() => {
    setInput('')
    setState({ isLoading: false, resolved: null, error: null })

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }, [])

  // Debounced auto-lookup on input change
  useEffect(() => {
    const trimmed = input.trim()

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Clear state if input is empty
    if (!trimmed) {
      setState({ isLoading: false, resolved: null, error: null })
      return
    }

    // Only auto-lookup if input looks like an ENS name or public key
    if (!isEnsName(trimmed) && !isPublicKey(trimmed)) {
      return
    }

    // Debounce the lookup
    debounceRef.current = setTimeout(() => {
      lookup()
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [input, debounceMs, lookup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  // Determine if input is valid
  const isValid = state.resolved !== null && state.error === null

  return {
    input,
    setInput,
    lookup,
    clear,
    isLoading: state.isLoading,
    resolved: state.resolved,
    error: state.error,
    isValid,
  }
}

export default useRecipientLookup
