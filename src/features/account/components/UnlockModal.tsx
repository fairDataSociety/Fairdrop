/**
 * UnlockModal Component
 *
 * Modal for unlocking an existing account with password.
 */

import { useState, useCallback, useEffect } from 'react'
import { useAccountList } from '../hooks/useAccountList'
import { Modal, Button, Input } from '@/shared/components'

/**
 * UnlockModal props
 */
interface UnlockModalProps {
  isOpen: boolean
  onClose: () => void
  subdomain: string
  onUnlocked?: () => void
}

/**
 * UnlockModal component
 */
export function UnlockModal({ isOpen, onClose, subdomain, onUnlocked }: UnlockModalProps) {
  const { unlockAccount, isLoading, error, clearError } = useAccountList()

  const [password, setPassword] = useState('')

  // Reset password when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      clearError()
    }
  }, [isOpen, clearError])

  // Handle password change
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      if (error) clearError()
    },
    [error, clearError]
  )

  // Handle unlock
  const handleUnlock = useCallback(async () => {
    if (!password.trim()) return

    const success = await unlockAccount(subdomain, password)
    if (success) {
      setPassword('')
      onClose()
      onUnlocked?.()
    }
  }, [subdomain, password, unlockAccount, onClose, onUnlocked])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleUnlock()
      }
    },
    [handleUnlock, isLoading]
  )

  // Handle close
  const handleClose = useCallback(() => {
    setPassword('')
    clearError()
    onClose()
  }, [clearError, onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Unlock Account">
      <div className="space-y-4">
        {/* Account info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              {subdomain.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{subdomain}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subdomain}.fairdrop.eth</p>
          </div>
        </div>

        {/* Password input */}
        <div>
          <label
            htmlFor="unlock-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <Input
            id="unlock-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter your password"
            autoFocus
            disabled={isLoading}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUnlock} disabled={isLoading || !password.trim()}>
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
                Unlocking...
              </>
            ) : (
              'Unlock'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UnlockModal
