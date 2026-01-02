/**
 * Account Store
 *
 * Manages Fairdrop accounts using Zustand.
 * Handles account creation, unlocking, and persistence.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateKeyPair, bytesToHex } from '@/services/swarm'
import {
  hashPassword,
  verifyPassword,
  getAccounts,
  saveAccount,
  deleteAccount as removeAccount,
} from '@/services/storage'
import type { Account } from '@/shared/types'

/**
 * Account store state
 */
interface AccountState {
  // State
  accounts: Account[]
  activeAccount: Account | null
  isUnlocked: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Account store actions
 */
interface AccountActions {
  // Account management
  createAccount: (subdomain: string, password: string) => Promise<Account>
  unlockAccount: (subdomain: string, password: string) => Promise<boolean>
  lockAccount: () => void
  deleteAccount: (subdomain: string) => void

  // State management
  loadAccounts: () => void
  setActiveAccount: (account: Account | null) => void
  clearError: () => void
}

/**
 * Combined store type
 */
type AccountStore = AccountState & AccountActions

/**
 * Initial state
 */
const initialState: AccountState = {
  accounts: [],
  activeAccount: null,
  isUnlocked: false,
  isLoading: false,
  error: null,
}

/**
 * Account store
 */
export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Load accounts from storage
       */
      loadAccounts: () => {
        const accounts = getAccounts()
        set({ accounts: Object.values(accounts) })
      },

      /**
       * Create a new account
       */
      createAccount: async (subdomain: string, password: string): Promise<Account> => {
        set({ isLoading: true, error: null })

        try {
          // Check if account already exists
          const existing = get().accounts.find((a) => a.subdomain === subdomain)
          if (existing) {
            throw new Error(`Account "${subdomain}" already exists`)
          }

          // Generate keypair for encryption
          const keyPair = generateKeyPair()

          // Hash password for verification
          const passwordHash = await hashPassword(password)

          // Create account
          const account: Account = {
            subdomain,
            publicKey: bytesToHex(keyPair.publicKey),
            privateKey: bytesToHex(keyPair.privateKey),
            passwordHash,
            created: Date.now(),
          }

          // Save to storage
          saveAccount(account)

          // Update state
          set((state) => ({
            accounts: [...state.accounts, account],
            activeAccount: account,
            isUnlocked: true,
            isLoading: false,
          }))

          return account
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create account'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      /**
       * Unlock an existing account with password
       */
      unlockAccount: async (subdomain: string, password: string): Promise<boolean> => {
        set({ error: null, isLoading: true })

        const account = get().accounts.find((a) => a.subdomain === subdomain)
        if (!account) {
          set({ error: `Account "${subdomain}" not found`, isLoading: false })
          return false
        }

        // Verify password using async crypto
        const isValid = await verifyPassword(password, account.passwordHash)
        if (!isValid) {
          set({ error: 'Incorrect password', isLoading: false })
          return false
        }

        set({
          activeAccount: account,
          isUnlocked: true,
          isLoading: false,
        })

        return true
      },

      /**
       * Lock the current account
       */
      lockAccount: () => {
        set({
          activeAccount: null,
          isUnlocked: false,
        })
      },

      /**
       * Delete an account
       */
      deleteAccount: (subdomain: string) => {
        const { activeAccount } = get()

        // Remove from storage
        removeAccount(subdomain)

        // Update state
        set((state) => ({
          accounts: state.accounts.filter((a) => a.subdomain !== subdomain),
          activeAccount: activeAccount?.subdomain === subdomain ? null : activeAccount,
          isUnlocked: activeAccount?.subdomain === subdomain ? false : state.isUnlocked,
        }))
      },

      /**
       * Set the active account (without password verification)
       * Used for account switching when already unlocked
       */
      setActiveAccount: (account: Account | null) => {
        set({
          activeAccount: account,
          isUnlocked: account !== null,
        })
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'fairdrop-account-store',
      // Only persist the active account subdomain, not the full account
      // Accounts themselves are stored in localStorage via the storage service
      partialize: (state) => ({
        activeAccountSubdomain: state.activeAccount?.subdomain,
      }),
      onRehydrateStorage: () => {
        // Return a function that runs after rehydration
        return (state: AccountStore | undefined) => {
          if (state) {
            state.loadAccounts()
          }
        }
      },
    }
  )
)

/**
 * Selectors for optimized re-renders
 */
export const selectAccounts = (state: AccountStore) => state.accounts
export const selectActiveAccount = (state: AccountStore) => state.activeAccount
export const selectIsUnlocked = (state: AccountStore) => state.isUnlocked
export const selectIsLoading = (state: AccountStore) => state.isLoading
export const selectError = (state: AccountStore) => state.error

export default useAccountStore
