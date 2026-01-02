/**
 * useAccount Hook
 *
 * Provides access to the active account with
 * convenience methods and computed state.
 */

import { useCallback, useEffect } from 'react'
import { useAccountStore } from '../stores/accountStore'
import type { Account } from '@/shared/types'

/**
 * Hook return type
 */
interface UseAccountReturn {
  // Active account
  account: Account | null
  isUnlocked: boolean
  isLoading: boolean
  error: string | null

  // Account info
  subdomain: string | null
  publicKey: string | null

  // Actions
  unlock: (password: string) => Promise<boolean>
  lock: () => void
  clearError: () => void

  // Computed
  hasAccount: boolean
  displayName: string
}

/**
 * useAccount hook
 */
export function useAccount(): UseAccountReturn {
  // Get store state
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isUnlocked = useAccountStore((s) => s.isUnlocked)
  const isLoading = useAccountStore((s) => s.isLoading)
  const error = useAccountStore((s) => s.error)

  // Get store actions
  const storeUnlock = useAccountStore((s) => s.unlockAccount)
  const storeLock = useAccountStore((s) => s.lockAccount)
  const storeClearError = useAccountStore((s) => s.clearError)
  const storeLoadAccounts = useAccountStore((s) => s.loadAccounts)

  // Load accounts on mount
  useEffect(() => {
    storeLoadAccounts()
  }, [storeLoadAccounts])

  // Unlock current account
  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      if (!activeAccount) return false
      return storeUnlock(activeAccount.subdomain, password)
    },
    [activeAccount, storeUnlock]
  )

  // Lock current account
  const lock = useCallback(() => {
    storeLock()
  }, [storeLock])

  // Clear error
  const clearError = useCallback(() => {
    storeClearError()
  }, [storeClearError])

  // Computed values
  const hasAccount = activeAccount !== null
  const subdomain = activeAccount?.subdomain || null
  const publicKey = activeAccount?.publicKey || null
  const displayName = subdomain || 'Anonymous'

  return {
    // Active account
    account: activeAccount,
    isUnlocked,
    isLoading,
    error,

    // Account info
    subdomain,
    publicKey,

    // Actions
    unlock,
    lock,
    clearError,

    // Computed
    hasAccount,
    displayName,
  }
}

export default useAccount
