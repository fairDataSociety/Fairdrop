/**
 * Postage Stamp Management
 * Handles postage stamp operations for Swarm storage
 */

import { getBee } from './client'
import type { PostageStamp } from '@/shared/types'

// Local Bee node URL
const LOCAL_BEE = 'http://localhost:1633'

// Sponsored stamp API endpoint for free tier
const SPONSOR_API = (import.meta.env.VITE_SPONSOR_API as string) || '/api/free-stamp'

interface StampsResponse {
  stamps?: PostageStamp[]
}

interface SponsoredStampResponse {
  batchId: string
  expiresAt: number
  remainingCapacity: number
}

interface StampCapacity {
  depth: number
  bucketDepth: number
  totalChunks: number
  buckets: number
  usable: boolean
  exists: boolean
}

interface StorageCost {
  chunks: number
  blocks: number
  costPlur: number
  costBZZ: number
  days: number
}

/**
 * Check if local Bee node is available
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
 * Get all available postage stamps from local Bee
 */
export async function getLocalStamps(): Promise<PostageStamp[]> {
  try {
    const response = await fetch(`${LOCAL_BEE}/stamps`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return []
    const data = (await response.json()) as StampsResponse
    return data.stamps ?? []
  } catch {
    return []
  }
}

/**
 * Get all available postage stamps
 * Tries local Bee first, then falls back to configured Bee node
 */
export async function getAllStamps(): Promise<PostageStamp[]> {
  // Try local Bee first
  if (await isLocalBeeAvailable()) {
    const localStamps = await getLocalStamps()
    if (localStamps.length > 0) {
      return localStamps.filter((s) => s.usable)
    }
  }

  // Fall back to configured Bee node
  const bee = getBee()
  try {
    const stamps = await bee.getAllPostageBatch()
    // Convert bee-js PostageBatch to our PostageStamp type
    return stamps
      .filter((s) => s.usable)
      .map((s) => ({
        batchID: String(s.batchID),
        utilization: s.utilization,
        usable: s.usable,
        label: s.label,
        depth: s.depth,
        amount: s.amount,
        bucketDepth: s.bucketDepth,
        blockNumber: s.blockNumber,
        immutableFlag: s.immutableFlag,
      })) as PostageStamp[]
  } catch (error) {
    console.error('[Stamps] Failed to get stamps:', error)
    return []
  }
}

/**
 * Get a specific stamp by ID
 */
export async function getStamp(stampId: string): Promise<PostageStamp | null> {
  // Try local Bee first
  if (await isLocalBeeAvailable()) {
    try {
      const response = await fetch(`${LOCAL_BEE}/stamps/${stampId}`, {
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        return (await response.json()) as PostageStamp
      }
    } catch {
      // Fall through to configured Bee
    }
  }

  // Fall back to configured Bee node
  const bee = getBee()
  try {
    const s = await bee.getPostageBatch(stampId)
    // Convert bee-js PostageBatch to our PostageStamp type
    return {
      batchID: String(s.batchID),
      utilization: s.utilization,
      usable: s.usable,
      label: s.label,
      depth: s.depth,
      amount: s.amount,
      bucketDepth: s.bucketDepth,
      blockNumber: s.blockNumber,
      immutableFlag: s.immutableFlag,
    } as PostageStamp
  } catch (error) {
    console.error('[Stamps] Failed to get stamp:', error)
    return null
  }
}

/**
 * Check if a stamp is usable
 */
export async function isStampUsable(stampId: string): Promise<boolean> {
  const stamp = await getStamp(stampId)
  return stamp?.usable ?? false
}

/**
 * Get stamp capacity info
 */
export async function getStampCapacity(stampId: string): Promise<StampCapacity | null> {
  const stamp = await getStamp(stampId)
  if (!stamp) {
    return null
  }

  const depth = stamp.depth
  const bucketDepth = stamp.bucketDepth || 16
  const totalChunks = Math.pow(2, depth)
  const chunksPerBucket = Math.pow(2, bucketDepth)
  const buckets = totalChunks / chunksPerBucket

  return {
    depth,
    bucketDepth,
    totalChunks,
    buckets,
    usable: stamp.usable,
    exists: true,
  }
}

/**
 * Request a sponsored stamp for free tier uploads
 */
export async function requestSponsoredStamp(): Promise<SponsoredStampResponse> {
  try {
    const response = await fetch(SPONSOR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Sponsor API error: ${response.status}`)
    }

    return (await response.json()) as SponsoredStampResponse
  } catch (error) {
    console.error('[Stamps] Failed to get sponsored stamp:', error)
    throw new Error('Free tier currently unavailable. Please try again later.')
  }
}

/**
 * Calculate cost for storage duration
 */
export function calculateStorageCost(fileSize: number, days = 7): StorageCost {
  const bytesPerChunk = 4096
  const chunks = Math.ceil(fileSize / bytesPerChunk)

  // Price per chunk per block (in PLUR, smallest unit)
  const pricePerChunkPerBlock = 24000
  const blocksPerDay = 4 * 60 * 24 // ~4 blocks per minute

  const totalBlocks = days * blocksPerDay
  const cost = chunks * pricePerChunkPerBlock * totalBlocks

  // Convert to BZZ (1 BZZ = 10^16 PLUR)
  const costInBZZ = cost / Math.pow(10, 16)

  return {
    chunks,
    blocks: totalBlocks,
    costPlur: cost,
    costBZZ: costInBZZ,
    days,
  }
}

/**
 * Estimate stamp depth needed for file size
 */
export function estimateDepth(fileSize: number): number {
  const bytesPerChunk = 4096
  const chunks = Math.ceil(fileSize / bytesPerChunk)

  // Depth determines total addressable chunks (2^depth)
  // Add some buffer for metadata and future use
  const requiredDepth = Math.ceil(Math.log2(chunks * 1.5))

  // Minimum depth is 17 for practical use
  return Math.max(17, requiredDepth)
}
