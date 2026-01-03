/**
 * AccountSettings Component
 *
 * Account management settings including export and delete.
 */

import { useState, useCallback } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useAccountList } from '../hooks/useAccountList'
import { ExportAccount } from './ExportAccount'
import { Button, Card, Modal, Badge } from '@/shared/components'

/**
 * AccountSettings props
 */
interface AccountSettingsProps {
  onLock?: () => void
  onDelete?: () => void
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Truncate public key for display
 */
function truncateKey(key: string): string {
  if (key.length <= 20) return key
  return `${key.slice(0, 10)}...${key.slice(-8)}`
}

/**
 * AccountSettings component
 */
export function AccountSettings({ onLock, onDelete }: AccountSettingsProps) {
  const { account, subdomain, publicKey, lock } = useAccount()
  const { deleteAccount } = useAccountList()

  const [showExport, setShowExport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Handle lock
  const handleLock = useCallback(() => {
    lock()
    onLock?.()
  }, [lock, onLock])

  // Handle copy public key
  const handleCopyKey = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }, [publicKey])

  // Handle export
  const handleExportClick = useCallback(() => {
    setShowExport(true)
  }, [])

  const handleExportClose = useCallback(() => {
    setShowExport(false)
  }, [])

  // Handle delete
  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (subdomain) {
      deleteAccount(subdomain)
      setShowDeleteConfirm(false)
      onDelete?.()
    }
  }, [subdomain, deleteAccount, onDelete])

  if (!account) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Account Active
        </h2>
        <p className="text-gray-500">
          Select or create an account to view settings.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Account Info */}
        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {subdomain?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {subdomain}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subdomain}.fairdrop.eth
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLock}>
              Lock
            </Button>
          </div>

          {/* Created date */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDate(account.created)}
            </p>
          </div>
        </Card>

        {/* Public Key */}
        <Card padding="lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Public Key
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Share this key with others so they can send you encrypted files.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono overflow-hidden">
              {publicKey ? truncateKey(publicKey) : 'N/A'}
            </code>
            <Button variant="secondary" size="sm" onClick={handleCopyKey}>
              {copiedKey ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Account Actions
          </h3>
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExportClick}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Export Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Download a backup of your account
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently remove this account
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      {showExport && account && (
        <ExportAccount
          isOpen={showExport}
          onClose={handleExportClose}
          account={account}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={handleDeleteCancel} title="Delete Account?">
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900 dark:text-gray-100">{subdomain}</strong>?
          </p>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Warning:</strong> This action cannot be undone. You will lose access to all
              files encrypted with this account unless you have exported a backup.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Account
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default AccountSettings
