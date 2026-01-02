/**
 * CreateAccountModal Component
 *
 * Modal wizard for creating a new Fairdrop account.
 * Guides user through subdomain selection and password setup.
 */

import { useState, useCallback } from 'react'
import { useAccountList } from '../hooks/useAccountList'
import { Modal, Button, Input } from '@/shared/components'
import type { Account } from '@/shared/types'

/**
 * CreateAccountModal props
 */
interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (account: Account) => void
}

/**
 * Password requirements
 */
const PASSWORD_MIN_LENGTH = 8

/**
 * Validate subdomain format
 */
function isValidSubdomain(subdomain: string): boolean {
  // Alphanumeric, 3-32 chars, can include hyphens (not at start/end)
  return /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$|^[a-z0-9]{3,32}$/i.test(subdomain)
}

/**
 * CreateAccountModal component
 */
export function CreateAccountModal({ isOpen, onClose, onCreated }: CreateAccountModalProps) {
  const { createAccount, accounts, isLoading, error, clearError } = useAccountList()

  // Form state
  const [subdomain, setSubdomain] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  // Reset form when modal closes
  const handleClose = useCallback(() => {
    setSubdomain('')
    setPassword('')
    setConfirmPassword('')
    setLocalError(null)
    clearError()
    onClose()
  }, [clearError, onClose])

  // Handle subdomain change
  const handleSubdomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase()
      setSubdomain(value)
      setLocalError(null)
      if (error) clearError()
    },
    [error, clearError]
  )

  // Handle password change
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      setLocalError(null)
      if (error) clearError()
    },
    [error, clearError]
  )

  // Handle confirm password change
  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value)
      setLocalError(null)
    },
    []
  )

  // Validate form
  const validate = useCallback((): boolean => {
    // Check subdomain
    if (!subdomain.trim()) {
      setLocalError('Username is required')
      return false
    }

    if (!isValidSubdomain(subdomain)) {
      setLocalError('Username must be 3-32 alphanumeric characters (hyphens allowed)')
      return false
    }

    // Check if subdomain already exists
    if (accounts.some((a) => a.subdomain.toLowerCase() === subdomain.toLowerCase())) {
      setLocalError('This username is already taken')
      return false
    }

    // Check password
    if (password.length < PASSWORD_MIN_LENGTH) {
      setLocalError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      return false
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return false
    }

    return true
  }, [subdomain, password, confirmPassword, accounts])

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!validate()) return

    try {
      const account = await createAccount(subdomain.trim(), password)
      handleClose()
      onCreated?.(account)
    } catch {
      // Error is handled by the hook
    }
  }, [validate, createAccount, subdomain, password, handleClose, onCreated])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleCreate()
      }
    },
    [handleCreate, isLoading]
  )

  // Combined error
  const displayError = localError || error

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Account">
      <div className="space-y-4">
        {/* Username input */}
        <div>
          <label
            htmlFor="subdomain"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="subdomain"
              type="text"
              value={subdomain}
              onChange={handleSubdomainChange}
              onKeyPress={handleKeyPress}
              placeholder="alice"
              autoFocus
              disabled={isLoading}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              .fairdrop.eth
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your unique identifier for receiving files
          </p>
        </div>

        {/* Password input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter password"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum {PASSWORD_MIN_LENGTH} characters
          </p>
        </div>

        {/* Confirm password input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onKeyPress={handleKeyPress}
            placeholder="Confirm password"
            disabled={isLoading}
          />
        </div>

        {/* Error display */}
        {displayError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{displayError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateAccountModal
