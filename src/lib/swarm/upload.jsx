/**
 * File Upload Module
 * Handles uploading files to Swarm with progress tracking
 */

import { getBee, getDefaultStampId } from './client'

// Local Bee node URL (Swarm Desktop)
const LOCAL_BEE = 'http://localhost:1633'

// FDS Gateway as fallback (via proxy in dev)
// Use bee-1 gateway consistently for both upload and download
const FDS_GATEWAY = import.meta.env.DEV
  ? '/api/swarm'
  : 'https://bee-1.fairdatasociety.org'

/**
 * Check if local Bee node is available with a usable stamp
 */
const getLocalStamp = async () => {
  try {
    const response = await fetch(`${LOCAL_BEE}/stamps`, {
      signal: AbortSignal.timeout(2000)
    })
    if (!response.ok) return null
    const data = await response.json()
    // Find a usable stamp
    const usableStamp = data.stamps?.find(s => s.usable)
    return usableStamp?.batchID || null
  } catch {
    return null
  }
}

/**
 * Upload a single file to Swarm
 * Tries local Bee node first (if stamp available), falls back to FDS gateway
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @param {Function} options.onStatusChange - Status change callback
 * @returns {Promise<string>} The Swarm reference (hash)
 */
export const uploadFile = async (file, options = {}) => {
  const {
    onProgress,
    onStatusChange
  } = options

  onStatusChange?.('preparing')

  // Try local Bee node first
  const localStamp = await getLocalStamp()

  if (localStamp) {
    console.log('Using local Bee node with stamp:', localStamp)
    return uploadToLocalBee(file, localStamp, options)
  }

  // Fall back to FDS gateway
  console.log('Using FDS gateway (no local stamp)')
  return uploadToGateway(file, options)
}

/**
 * Upload to local Bee node with stamp
 */
const uploadToLocalBee = async (file, stampId, options = {}) => {
  const { onProgress, onStatusChange } = options

  onStatusChange?.('uploading')

  const response = await fetch(`${LOCAL_BEE}/bzz?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Swarm-Postage-Batch-Id': stampId
    },
    body: file
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }

  const result = await response.json()

  onProgress?.(100)
  onStatusChange?.('complete')

  return result.reference
}

/**
 * Upload to FDS gateway (handles stamps internally)
 */
const uploadToGateway = async (file, options = {}) => {
  const { onProgress, onStatusChange } = options

  console.log('[Upload] Starting upload to gateway:', FDS_GATEWAY)
  console.log('[Upload] File:', file.name, file.size, file.type)

  onStatusChange?.('uploading')

  const formData = new FormData()
  formData.append('file', file, file.name)

  try {
    const response = await fetch(`${FDS_GATEWAY}/bzz`, {
      method: 'POST',
      body: formData
    })

    console.log('[Upload] Response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('[Upload] Error response:', error)
      throw new Error(`Upload failed: ${error}`)
    }

    const result = await response.json()
    console.log('[Upload] Success! Reference:', result.reference)

    onProgress?.(100)
    onStatusChange?.('complete')

    return result.reference
  } catch (err) {
    console.error('[Upload] Fetch error:', err)
    throw err
  }
}

/**
 * Upload multiple files as a collection
 * @param {FileList|File[]} files - Files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} The Swarm reference for the collection
 */
export const uploadFiles = async (files, options = {}) => {
  const {
    onProgress,
    onStatusChange
  } = options

  onStatusChange?.('preparing')

  // Convert FileList to array
  const fileArray = Array.from(files)

  // For single file, use uploadFile
  if (fileArray.length === 1) {
    return uploadFile(fileArray[0], options)
  }

  // For multiple files, create a tar or upload individually
  // For now, upload first file only (collection upload requires tar)
  onStatusChange?.('uploading')

  const reference = await uploadFile(fileArray[0], options)

  onProgress?.(100)
  onStatusChange?.('complete')

  return reference
}

/**
 * Upload raw data to Swarm
 * @param {Uint8Array} data - Data to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} The Swarm reference
 */
export const uploadData = async (data, options = {}) => {
  const {
    contentType = 'application/octet-stream',
    filename = 'data'
  } = options

  // Create a Blob and File from raw data
  const blob = new Blob([data], { type: contentType })
  const file = new File([blob], filename, { type: contentType })

  return uploadFile(file, options)
}

/**
 * Generate a shareable link for a Swarm reference
 * @param {string} reference - Swarm reference
 * @param {string} filename - Optional filename to include
 * @returns {string} Shareable download URL
 */
export const getShareableLink = (reference, filename = null) => {
  const baseUrl = window.location.origin
  if (filename) {
    return `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`
  }
  return `${baseUrl}/download/${reference}`
}

/**
 * Generate a gateway link for direct download
 * @param {string} reference - Swarm reference
 * @returns {string} Gateway URL
 */
export const getGatewayLink = (reference) => {
  return `https://bee-1.fairdatasociety.org/bzz/${reference}`
}

export default {
  uploadFile,
  uploadFiles,
  uploadData,
  getShareableLink,
  getGatewayLink
}
