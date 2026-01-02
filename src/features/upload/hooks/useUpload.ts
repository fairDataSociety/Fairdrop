/**
 * useUpload Hook
 *
 * Upload orchestration hook that wraps the upload store
 * with additional logic for wizard flow management.
 */

import { useCallback, useMemo } from 'react'
import { useUploadStore } from '../stores/uploadStore'
import { useAccountStore } from '@/features/account/stores/accountStore'
import type { UploadMode, UploadStatus } from '@/shared/types'

/**
 * Upload wizard steps
 */
export type UploadStep = 'file' | 'recipient' | 'mode' | 'progress' | 'complete'

/**
 * Upload hook return type
 */
interface UseUploadReturn {
  // File state
  file: File | null
  files: File[]
  setFile: (file: File | null) => void
  setFiles: (files: File[]) => void
  clearFiles: () => void

  // Recipient state
  recipientInput: string
  resolvedRecipient: {
    displayName: string
    publicKey: string
  } | null
  isResolvingRecipient: boolean
  setRecipientInput: (input: string) => void
  resolveRecipient: () => Promise<void>
  clearRecipient: () => void

  // Mode state
  mode: UploadMode
  setMode: (mode: UploadMode) => void

  // Upload state
  status: UploadStatus
  progress: number
  error: string | null
  result: {
    reference: string
    url: string
    ephemeralPublicKey?: string
  } | null

  // Actions
  startUpload: () => Promise<void>
  cancelUpload: () => void
  reset: () => void
  clearError: () => void

  // Wizard helpers
  currentStep: UploadStep
  canProceed: boolean
  isUploading: boolean
  isComplete: boolean
}

/**
 * Determine current wizard step based on state
 */
function determineStep(
  file: File | null,
  mode: UploadMode,
  resolvedRecipient: { displayName: string; publicKey: string } | null,
  status: UploadStatus
): UploadStep {
  // If upload is in progress or notifying
  if (status === 'encrypting' || status === 'uploading' || status === 'notifying') {
    return 'progress'
  }

  // If upload is complete
  if (status === 'complete') {
    return 'complete'
  }

  // No file selected yet
  if (!file) {
    return 'file'
  }

  // For send mode, need recipient
  if (mode === 'send' && !resolvedRecipient) {
    return 'recipient'
  }

  // Mode selection (also serves as confirmation step)
  return 'mode'
}

/**
 * useUpload hook
 */
export function useUpload(): UseUploadReturn {
  // Get upload store state and actions
  const file = useUploadStore((s) => s.file)
  const files = useUploadStore((s) => s.files)
  const setFile = useUploadStore((s) => s.setFile)
  const setFiles = useUploadStore((s) => s.setFiles)
  const clearFiles = useUploadStore((s) => s.clearFiles)

  const recipientInput = useUploadStore((s) => s.recipientInput)
  const resolvedRecipient = useUploadStore((s) => s.resolvedRecipient)
  const isResolvingRecipient = useUploadStore((s) => s.isResolvingRecipient)
  const setRecipientInput = useUploadStore((s) => s.setRecipientInput)
  const resolveRecipientInput = useUploadStore((s) => s.resolveRecipientInput)
  const clearRecipient = useUploadStore((s) => s.clearRecipient)

  const mode = useUploadStore((s) => s.mode)
  const setMode = useUploadStore((s) => s.setMode)

  const status = useUploadStore((s) => s.status)
  const progress = useUploadStore((s) => s.progress)
  const error = useUploadStore((s) => s.error)
  const result = useUploadStore((s) => s.result)

  const storeStartUpload = useUploadStore((s) => s.startUpload)
  const cancelUpload = useUploadStore((s) => s.cancelUpload)
  const reset = useUploadStore((s) => s.reset)
  const clearError = useUploadStore((s) => s.clearError)

  // Get active account for sender info
  const activeAccount = useAccountStore((s) => s.activeAccount)

  // Wrap resolveRecipient to handle errors
  const resolveRecipient = useCallback(async () => {
    try {
      await resolveRecipientInput()
    } catch (err) {
      // Error is handled in store
      console.error('[Upload] Failed to resolve recipient:', err)
    }
  }, [resolveRecipientInput])

  // Wrap startUpload to include sender subdomain
  const startUpload = useCallback(async () => {
    try {
      await storeStartUpload(activeAccount?.subdomain)
    } catch (err) {
      // Error is handled in store
      console.error('[Upload] Upload failed:', err)
    }
  }, [storeStartUpload, activeAccount?.subdomain])

  // Computed values
  const currentStep = useMemo(
    () => determineStep(file, mode, resolvedRecipient, status),
    [file, mode, resolvedRecipient, status]
  )

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'file':
        return file !== null
      case 'recipient':
        return resolvedRecipient !== null
      case 'mode':
        return true // Can always proceed from mode selection
      case 'progress':
        return false // Can't proceed while uploading
      case 'complete':
        return false // Upload is done
      default:
        return false
    }
  }, [currentStep, file, resolvedRecipient])

  const isUploading =
    status === 'encrypting' || status === 'uploading' || status === 'notifying'

  const isComplete = status === 'complete'

  return {
    // File state
    file,
    files,
    setFile,
    setFiles,
    clearFiles,

    // Recipient state
    recipientInput,
    resolvedRecipient,
    isResolvingRecipient,
    setRecipientInput,
    resolveRecipient,
    clearRecipient,

    // Mode state
    mode,
    setMode,

    // Upload state
    status,
    progress,
    error,
    result,

    // Actions
    startUpload,
    cancelUpload,
    reset,
    clearError,

    // Wizard helpers
    currentStep,
    canProceed,
    isUploading,
    isComplete,
  }
}

export default useUpload
