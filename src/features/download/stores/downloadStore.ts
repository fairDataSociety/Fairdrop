/**
 * Download Store
 *
 * Manages file download and decryption state using Zustand.
 */

import { create } from 'zustand'
import {
  downloadFile,
  triggerDownload,
  createBlobUrl,
  type DownloadResult,
} from '@/services/swarm'
import { decryptFile, hexToBytes, type DecryptedFile } from '@/services/swarm'

/**
 * Download status
 */
export type DownloadStatus =
  | 'idle'
  | 'fetching'
  | 'decrypting'
  | 'complete'
  | 'error'

/**
 * Download state
 */
interface DownloadState {
  // Reference
  reference: string | null

  // Download state
  status: DownloadStatus
  progress: number
  error: string | null

  // Raw downloaded data
  rawData: Uint8Array | null
  contentType: string | null
  filename: string | null

  // Decrypted result
  decryptedFile: DecryptedFile | null
  blobUrl: string | null

  // Flags
  isEncrypted: boolean
  needsDecryption: boolean
}

/**
 * Download actions
 */
interface DownloadActions {
  // Core actions
  setReference: (reference: string) => void
  fetchFile: () => Promise<void>
  decryptWithPrivateKey: (privateKey: string) => Promise<void>

  // File operations
  downloadToDevice: () => void
  getPreviewUrl: () => string | null

  // State management
  reset: () => void
  clearError: () => void
}

/**
 * Combined store type
 */
type DownloadStore = DownloadState & DownloadActions

/**
 * Initial state
 */
const initialState: DownloadState = {
  reference: null,
  status: 'idle',
  progress: 0,
  error: null,
  rawData: null,
  contentType: null,
  filename: null,
  decryptedFile: null,
  blobUrl: null,
  isEncrypted: false,
  needsDecryption: false,
}

/**
 * Check if data looks like encrypted content
 * Encrypted files have: [pubKeyLen(4)][pubKey][ivLen(4)][iv][ciphertext]
 */
function detectEncryption(data: Uint8Array): boolean {
  if (data.length < 100) return false

  // Read first length field
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const pubKeyLen = view.getUint32(0, true)

  // Uncompressed public key is 65 bytes, compressed is 33 bytes
  if (pubKeyLen !== 33 && pubKeyLen !== 65) return false

  // Check IV length field
  const ivOffset = 4 + pubKeyLen
  if (ivOffset + 4 > data.length) return false

  const ivLen = view.getUint32(ivOffset, true)
  // AES-GCM IV is typically 12 bytes
  if (ivLen !== 12) return false

  return true
}

/**
 * Parse encrypted data structure
 */
function parseEncryptedData(data: Uint8Array): {
  ephemeralPublicKey: Uint8Array
  iv: Uint8Array
  ciphertext: Uint8Array
} {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)

  // Read ephemeral public key
  const pubKeyLen = view.getUint32(0, true)
  const ephemeralPublicKey = data.slice(4, 4 + pubKeyLen)

  // Read IV
  const ivOffset = 4 + pubKeyLen
  const ivLen = view.getUint32(ivOffset, true)
  const iv = data.slice(ivOffset + 4, ivOffset + 4 + ivLen)

  // Rest is ciphertext
  const ciphertext = data.slice(ivOffset + 4 + ivLen)

  return { ephemeralPublicKey, iv, ciphertext }
}

/**
 * Download store
 */
export const useDownloadStore = create<DownloadStore>()((set, get) => ({
  ...initialState,

  /**
   * Set the reference to download
   */
  setReference: (reference: string) => {
    // Clean up previous blob URL
    const { blobUrl } = get()
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
    }

    set({
      ...initialState,
      reference,
    })
  },

  /**
   * Fetch file from Swarm
   */
  fetchFile: async () => {
    const { reference } = get()
    if (!reference) {
      set({ error: 'No reference provided' })
      return
    }

    set({ status: 'fetching', progress: 0, error: null })

    try {
      const result: DownloadResult = await downloadFile(reference, {
        onProgress: (progress) => set({ progress }),
      })

      // Check if data is encrypted
      const isEncrypted = detectEncryption(result.data)

      set({
        rawData: result.data,
        contentType: result.contentType,
        filename: result.filename,
        isEncrypted,
        needsDecryption: isEncrypted,
        status: isEncrypted ? 'idle' : 'complete',
        progress: 100,
      })

      // If not encrypted, create blob URL for preview
      if (!isEncrypted) {
        const blobUrl = createBlobUrl(result.data, result.contentType)
        set({ blobUrl })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed'
      set({ status: 'error', error: message })
    }
  },

  /**
   * Decrypt file with private key
   */
  decryptWithPrivateKey: async (privateKey: string) => {
    const { rawData } = get()
    if (!rawData) {
      set({ error: 'No data to decrypt' })
      return
    }

    set({ status: 'decrypting', error: null })

    try {
      // Parse encrypted structure
      const encryptedData = parseEncryptedData(rawData)

      // Convert private key from hex
      const privateKeyBytes = hexToBytes(privateKey)

      // Decrypt
      const decrypted = await decryptFile(encryptedData, privateKeyBytes)

      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(decrypted.file)

      set({
        decryptedFile: decrypted,
        blobUrl,
        filename: decrypted.metadata.name,
        contentType: decrypted.metadata.type,
        needsDecryption: false,
        status: 'complete',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Decryption failed'
      set({ status: 'error', error: message })
    }
  },

  /**
   * Download file to device
   */
  downloadToDevice: () => {
    const { decryptedFile, rawData, filename, contentType, isEncrypted } = get()

    if (isEncrypted && decryptedFile) {
      // Download decrypted file
      decryptedFile.file.arrayBuffer().then((buffer) => {
        const arr = new Uint8Array(buffer)
        triggerDownload(arr, decryptedFile.metadata.name, decryptedFile.metadata.type)
      })
    } else if (rawData && filename) {
      // Download raw file
      triggerDownload(rawData, filename, contentType || 'application/octet-stream')
    }
  },

  /**
   * Get preview URL
   */
  getPreviewUrl: (): string | null => {
    return get().blobUrl
  },

  /**
   * Reset store
   */
  reset: () => {
    const { blobUrl } = get()
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
    }
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
 * Selectors
 */
export const selectReference = (state: DownloadStore) => state.reference
export const selectStatus = (state: DownloadStore) => state.status
export const selectProgress = (state: DownloadStore) => state.progress
export const selectError = (state: DownloadStore) => state.error
export const selectFilename = (state: DownloadStore) => state.filename
export const selectContentType = (state: DownloadStore) => state.contentType
export const selectIsEncrypted = (state: DownloadStore) => state.isEncrypted
export const selectNeedsDecryption = (state: DownloadStore) => state.needsDecryption
export const selectDecryptedFile = (state: DownloadStore) => state.decryptedFile
export const selectBlobUrl = (state: DownloadStore) => state.blobUrl

/**
 * Computed selectors
 */
export const selectIsFetching = (state: DownloadStore) => state.status === 'fetching'
export const selectIsDecrypting = (state: DownloadStore) => state.status === 'decrypting'
export const selectIsComplete = (state: DownloadStore) => state.status === 'complete'
export const selectIsError = (state: DownloadStore) => state.status === 'error'

export default useDownloadStore
