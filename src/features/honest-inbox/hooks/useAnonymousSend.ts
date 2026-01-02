/**
 * useAnonymousSend Hook
 *
 * Provides anonymous file sending functionality for Honest Inbox.
 * Sender identity is NOT revealed to the recipient.
 */

import { useCallback } from 'react'
import { useHonestInboxStore } from '../stores/honestInboxStore'
import type { UploadStatus } from '@/shared/types'

/**
 * Anonymous send result
 */
interface AnonymousSendResult {
  reference: string
  downloadUrl: string
}

/**
 * Hook return type
 */
interface UseAnonymousSendReturn {
  // State
  file: File | null
  recipientPublicKey: string
  status: UploadStatus
  progress: number
  result: AnonymousSendResult | null
  error: string | null

  // Actions
  setFile: (file: File | null) => void
  setRecipientPublicKey: (key: string) => void
  send: () => Promise<AnonymousSendResult>
  reset: () => void

  // Computed
  canSend: boolean
  isIdle: boolean
  isEncrypting: boolean
  isUploading: boolean
  isComplete: boolean
  hasError: boolean
}

/**
 * useAnonymousSend hook
 */
export function useAnonymousSend(): UseAnonymousSendReturn {
  // Get send state from store
  const sendState = useHonestInboxStore((s) => s.send)
  const { file, recipientPublicKey, status, progress, result, error } = sendState

  // Get store actions
  const storeSetFile = useHonestInboxStore((s) => s.setSendFile)
  const storeSetRecipientPublicKey = useHonestInboxStore((s) => s.setRecipientPublicKey)
  const storeSendAnonymously = useHonestInboxStore((s) => s.sendAnonymously)
  const storeResetSend = useHonestInboxStore((s) => s.resetSend)

  // Actions
  const setFile = useCallback(
    (newFile: File | null) => {
      storeSetFile(newFile)
    },
    [storeSetFile]
  )

  const setRecipientPublicKey = useCallback(
    (key: string) => {
      storeSetRecipientPublicKey(key)
    },
    [storeSetRecipientPublicKey]
  )

  const send = useCallback(async (): Promise<AnonymousSendResult> => {
    return storeSendAnonymously()
  }, [storeSendAnonymously])

  const reset = useCallback(() => {
    storeResetSend()
  }, [storeResetSend])

  // Computed values
  const canSend = file !== null && recipientPublicKey.length > 0 && status === 'idle'
  const isIdle = status === 'idle'
  const isEncrypting = status === 'encrypting'
  const isUploading = status === 'uploading'
  const isComplete = status === 'complete'
  const hasError = status === 'error'

  return {
    // State
    file,
    recipientPublicKey,
    status,
    progress,
    result,
    error,

    // Actions
    setFile,
    setRecipientPublicKey,
    send,
    reset,

    // Computed
    canSend,
    isIdle,
    isEncrypting,
    isUploading,
    isComplete,
    hasError,
  }
}

export default useAnonymousSend
