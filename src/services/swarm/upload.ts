/**
 * File Upload Module
 * Handles uploading files to Swarm with progress tracking
 */

import { getDefaultStampId } from './client'
import type { ProgressCallback, StatusCallback } from '@/shared/types'

// Local Bee node URL (Swarm Desktop)
const LOCAL_BEE = 'http://localhost:1633'

// Gateway proxy URL (avoids CORS)
const GATEWAY_PROXY = '/api/swarm'

export interface UploadOptions {
  onProgress?: ProgressCallback
  onStatusChange?: StatusCallback
  contentType?: string
  filename?: string
}

export interface UploadResult {
  reference: string
  url: string
}

interface StampResponse {
  stamps?: Array<{ batchID: string; usable: boolean }>
}

interface BzzResponse {
  reference: string
}

/**
 * Check if local Bee node is available with a usable stamp
 */
async function getLocalStamp(): Promise<string | null> {
  try {
    const response = await fetch(`${LOCAL_BEE}/stamps`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as StampResponse
    // Find a usable stamp
    const usableStamp = data.stamps?.find((s) => s.usable)
    return usableStamp?.batchID ?? null
  } catch {
    return null
  }
}

/**
 * Upload to local Bee node with stamp
 */
async function uploadToLocalBee(
  file: File,
  stampId: string,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, onStatusChange } = options

  onStatusChange?.('uploading')

  const response = await fetch(`${LOCAL_BEE}/bzz?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Swarm-Postage-Batch-Id': stampId,
    },
    body: file,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }

  const result = (await response.json()) as BzzResponse

  onProgress?.(100)
  onStatusChange?.('complete')

  return result.reference
}

/**
 * Upload via proxy (avoids CORS issues)
 */
async function uploadToGateway(file: File, options: UploadOptions = {}): Promise<string> {
  const { onProgress, onStatusChange } = options

  const stampId = getDefaultStampId()

  if (!stampId) {
    throw new Error(
      'No postage stamp configured. Please set VITE_DEFAULT_STAMP_ID or buy a local stamp in Swarm Desktop.'
    )
  }

  onStatusChange?.('uploading')

  const response = await fetch(`${GATEWAY_PROXY}/bzz?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Swarm-Postage-Batch-Id': String(stampId),
    },
    body: file,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }

  const result = (await response.json()) as BzzResponse

  onProgress?.(100)
  onStatusChange?.('complete')

  return result.reference
}

/**
 * Upload a single file to Swarm
 * Tries local Bee node first (if stamp available), falls back to FDS gateway
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
  const { onStatusChange } = options

  onStatusChange?.('idle')

  // Try local Bee node first
  const localStamp = await getLocalStamp()

  if (localStamp) {
    return uploadToLocalBee(file, localStamp, options)
  }

  // Fall back to FDS gateway
  return uploadToGateway(file, options)
}

/**
 * Upload multiple files as a collection
 */
export async function uploadFiles(
  files: FileList | File[],
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, onStatusChange } = options

  onStatusChange?.('idle')

  // Convert FileList to array
  const fileArray = Array.from(files)

  // For single file, use uploadFile
  if (fileArray.length === 1 && fileArray[0]) {
    return uploadFile(fileArray[0], options)
  }

  // For multiple files, upload first file only
  // TODO: Implement collection upload with tar
  onStatusChange?.('uploading')

  const firstFile = fileArray[0]
  if (!firstFile) {
    throw new Error('No files provided')
  }

  const reference = await uploadFile(firstFile, options)

  onProgress?.(100)
  onStatusChange?.('complete')

  return reference
}

/**
 * Upload raw data to Swarm
 */
export async function uploadData(data: Uint8Array, options: UploadOptions = {}): Promise<string> {
  const { contentType = 'application/octet-stream', filename = 'data' } = options

  // Create a Blob and File from raw data
  // Use ArrayBuffer to avoid TypeScript strictness with Uint8Array
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: contentType })
  const file = new File([blob], filename, { type: contentType })

  return uploadFile(file, options)
}

/**
 * Generate a shareable link for a Swarm reference
 */
export function getShareableLink(reference: string, filename?: string): string {
  const baseUrl = window.location.origin
  if (filename) {
    return `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`
  }
  return `${baseUrl}/download/${reference}`
}

/**
 * Generate a gateway link for direct download
 */
export function getGatewayLink(reference: string): string {
  return `https://bee-1.fairdatasociety.org/bzz/${reference}`
}
