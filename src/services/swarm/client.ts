/**
 * Bee Client Wrapper
 * Provides a singleton Bee client instance configured for the current environment
 */

import { Bee } from '@ethersphere/bee-js'
import type { BatchId } from '@ethersphere/bee-js'

// Configuration interface
interface BeeConfig {
  beeUrl: string
  defaultStampId: BatchId | null
}

// Configuration from environment variables or defaults
const config: BeeConfig = {
  beeUrl: import.meta.env.VITE_BEE_URL || 'https://bee-1.fairdatasociety.org',
  defaultStampId: (import.meta.env.VITE_DEFAULT_STAMP_ID as BatchId) || null,
}

// Singleton Bee instance
let beeInstance: Bee | null = null

/**
 * Get or create the Bee client instance
 */
export function getBee(): Bee {
  if (!beeInstance) {
    beeInstance = new Bee(config.beeUrl)
  }
  return beeInstance
}

/**
 * Check if Bee node is accessible
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const bee = getBee()
    await bee.checkConnection()
    return true
  } catch (error) {
    console.error('[Swarm] Connection check failed:', error)
    return false
  }
}

/**
 * Get the configured Bee URL
 */
export function getBeeUrl(): string {
  return config.beeUrl
}

/**
 * Get the default postage stamp ID
 */
export function getDefaultStampId(): BatchId | null {
  return config.defaultStampId
}

/**
 * Set a custom stamp ID (for runtime configuration)
 */
export function setDefaultStampId(stampId: BatchId): void {
  config.defaultStampId = stampId
}

/**
 * Reset the Bee instance (useful for testing or reconfiguration)
 */
export function resetBeeInstance(): void {
  beeInstance = null
}
