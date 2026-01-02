/**
 * Upload Store
 *
 * Manages file upload state and flow using Zustand.
 * Supports multiple upload modes: send, store, quick, anonymous.
 */

import { create } from 'zustand'
import { uploadFile, uploadData, encryptFile, bytesToHex, hexToBytes } from '@/services/swarm'
import { writeToInbox, findNextSlot } from '@/services/swarm'
import { resolveRecipient, type RecipientResolution } from '@/services/ens'
import { addMessage } from '@/services/storage'
import type { Message, UploadMode, UploadStatus, UploadResult, InboxParams } from '@/shared/types'

/**
 * Recipient info resolved from ENS
 */
interface ResolvedRecipient {
  displayName: string
  publicKey: string
  inboxParams?: InboxParams
}

/**
 * Upload state
 */
interface UploadState {
  // File selection
  file: File | null
  files: File[] // For multi-file upload

  // Recipient
  recipientInput: string
  resolvedRecipient: ResolvedRecipient | null
  isResolvingRecipient: boolean

  // Upload configuration
  mode: UploadMode

  // Progress tracking
  status: UploadStatus
  progress: number
  error: string | null

  // Result
  result: UploadResult | null
}

/**
 * Upload actions
 */
interface UploadActions {
  // File management
  setFile: (file: File | null) => void
  setFiles: (files: File[]) => void
  clearFiles: () => void

  // Recipient
  setRecipientInput: (input: string) => void
  resolveRecipientInput: () => Promise<void>
  clearRecipient: () => void

  // Configuration
  setMode: (mode: UploadMode) => void

  // Upload execution
  startUpload: (senderSubdomain?: string) => Promise<UploadResult>
  cancelUpload: () => void

  // State management
  reset: () => void
  clearError: () => void
}

/**
 * Combined store type
 */
type UploadStore = UploadState & UploadActions

/**
 * Initial state
 */
const initialState: UploadState = {
  file: null,
  files: [],
  recipientInput: '',
  resolvedRecipient: null,
  isResolvingRecipient: false,
  mode: 'send',
  status: 'idle',
  progress: 0,
  error: null,
  result: null,
}

/**
 * Upload store
 */
