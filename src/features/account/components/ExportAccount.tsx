/**
 * ExportAccount Component
 *
 * Modal for exporting/backing up an account.
 * Creates a downloadable JSON file with encrypted account data.
 */

import { useState, useCallback } from 'react'
import { Modal, Button } from '@/shared/components'
import type { Account } from '@/shared/types'

/**
 * ExportAccount props
 */
interface ExportAccountProps {
  isOpen: boolean
  onClose: () => void
  account: Account
}

/**
 * Export format version
 */
const EXPORT_VERSION = 1

/**
 * Create export data
 */
function createExportData(account: Account): string {
  const exportData = {
    version: EXPORT_VERSION,
    type: 'fairdrop-account',
    exportedAt: Date.now(),
    account: {
      subdomain: account.subdomain,
      publicKey: account.publicKey,
      privateKey: account.privateKey,
      passwordHash: account.passwordHash,
      created: account.created,
    },
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Create download filename
 */
function getFilename(subdomain: string): string {
  const date = new Date().toISOString().split('T')[0]
  return `fairdrop-${subdomain}-backup-${date}.json`
}

/**
 * ExportAccount component
 */
export function ExportAccount({ isOpen, onClose, account }: ExportAccountProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  // Handle download
  const handleDownload = useCallback(() => {
    setIsDownloading(true)

    try {
      // Create export data
      const data = createExportData(account)

      // Create blob
      const blob = new Blob([data], { type: 'application/json' })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getFilename(account.subdomain)

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setDownloaded(true)
    } finally {
      setIsDownloading(false)
    }
  }, [account])

  // Handle close
  const handleClose = useCallback(() => {
    setDownloaded(false)
    onClose()
  }, [onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Account">
      <div className="space-y-4">
        {/* Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              {account.subdomain.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{account.subdomain}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {account.subdomain}.fairdrop.eth
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Export your account to create a backup file. This file contains your encrypted keys and
          can be imported to recover your account.
        </p>

        {/* Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Keep this file secure
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Anyone with this backup file and your password can access your account.
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {downloaded && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
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
              <p className="text-sm text-green-700 dark:text-green-300">
                Backup downloaded successfully
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={handleClose}>
            {downloaded ? 'Done' : 'Cancel'}
          </Button>
          {!downloaded && (
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
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
                  Preparing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Backup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ExportAccount
