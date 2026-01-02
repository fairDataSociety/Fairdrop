/**
 * DecryptionForm Component
 *
 * Form for decrypting encrypted files with private key or account.
 */

import { useState, useCallback } from 'react'
import { Button, Input, Card } from '@/shared/components'

/**
 * Account info for decryption
 */
interface AccountInfo {
  subdomain: string
  publicKey: string
}

/**
 * DecryptionForm props
 */
interface DecryptionFormProps {
  filename: string | null
  activeAccount: AccountInfo | null
  isDecrypting: boolean
  error: string | null
  onDecryptWithAccount: () => Promise<void>
  onDecryptWithKey: (privateKey: string) => Promise<void>
}

/**
 * DecryptionForm component
 */
export function DecryptionForm({
  filename,
  activeAccount,
  isDecrypting,
  error,
  onDecryptWithAccount,
  onDecryptWithKey,
}: DecryptionFormProps) {
  const [showKeyInput, setShowKeyInput] = useState(!activeAccount)
  const [privateKey, setPrivateKey] = useState('')

  const handleAccountDecrypt = useCallback(async () => {
    try {
      await onDecryptWithAccount()
    } catch (err) {
      // Error handled by parent
    }
  }, [onDecryptWithAccount])

  const handleKeyDecrypt = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!privateKey.trim()) return

      try {
        await onDecryptWithKey(privateKey.trim())
      } catch (err) {
        // Error handled by parent
      }
    },
    [privateKey, onDecryptWithKey]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Encrypted File
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This file is encrypted. Provide your private key to decrypt it.
        </p>
      </div>

      {/* File info */}
      {filename && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">File:</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {filename}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Decryption options */}
      {activeAccount && !showKeyInput ? (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {activeAccount.subdomain}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {activeAccount.publicKey.slice(0, 16)}...
                </p>
              </div>
            </div>

            <Button
              onClick={handleAccountDecrypt}
              isLoading={isDecrypting}
              fullWidth
              size="lg"
            >
              Decrypt with this account
            </Button>

            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Use a different private key
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleKeyDecrypt} className="space-y-4">
            <Input
              label="Private Key"
              type="password"
              placeholder="Enter your private key (hex)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isDecrypting}
              hint="Your private key is never sent to any server"
            />

            <Button
              type="submit"
              isLoading={isDecrypting}
              disabled={!privateKey.trim()}
              fullWidth
              size="lg"
            >
              Decrypt File
            </Button>

            {activeAccount && (
              <button
                type="button"
                onClick={() => setShowKeyInput(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Use my account instead
              </button>
            )}
          </form>
        </Card>
      )}

      {/* Security note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              End-to-end encrypted
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Decryption happens entirely in your browser. Your private key never leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DecryptionForm
