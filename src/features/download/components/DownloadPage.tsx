/**
 * DownloadPage Component
 *
 * Main download page that orchestrates the download flow.
 */

import { useCallback } from 'react'
import { useDownload } from '../hooks/useDownload'
import { useAccountStore } from '@/features/account/stores/accountStore'
import { DownloadProgress } from './DownloadProgress'
import { DecryptionForm } from './DecryptionForm'
import { FilePreview } from './FilePreview'
import { Card } from '@/shared/components'

/**
 * DownloadPage props
 */
interface DownloadPageProps {
  reference: string
}

/**
 * DownloadPage component
 */
export function DownloadPage({ reference }: DownloadPageProps) {
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
  } = useDownload(reference)

  // Get active account
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isUnlocked = useAccountStore((s) => s.isUnlocked)

  // Retry handler
  const handleRetry = useCallback(() => {
    clearError()
    fetchFile()
  }, [clearError, fetchFile])

  // Cancel handler
  const handleCancel = useCallback(() => {
    reset()
    // Navigate back or show upload
    window.history.back()
  }, [reset])

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
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
          {reference}
        </p>
      </div>
    </div>
  )
}

export default DownloadPage
