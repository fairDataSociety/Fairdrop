/**
 * Bee Client Wrapper
 * Provides a singleton Bee client instance configured for the current environment
 */

import { Bee } from '@ethersphere/bee-js'

// Configuration from environment variables or defaults
const config = {
  beeUrl: import.meta.env.VITE_BEE_URL || 'https://bee-1.fairdatasociety.org',
  defaultStampId: import.meta.env.VITE_DEFAULT_STAMP_ID || null
}

// Singleton Bee instance
let beeInstance = null

/**
 * Get or create the Bee client instance
 * @returns {Bee} The Bee client instance
 */
export const getBee = () => {
  if (!beeInstance) {
    beeInstance = new Bee(config.beeUrl)
  }
  return beeInstance
}

/**
 * Check if Bee node is accessible
 * @returns {Promise<boolean>} True if connected
 */
export const checkConnection = async () => {
  try {
    const bee = getBee()
    await bee.checkConnection()
    return true
  } catch (error) {
    console.error('Bee connection failed:', error)
    return false
  }
}

/**
 * Get the configured Bee URL
 * @returns {string} The Bee node URL
 */
export const getBeeUrl = () => config.beeUrl

/**
 * Get the default postage stamp ID
 * @returns {string|null} The default stamp ID or null
 */
export const getDefaultStampId = () => config.defaultStampId

export default {
  getBee,
  checkConnection,
  getBeeUrl,
  getDefaultStampId
}