export const useUploadStore = create<UploadStore>()((set, get) => ({
  ...initialState,

  /**
   * Set single file for upload
   */
  setFile: (file: File | null) => {
    set({
      file,
      files: file ? [file] : [],
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
    })
  },

  /**
   * Set multiple files for upload
   */
  setFiles: (files: File[]) => {
    set({
      file: files[0] ?? null,
      files,
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
    })
  },

  /**
   * Clear selected files
   */
  clearFiles: () => {
    set({
      file: null,
      files: [],
    })
  },

  /**
   * Set recipient input (ENS name or public key)
   */
  setRecipientInput: (input: string) => {
    set({
      recipientInput: input,
      resolvedRecipient: null,
    })
  },

  /**
   * Resolve recipient from ENS
   */
  resolveRecipientInput: async () => {
    const { recipientInput } = get()
    if (!recipientInput) return

    set({ isResolvingRecipient: true, error: null })

    try {
      const resolved: RecipientResolution = await resolveRecipient(recipientInput)

      if (!resolved.publicKey) {
        set({
          error: `Could not resolve recipient: ${recipientInput}`,
          isResolvingRecipient: false,
        })
        return
      }

      const recipient: ResolvedRecipient = {
        displayName: resolved.ensName ?? recipientInput,
        publicKey: resolved.publicKey,
      }

      // Add inbox params if available (not null)
      if (resolved.inboxParams) {
        recipient.inboxParams = resolved.inboxParams
      }

      set({
        resolvedRecipient: recipient,
        isResolvingRecipient: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve recipient'
      set({ error: message, isResolvingRecipient: false })
    }
  },

  /**
   * Clear recipient
   */
  clearRecipient: () => {
    set({
      recipientInput: '',
      resolvedRecipient: null,
    })
  },

  /**
   * Set upload mode
   */
  setMode: (mode: UploadMode) => {
    set({ mode })
  },

  /**
   * Start the upload process
   */
  startUpload: async (senderSubdomain?: string): Promise<UploadResult> => {
    const { file, mode, resolvedRecipient } = get()

    if (!file) {
      throw new Error('No file selected')
    }

    // Validate requirements based on mode
    if (mode === 'send' && !resolvedRecipient) {
      throw new Error('Recipient required for send mode')
    }

    set({ status: 'encrypting', progress: 0, error: null })

    try {
      let reference: string
      let ephemeralPublicKey: string | undefined

      if (mode === 'send' && resolvedRecipient) {
        // Mode: Send encrypted to recipient
        set({ status: 'encrypting' })

        const recipientPubKey = hexToBytes(resolvedRecipient.publicKey.replace('0x', ''))
        const encrypted = await encryptFile(file, recipientPubKey)

        set({ status: 'uploading' })

        // Combine encrypted data and upload
        const combined = combineEncryptedData(encrypted)
        reference = await uploadData(combined, {
          contentType: 'application/octet-stream',
          filename: 'encrypted',
          onProgress: (p) => set({ progress: p }),
        })

        ephemeralPublicKey = bytesToHex(encrypted.ephemeralPublicKey)

        // Notify recipient via GSOC if they have inbox params
        if (resolvedRecipient.inboxParams) {
          set({ status: 'notifying' })

          const nextSlot = await findNextSlot(resolvedRecipient.inboxParams)

          // Build payload - only include senderInfo if we have a sender
          const payload = senderSubdomain
            ? { reference, senderInfo: { from: senderSubdomain, filename: file.name } }
            : { reference }

          await writeToInbox(
            resolvedRecipient.inboxParams,
            nextSlot,
            payload,
            { anonymous: false }
          )
        }

        // Store in sent messages if we have sender info
        if (senderSubdomain) {
          const sentMessage: Message = {
            reference,
            filename: file.name,
            size: file.size,
            to: resolvedRecipient.displayName,
            timestamp: Date.now(),
            encrypted: true,
          }
          addMessage(senderSubdomain, 'sent', sentMessage)
        }
      } else if (mode === 'store') {
        // Mode: Store for self (simple upload, encryption at download)
        set({ status: 'uploading' })

        reference = await uploadFile(file, {
          onProgress: (p) => set({ progress: p }),
        })

        // Store in stored messages
        if (senderSubdomain) {
          const storedMessage: Message = {
            reference,
            filename: file.name,
            size: file.size,
            timestamp: Date.now(),
            encrypted: false, // Will encrypt at download with account key
          }
          addMessage(senderSubdomain, 'stored', storedMessage)
        }
      } else {
        // Mode: Quick share (unencrypted)
        set({ status: 'uploading' })

        reference = await uploadFile(file, {
          onProgress: (p) => set({ progress: p }),
        })
      }

      const result: UploadResult = {
        reference,
        url: `${window.location.origin}/download/${reference}`,
      }

      if (ephemeralPublicKey) {
        result.ephemeralPublicKey = ephemeralPublicKey
      }

      set({
        status: 'complete',
        progress: 100,
        result,
      })

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      set({
        status: 'error',
        error: message,
      })
      throw error
    }
  },

  /**
   * Cancel ongoing upload
   */
  cancelUpload: () => {
    // Note: Actual cancellation would require AbortController integration
    set({
      status: 'idle',
      progress: 0,
    })
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState)
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * Combine encrypted file data into a single Uint8Array for upload
 */
function combineEncryptedData(encrypted: {
  ephemeralPublicKey: Uint8Array
  iv: Uint8Array
  ciphertext: Uint8Array
}): Uint8Array {
  const pubKey = encrypted.ephemeralPublicKey
  const iv = encrypted.iv
  const ciphertext = encrypted.ciphertext

  // Calculate total size: [pubKeyLen(4)][pubKey][ivLen(4)][iv][ciphertext]
  const totalSize = 4 + pubKey.length + 4 + iv.length + ciphertext.length
  const result = new Uint8Array(totalSize)

  let offset = 0

  // Write ephemeral public key length and data
  new DataView(result.buffer).setUint32(offset, pubKey.length, true)
  offset += 4
  result.set(pubKey, offset)
  offset += pubKey.length

  // Write IV length and data
  new DataView(result.buffer).setUint32(offset, iv.length, true)
  offset += 4
  result.set(iv, offset)
  offset += iv.length

  // Write ciphertext
  result.set(ciphertext, offset)

  return result
}

/**
 * Selectors
 */
export const selectFile = (state: UploadStore) => state.file
export const selectFiles = (state: UploadStore) => state.files
export const selectMode = (state: UploadStore) => state.mode
export const selectStatus = (state: UploadStore) => state.status
export const selectProgress = (state: UploadStore) => state.progress
export const selectError = (state: UploadStore) => state.error
export const selectResult = (state: UploadStore) => state.result
export const selectRecipient = (state: UploadStore) => state.resolvedRecipient
export const selectIsResolvingRecipient = (state: UploadStore) => state.isResolvingRecipient

/**
 * Computed selectors
 */
export const selectCanUpload = (state: UploadStore) => {
  if (!state.file) return false
  if (state.status !== 'idle') return false
  if (state.mode === 'send' && !state.resolvedRecipient) return false
  return true
}

export const selectIsUploading = (state: UploadStore) =>
  state.status === 'encrypting' || state.status === 'uploading' || state.status === 'notifying'

export default useUploadStore
