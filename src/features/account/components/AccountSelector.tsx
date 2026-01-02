/**
 * AccountSelector Component
 *
 * Dropdown for selecting and managing accounts.
 * Shows active account and allows switching between accounts.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccountList } from '../hooks/useAccountList'
import { Badge } from '@/shared/components'
import type { Account } from '@/shared/types'

/**
 * AccountSelector props
 */
interface AccountSelectorProps {
  onCreateAccount?: () => void
  onUnlockAccount?: (subdomain: string) => void
  onManageAccount?: (account: Account) => void
  onLock?: () => void
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * AccountSelector component
 */
export function AccountSelector({
  onCreateAccount,
  onUnlockAccount,
  onManageAccount,
  onLock,
}: AccountSelectorProps) {
  const {
    accounts,
    activeAccount,
    hasAccounts,
    isActive,
    lockAccount,
  } = useAccountList()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Handle account click
  const handleAccountClick = useCallback(
    (account: Account) => {
      if (isActive(account.subdomain)) {
        // Already active - open settings
        onManageAccount?.(account)
      } else {
        // Need to unlock
        onUnlockAccount?.(account.subdomain)
      }
      setIsOpen(false)
    },
    [isActive, onManageAccount, onUnlockAccount]
  )

  // Handle create account
  const handleCreateClick = useCallback(() => {
    onCreateAccount?.()
    setIsOpen(false)
  }, [onCreateAccount])

  // Handle lock
  const handleLockClick = useCallback(() => {
    lockAccount()
    onLock?.()
    setIsOpen(false)
  }, [lockAccount, onLock])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
            {activeAccount ? activeAccount.subdomain.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {activeAccount ? activeAccount.subdomain : 'Select Account'}
        </span>

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Account list */}
          {hasAccounts && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Accounts
              </div>
              {accounts.map((account) => (
                <button
                  key={account.subdomain}
                  onClick={() => handleAccountClick(account)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive(account.subdomain)
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`font-medium text-sm ${
                        isActive(account.subdomain)
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {account.subdomain.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Account info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {account.subdomain}
                      </span>
                      {isActive(account.subdomain) && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created {formatDate(account.created)}
                    </span>
                  </div>

                  {/* Checkmark for active */}
                  {isActive(account.subdomain) && (
                    <svg
                      className="w-4 h-4 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
            </>
          )}

          {/* Actions */}
          <button
            onClick={handleCreateClick}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Account
          </button>

          {activeAccount && (
            <button
              onClick={handleLockClick}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Lock Account
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountSelector
