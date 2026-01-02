/**
 * DownloadPage Component
 *
 * Main download page that orchestrates the download flow.
 * Gets reference from URL params or allows manual entry.
 */

import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDownload } from '../hooks/useDownload'
import { useAccountStore } from '@/features/account/stores/accountStore'
import { DownloadProgress } from './DownloadProgress'
import { DecryptionForm } from './DecryptionForm'
import { FilePreview } from './FilePreview'
import { Card, Button, Input } from '@/shared/components'

/**
 * Reference entry form for when no reference is provided in URL
 */
function ReferenceEntry({ onSubmit }: { onSubmit: (reference: string) => void }) {
  const [inputRef, setInputRef] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = inputRef.trim()

      // Basic validation
      if (!trimmed) {
        setError('Please enter a Swarm reference')
        return
      }

      // Check if it looks like a valid reference (64 hex chars)
      if (!/^[a-fA-F0-9]{64}$/.test(trimmed)) {
        setError('Invalid reference format. Should be 64 hex characters.')
        return
      }

      onSubmit(trimmed)
    },
    [inputRef, onSubmit]
  )

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <Card padding="lg" shadow="lg" rounded="xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
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
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Download File
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter a Swarm reference to download a file
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reference"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Swarm Reference
            </label>
            <Input
              id="reference"
              value={inputRef}
              onChange={(e) => {
                setInputRef(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter 64-character reference..."
              className="font-mono text-sm"
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <Button type="submit" className="w-full">
            Download
          </Button>
        </form>
      </Card>
    </div>
  )
}

/**
 * DownloadPage component
 */
export function DownloadPage() {
  const { reference: urlReference } = useParams<{ reference?: string }>()
  const navigate = useNavigate()
  const [manualReference, setManualReference] = useState<string | null>(null)

  // Use URL reference or manual reference
  const reference = urlReference || manualReference

  const {
    status,
    progress,
    error,
    filename,
    contentType,
    isEncrypted,
    blobUrl,
    fetchFile,
    decryptWithAccount,
    decryptWithKey,
    downloadToDevice,
    reset,
    clearError,
    currentStep,
    isDecrypting,
  } = useDownload(reference || '')

  // Get active account
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isUnlocked = useAccountStore((s) => s.isUnlocked)

  // Handle manual reference submission
  const handleReferenceSubmit = useCallback(
    (ref: string) => {
      setManualReference(ref)
      // Update URL
      navigate(`/download/${ref}`, { replace: true })
    },
    [navigate]
  )

  // Retry handler
  const handleRetry = useCallback(() => {
    clearError()
    fetchFile()
  }, [clearError, fetchFile])

  // Cancel handler
  const handleCancel = useCallback(() => {
    reset()
    setManualReference(null)
    navigate('/download')
  }, [reset, navigate])

  // If no reference, show entry form
  if (!reference) {
    return <ReferenceEntry onSubmit={handleReferenceSubmit} />
  }

  // Prepare account info for decryption form
  const accountInfo =
    isUnlocked && activeAccount
      ? {
          subdomain: activeAccount.subdomain,
          publicKey: activeAccount.publicKey,
        }
      : null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card padding="lg" shadow="lg" rounded="xl">
        {/* Loading state */}
        {currentStep === 'loading' && (
          <DownloadProgress
            status={status}
            progress={progress}
            error={error}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        )}

        {/* Decryption required */}
        {currentStep === 'decrypt' && (
          <DecryptionForm
            filename={filename}
            activeAccount={accountInfo}
            isDecrypting={isDecrypting}
            error={error}
            onDecryptWithAccount={decryptWithAccount}
            onDecryptWithKey={decryptWithKey}
          />
        )}

        {/* Preview */}
        {currentStep === 'preview' && (
          <FilePreview
            blobUrl={blobUrl}
            filename={filename}
            contentType={contentType}
            isEncrypted={isEncrypted}
            onDownload={downloadToDevice}
          />
        )}

        {/* Error state */}
        {currentStep === 'error' && (
          <DownloadProgress
            status={status}
            progress={progress}
            error={error}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        )}
      </Card>

      {/* Reference info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{reference}</p>
      </div>
    </div>
  )
}

export default DownloadPage
