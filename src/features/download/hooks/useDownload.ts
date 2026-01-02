/**
 * useDownload Hook
 *
 * Download orchestration hook that wraps the download store
 * with additional logic for the download flow.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useDownloadStore, type DownloadStatus } from '../stores/downloadStore'
import { useAccountStore } from '@/features/account/stores/accountStore'

/**
 * Download step
 */
export type DownloadStep = 'loading' | 'decrypt' | 'preview' | 'error'

/**
 * Hook return type
 */
interface UseDownloadReturn {
  // Reference
  reference: string | null
  setReference: (reference: string) => void

  // Status
  status: DownloadStatus
  progress: number
  error: string | null

  // File info
  filename: string | null
  contentType: string | null
  isEncrypted: boolean
  needsDecryption: boolean

  // Preview
  blobUrl: string | null
  canPreview: boolean

  // Actions
  fetchFile: () => Promise<void>
  decryptWithAccount: () => Promise<void>
  decryptWithKey: (privateKey: string) => Promise<void>
  downloadToDevice: () => void
  reset: () => void
  clearError: () => void

  // Computed
  currentStep: DownloadStep
  isFetching: boolean
  isDecrypting: boolean
  isComplete: boolean
  hasActiveAccount: boolean
}

/**
 * Determine current step based on state
 */
function determineStep(
  status: DownloadStatus,
  needsDecryption: boolean,
  error: string | null
): DownloadStep {
  if (error || status === 'error') {
    return 'error'
  }

  if (status === 'fetching' || status === 'decrypting') {
    return 'loading'
  }

  if (needsDecryption) {
    return 'decrypt'
  }

  if (status === 'complete') {
    return 'preview'
  }

  return 'loading'
}

/**
 * Check if content type is previewable
 */
function isPreviewable(contentType: string | null): boolean {
  if (!contentType) return false

  return (
    contentType.startsWith('image/') ||
    contentType.startsWith('video/') ||
    contentType.startsWith('audio/') ||
    contentType === 'application/pdf' ||
    contentType.startsWith('text/')
  )
}

/**
 * useDownload hook
 */
export function useDownload(initialReference?: string): UseDownloadReturn {
  // Get download store state and actions
  const reference = useDownloadStore((s) => s.reference)
  const setReference = useDownloadStore((s) => s.setReference)
  const status = useDownloadStore((s) => s.status)
  const progress = useDownloadStore((s) => s.progress)
  const error = useDownloadStore((s) => s.error)
  const filename = useDownloadStore((s) => s.filename)
  const contentType = useDownloadStore((s) => s.contentType)
  const isEncrypted = useDownloadStore((s) => s.isEncrypted)
  const needsDecryption = useDownloadStore((s) => s.needsDecryption)
  const blobUrl = useDownloadStore((s) => s.blobUrl)
  const fetchFile = useDownloadStore((s) => s.fetchFile)
  const decryptWithPrivateKey = useDownloadStore((s) => s.decryptWithPrivateKey)
  const downloadToDevice = useDownloadStore((s) => s.downloadToDevice)
  const reset = useDownloadStore((s) => s.reset)
  const clearError = useDownloadStore((s) => s.clearError)

  // Get active account for decryption
  const activeAccount = useAccountStore((s) => s.activeAccount)
  const isUnlocked = useAccountStore((s) => s.isUnlocked)

  // Set initial reference if provided
  useEffect(() => {
    if (initialReference && initialReference !== reference) {
      setReference(initialReference)
    }
  }, [initialReference, reference, setReference])

  // Auto-fetch when reference is set
  useEffect(() => {
    if (reference && status === 'idle') {
      fetchFile()
    }
  }, [reference, status, fetchFile])

  // Decrypt with active account's private key
  const decryptWithAccount = useCallback(async () => {
    if (!activeAccount?.privateKey) {
      throw new Error('No active account with private key')
    }
    await decryptWithPrivateKey(activeAccount.privateKey)
  }, [activeAccount?.privateKey, decryptWithPrivateKey])

  // Decrypt with provided key
  const decryptWithKey = useCallback(
    async (privateKey: string) => {
      await decryptWithPrivateKey(privateKey)
    },
    [decryptWithPrivateKey]
  )

  // Computed values
  const currentStep = useMemo(
    () => determineStep(status, needsDecryption, error),
    [status, needsDecryption, error]
  )

  const canPreview = useMemo(
    () => blobUrl !== null && isPreviewable(contentType),
    [blobUrl, contentType]
  )

  const isFetching = status === 'fetching'
  const isDecrypting = status === 'decrypting'
  const isComplete = status === 'complete'
  const hasActiveAccount = isUnlocked && activeAccount !== null

  return {
    // Reference
    reference,
    setReference,

    // Status
    status,
    progress,
    error,

    // File info
    filename,
    contentType,
    isEncrypted,
    needsDecryption,

    // Preview
    blobUrl,
    canPreview,

    // Actions
    fetchFile,
    decryptWithAccount,
    decryptWithKey,
    downloadToDevice,
    reset,
    clearError,

    // Computed
    currentStep,
    isFetching,
    isDecrypting,
    isComplete,
    hasActiveAccount,
  }
}

export default useDownload
