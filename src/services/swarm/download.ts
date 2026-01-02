/**
 * File Download Module
 * Handles downloading files from Swarm
 * Tries configured Bee node first, then local, then public gateways
 */

import { Bee } from '@ethersphere/bee-js'
import type { ProgressCallback } from '@/shared/types'

// Bee endpoints
const LOCAL_BEE = 'http://localhost:1633'
const PUBLIC_GATEWAYS = [
  'https://bee-1.fairdatasociety.org',
  'https://gateway.fairdatasociety.org',
]

// Get configured Bee URL from environment
const CONFIGURED_BEE = import.meta.env.VITE_BEE_URL as string | undefined

export interface DownloadOptions {
  onProgress?: ProgressCallback
}

export interface DownloadResult {
  data: Uint8Array
  contentType: string
  filename: string
}

/**
 * Check if local Bee node is accessible
 */
async function isLocalBeeAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_BEE}/health`, {
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get ordered list of endpoints to try
 */
async function getEndpoints(): Promise<string[]> {
  const endpoints: string[] = []

  // If configured Bee URL is set, try it first
  if (CONFIGURED_BEE && CONFIGURED_BEE !== LOCAL_BEE) {
    endpoints.push(CONFIGURED_BEE)
  }

  // Check if local Bee is available
  if (await isLocalBeeAvailable()) {
    endpoints.push(LOCAL_BEE)
  }

  // Add public gateways as fallback
  endpoints.push(...PUBLIC_GATEWAYS)

  return endpoints
}

/**
 * Convert bee-js Bytes to Uint8Array
 * bee-js uses a branded Bytes type that isn't directly assignable to Uint8Array
 */
function toUint8Array(data: unknown): Uint8Array {
  // bee-js returns a Bytes type that may not be a proper Uint8Array
  // Cast through unknown to create a proper Uint8Array
  return new Uint8Array(data as ArrayLike<number>)
}

/**
 * Try to download from a specific Bee endpoint
 */
async function tryDownloadFrom(beeUrl: string, reference: string): Promise<DownloadResult> {
  const bee = new Bee(beeUrl)

  try {
    // Try to download as file first (preserves filename/content-type)
    const result = await bee.downloadFile(reference)
    return {
      data: toUint8Array(result.data),
      contentType: result.contentType || 'application/octet-stream',
      filename: result.name || `file-${reference.slice(0, 8)}`,
    }
  } catch {
    // If file download fails, try raw data
    const data = await bee.downloadData(reference)
    return {
      data: toUint8Array(data),
      contentType: 'application/octet-stream',
      filename: `file-${reference.slice(0, 8)}`,
    }
  }
}

/**
 * Download a file from Swarm
 * Tries local Bee node first, then public gateways
 */
export async function downloadFile(
  reference: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const { onProgress } = options

  const endpoints = await getEndpoints()

  // Try each endpoint in order
  let lastError: Error | null = null
  for (const endpoint of endpoints) {
    try {
      const result = await tryDownloadFrom(endpoint, reference)
      onProgress?.(100)
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  // All endpoints failed
  throw lastError ?? new Error('Download failed from all endpoints')
}

/**
 * Download raw data from Swarm
 */
export async function downloadData(reference: string): Promise<Uint8Array> {
  const endpoints = await getEndpoints()

  let lastError: Error | null = null
  for (const endpoint of endpoints) {
    try {
      const bee = new Bee(endpoint)
      return toUint8Array(await bee.downloadData(reference))
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError ?? new Error('Download failed from all endpoints')
}

/**
 * Check if a reference exists on Swarm
 */
export async function checkReference(reference: string): Promise<boolean> {
  const endpoints = await getEndpoints()

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
 * Create ArrayBuffer from Uint8Array for Blob construction
 * Explicitly type as ArrayBuffer to satisfy strict TypeScript
 */
function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  // slice() returns ArrayBuffer | SharedArrayBuffer, but we know it's ArrayBuffer
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
}

/**
 * Create a Blob URL for downloaded data
 */
export function createBlobUrl(data: Uint8Array, contentType = 'application/octet-stream'): string {
  const blob = new Blob([toArrayBuffer(data)], { type: contentType })
  return URL.createObjectURL(blob)
}

/**
 * Trigger browser download
 */
export function triggerDownload(
  data: Uint8Array,
  filename: string,
  contentType = 'application/octet-stream'
): void {
  const blob = new Blob([toArrayBuffer(data)], { type: contentType })
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
