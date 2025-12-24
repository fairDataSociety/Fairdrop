/**
 * Postage Stamp Management
 * Handles postage stamp operations for Swarm storage
 */

import { Bee } from '@ethersphere/bee-js'
import { getBee } from './client'

// Local Bee node URL
const LOCAL_BEE = 'http://localhost:1633'

// Sponsored stamp API endpoint for free tier
const SPONSOR_API = import.meta.env.VITE_SPONSOR_API || '/api/free-stamp'

/**
 * Check if local Bee node is available
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
 * Get all available postage stamps from local Bee
 * @returns {Promise<Array>} Array of stamp batches
 */
export const getLocalStamps = async () => {
  try {
    const response = await fetch(`${LOCAL_BEE}/stamps`, {
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.stamps || []
  } catch {
    return []
  }
}

/**
 * Get all available postage stamps
 * Tries local Bee first, then falls back to configured Bee node
 * @returns {Promise<Array>} Array of stamp batches
 */
export const getAllStamps = async () => {
  // Try local Bee first
  if (await isLocalBeeAvailable()) {
    const localStamps = await getLocalStamps()
    if (localStamps.length > 0) {
      return localStamps.filter(s => s.usable)
    }
  }

  // Fall back to configured Bee node
  const bee = getBee()
  try {
    const stamps = await bee.getAllPostageBatch()
    return stamps.filter(s => s.usable)
  } catch (error) {
    console.error('Failed to get stamps:', error)
    return []
  }
}

/**
 * Get a specific stamp by ID
 * Tries local Bee first, then configured Bee node
 * @param {string} stampId - Batch ID
 * @returns {Promise<Object|null>} Stamp info or null
 */
export const getStamp = async (stampId) => {
  // Try local Bee first
  if (await isLocalBeeAvailable()) {
    try {
      const response = await fetch(`${LOCAL_BEE}/stamps/${stampId}`, {
        signal: AbortSignal.timeout(3000)
      })
      if (response.ok) {
        return await response.json()
      }
    } catch {
      // Fall through to configured Bee
    }
  }

  // Fall back to configured Bee node
  const bee = getBee()
  try {
    return await bee.getPostageBatch(stampId)
  } catch (error) {
    console.error('Failed to get stamp:', error)
    return null
  }
}

/**
 * Check if a stamp is usable
 * @param {string} stampId - Batch ID
 * @returns {Promise<boolean>} True if stamp is usable
 */
export const isStampUsable = async (stampId) => {
  const stamp = await getStamp(stampId)
  return stamp?.usable ?? false
}

/**
 * Get stamp capacity info
 * @param {string} stampId - Batch ID
 * @returns {Promise<Object>} Capacity information
 */
export const getStampCapacity = async (stampId) => {
  const stamp = await getStamp(stampId)
  if (!stamp) {
    return { available: 0, used: 0, total: 0 }
  }

  // Calculate capacity based on depth and amount
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
    // Note: actual usage tracking requires additional API calls
    usable: stamp.usable,
    exists: stamp.exists
  }
}

/**
 * Request a sponsored stamp for free tier uploads
 * @returns {Promise<Object>} Sponsored stamp info with batchId
 */
export const requestSponsoredStamp = async () => {
  try {
    const response = await fetch(SPONSOR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now()
      })
    })

    if (!response.ok) {
      throw new Error(`Sponsor API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      batchId: data.batchId,
      expiresAt: data.expiresAt,
      remainingCapacity: data.remainingCapacity
    }
  } catch (error) {
    console.error('Failed to get sponsored stamp:', error)
    throw new Error('Free tier currently unavailable. Please try again later.')
  }
}

/**
 * Calculate cost for storage duration
 * @param {number} fileSize - File size in bytes
 * @param {number} days - Storage duration in days
 * @returns {Object} Cost breakdown
 */
export const calculateStorageCost = (fileSize, days = 7) => {
  // Approximate calculation based on Swarm economics
  // These are rough estimates - actual costs depend on network conditions
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
    days
  }
}

/**
 * Purchase a new postage stamp
 * Note: This requires a connected wallet with xBZZ on Gnosis Chain
 * The actual purchase happens via smart contract interaction
 * @param {Object} options - Purchase options
 * @returns {Promise<string>} New batch ID
 */
export const purchaseStamp = async (options = {}) => {
  const {
    depth = 20,
    amount = '100000000000000000', // 0.1 xBZZ in wei
    walletClient = null
  } = options

  if (!walletClient) {
    throw new Error('Wallet connection required to purchase stamps')
  }

  // This would interact with the PostageStamp contract on Gnosis Chain
  // Contract address: 0x45a1502382541Cd610CC9068e88727426b696293
  // For now, throw an error until wallet integration is complete
  throw new Error('Stamp purchase requires wallet integration. Use sponsored stamps for now.')
}

/**
 * Estimate stamp depth needed for file size
 * @param {number} fileSize - File size in bytes
 * @returns {number} Recommended depth
 */
export const estimateDepth = (fileSize) => {
  const bytesPerChunk = 4096
  const chunks = Math.ceil(fileSize / bytesPerChunk)

  // Depth determines total addressable chunks (2^depth)
  // Add some buffer for metadata and future use
  const requiredDepth = Math.ceil(Math.log2(chunks * 1.5))

  // Minimum depth is 17 for practical use
  return Math.max(17, requiredDepth)
}

export default {
  getAllStamps,
  getStamp,
  isStampUsable,
  getStampCapacity,
  requestSponsoredStamp,
  calculateStorageCost,
  purchaseStamp,
  estimateDepth
}
