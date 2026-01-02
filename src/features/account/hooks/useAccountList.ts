/**
 * useAccountList Hook
 *
 * Manages the list of all accounts with
 * creation, deletion, and switching functionality.
 */

import { useCallback } from 'react'
import { useAccountStore } from '../stores/accountStore'
import type { Account } from '@/shared/types'

/**
 * Hook return type
 */
interface UseAccountListReturn {
  // Account list
  accounts: Account[]
  activeAccount: Account | null

  // State
  isLoading: boolean
  error: string | null

  // Actions
  createAccount: (subdomain: string, password: string) => Promise<Account>
  unlockAccount: (subdomain: string, password: string) => Promise<boolean>
  deleteAccount: (subdomain: string) => void
  switchAccount: (subdomain: string, password: string) => Promise<boolean>
  lockAccount: () => void
  loadAccounts: () => void
  clearError: () => void

  // Computed
  hasAccounts: boolean
  accountCount: number
  isActive: (subdomain: string) => boolean
}

/**
 * useAccountList hook
 */
export function useAccountList(): UseAccountListReturn {
  // Get store state
  const accounts = useAccountStore((s) => s.accounts)
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isLoading = useAccountStore((s) => s.isLoading)
  const error = useAccountStore((s) => s.error)

  // Get store actions
  const storeCreateAccount = useAccountStore((s) => s.createAccount)
  const storeUnlockAccount = useAccountStore((s) => s.unlockAccount)
  const storeDeleteAccount = useAccountStore((s) => s.deleteAccount)
  const storeLockAccount = useAccountStore((s) => s.lockAccount)
  const storeLoadAccounts = useAccountStore((s) => s.loadAccounts)
  const storeClearError = useAccountStore((s) => s.clearError)

  // Create new account
  const createAccount = useCallback(
    async (subdomain: string, password: string): Promise<Account> => {
      return storeCreateAccount(subdomain, password)
    },
    [storeCreateAccount]
  )

  // Unlock account
  const unlockAccount = useCallback(
    async (subdomain: string, password: string): Promise<boolean> => {
      return storeUnlockAccount(subdomain, password)
    },
    [storeUnlockAccount]
  )

  // Delete account
  const deleteAccount = useCallback(
    (subdomain: string) => {
      storeDeleteAccount(subdomain)
    },
    [storeDeleteAccount]
  )

  // Switch to different account
  const switchAccount = useCallback(
    async (subdomain: string, password: string): Promise<boolean> => {
      // Lock current account first
      storeLockAccount()
      // Unlock the new account
      return storeUnlockAccount(subdomain, password)
    },
    [storeLockAccount, storeUnlockAccount]
  )

  // Lock current account
  const lockAccount = useCallback(() => {
    storeLockAccount()
  }, [storeLockAccount])

  // Load accounts from storage
  const loadAccounts = useCallback(() => {
    storeLoadAccounts()
  }, [storeLoadAccounts])

  // Clear error
  const clearError = useCallback(() => {
    storeClearError()
  }, [storeClearError])

  // Check if account is active
  const isActive = useCallback(
    (subdomain: string): boolean => {
      return activeAccount?.subdomain === subdomain
    },
    [activeAccount]
  )

  // Computed values
  const hasAccounts = accounts.length > 0
  const accountCount = accounts.length

  return {
    // Account list
    accounts,
    activeAccount,

    // State
    isLoading,
    error,

    // Actions
    createAccount,
    unlockAccount,
    deleteAccount,
    switchAccount,
    lockAccount,
    loadAccounts,
    clearError,

    // Computed
    hasAccounts,
    accountCount,
    isActive,
  }
}

export default useAccountList
