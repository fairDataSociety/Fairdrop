/**
 * File Download Module
 * Handles downloading files from Swarm
 * Tries local Bee node first, then public gateways
 */

import { Bee } from '@ethersphere/bee-js'

// Bee endpoints to try in order
const LOCAL_BEE = 'http://localhost:1633'
const PUBLIC_GATEWAYS = [
  'https://bee-1.fairdatasociety.org',
  'https://gateway.fairdatasociety.org'
]

/**
 * Check if local Bee node is accessible
 */
const isLocalBeeAvailable = async () => {
  try {
    const response = await fetch(`${LOCAL_BEE}/health`, {
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Try to download from a specific Bee endpoint
 */
const tryDownloadFrom = async (beeUrl, reference) => {
  const bee = new Bee(beeUrl)

  try {
    // Try to download as file first (preserves filename/content-type)
    const result = await bee.downloadFile(reference)
    return {
      data: result.data,
      contentType: result.contentType || 'application/octet-stream',
      filename: result.name || `file-${reference.slice(0, 8)}`
    }
  } catch (error) {
    // If file download fails, try raw data
    console.warn(`File download from ${beeUrl} failed, trying raw data:`, error.message)
    const data = await bee.downloadData(reference)
    return {
      data,
      contentType: 'application/octet-stream',
      filename: `file-${reference.slice(0, 8)}`
    }
  }
}

/**
 * Download a file from Swarm
 * Tries local Bee node first, then public gateways
 * @param {string} reference - Swarm reference (hash)
 * @param {Object} options - Download options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Object with data (Uint8Array), contentType, and filename
 */
export const downloadFile = async (reference, options = {}) => {
  const { onProgress } = options

  // Build list of endpoints to try
  const endpoints = []

  // Check if local Bee is available first
  if (await isLocalBeeAvailable()) {
    console.log('Local Bee node available, trying it first')
    endpoints.push(LOCAL_BEE)
  }

  // Add public gateways as fallback
  endpoints.push(...PUBLIC_GATEWAYS)

  // Try each endpoint in order
  let lastError = null
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to download from: ${endpoint}`)
      const result = await tryDownloadFrom(endpoint, reference)
      onProgress?.(100)
      console.log(`Download successful from: ${endpoint}`)
      return result
    } catch (error) {
      console.warn(`Download from ${endpoint} failed:`, error.message)
      lastError = error
    }
  }

  // All endpoints failed
  throw lastError || new Error('Download failed from all endpoints')
}

/**
 * Download raw data from Swarm
 * @param {string} reference - Swarm reference
 * @returns {Promise<Uint8Array>} The raw data
 */
export const downloadData = async (reference) => {
  const endpoints = []

  if (await isLocalBeeAvailable()) {
    endpoints.push(LOCAL_BEE)
  }
  endpoints.push(...PUBLIC_GATEWAYS)

  let lastError = null
  for (const endpoint of endpoints) {
    try {
      const bee = new Bee(endpoint)
      return await bee.downloadData(reference)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Download failed from all endpoints')
}

/**
 * Check if a reference exists on Swarm
 * @param {string} reference - Swarm reference
 * @returns {Promise<boolean>} True if the reference exists
 */
export const checkReference = async (reference) => {
  const endpoints = []

  if (await isLocalBeeAvailable()) {
    endpoints.push(LOCAL_BEE)
  }
  endpoints.push(...PUBLIC_GATEWAYS)

  for (const endpoint of endpoints) {
    try {
      const bee = new Bee(endpoint)
      await bee.downloadData(reference)
      return true
    } catch {
      // Continue to next endpoint
    }
  }
  return false
}

/**
 * Stream download (for large files)
 * Note: This is a placeholder - full implementation needs ReadableStream support
 * @param {string} reference - Swarm reference
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<void>}
 */
export const streamDownload = async (reference, onChunk) => {
  // For now, just download the whole file using multi-endpoint approach
  const data = await downloadData(reference)
  onChunk(data, true)
}

/**
 * Create a Blob URL for downloaded data
 * @param {Uint8Array} data - File data
 * @param {string} contentType - MIME type
 * @returns {string} Blob URL
 */
export const createBlobUrl = (data, contentType = 'application/octet-stream') => {
  const blob = new Blob([data], { type: contentType })
  return URL.createObjectURL(blob)
}

/**
 * Trigger browser download
 * @param {Uint8Array} data - File data
 * @param {string} filename - Filename for download
 * @param {string} contentType - MIME type
 */
export const triggerDownload = (data, filename, contentType = 'application/octet-stream') => {
  const blob = new Blob([data], { type: contentType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default {
  downloadFile,
  downloadData,
  checkReference,
  streamDownload,
  createBlobUrl,
  triggerDownload
}
