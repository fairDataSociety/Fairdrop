/**
 * GSOC (Graffiti Single Owner Chunks) Inbox Operations
 *
 * Enables zero-leak private messaging where:
 * - All senders use the same derived GSOC key (network-level anonymity)
 * - Mode 1: Encrypted Send - sender revealed to recipient only (encrypted metadata)
 * - Mode 2: Honest Inbox - fully anonymous (no sender info)
 *
 * Architecture:
 * 1. Recipient mines GSOC key for their neighborhood and publishes params to ENS
 * 2. Senders derive the same key from params and write to indexed slots
 * 3. Recipient polls slots to discover new messages
 */

import { getBee, getDefaultStampId } from './client'
import { ethers } from 'ethers'
import { deriveSharedSecret, encryptData, decryptData, hexToBytes, bytesToHex } from './encryption'

// Version prefix for inbox identifiers
const INBOX_PREFIX = 'fairdrop-inbox-v2'

/**
 * Mine a GSOC private key for inbox (recipient does this once)
 * The mined key will produce an address within the target neighborhood
 *
 * @param {string} targetOverlay - Target Bee node overlay address
 * @param {number} proximity - Neighborhood depth (default 16)
 * @returns {Object} { privateKey, params: { targetOverlay, baseIdentifier, proximity } }
 */
export const mineInboxKey = async (targetOverlay, proximity = 16) => {
  console.log('[GSOC mineInboxKey] Starting with overlay:', targetOverlay?.slice(0, 16))
  console.log('[GSOC mineInboxKey] Proximity:', proximity)

  const bee = getBee()
  console.log('[GSOC mineInboxKey] Got Bee instance, URL:', bee.url)

  // Generate unique base identifier for this inbox
  const baseIdentifier = ethers.keccak256(
    ethers.toUtf8Bytes(INBOX_PREFIX + Date.now().toString() + Math.random())
  )

  // Mine GSOC key - bee-js gsocMine returns a PrivateKey instance
  console.log('[GSOC mineInboxKey] Calling bee.gsocMine with:')
  console.log('  - targetOverlay:', targetOverlay)
  console.log('  - baseIdentifier:', baseIdentifier)
  console.log('  - proximity:', proximity)

  let gsocKey
  try {
    gsocKey = bee.gsocMine(targetOverlay, baseIdentifier, proximity)
    console.log('[GSOC mineInboxKey] gsocMine succeeded')
  } catch (error) {
    console.error('[GSOC mineInboxKey] gsocMine FAILED:', error.message)
    console.error('[GSOC mineInboxKey] Error stack:', error.stack)
    throw error
  }

  return {
    privateKey: gsocKey,
    params: {
      targetOverlay,
      baseIdentifier,
      proximity
    }
  }
}

/**
 * Derive GSOC key from published params (sender does this)
 * All senders derive the same key - this provides network anonymity
 *
 * @param {Object} params - { targetOverlay, baseIdentifier, proximity }
 * @returns {PrivateKey} The derived GSOC private key
 */
export const deriveInboxKey = (params) => {
  const bee = getBee()
  return bee.gsocMine(params.targetOverlay, params.baseIdentifier, params.proximity || 16)
}

/**
 * Get the owner address from GSOC params
 * This is the address that owns all SOCs in this inbox
 *
 * @param {Object} params - { targetOverlay, baseIdentifier, proximity }
 * @returns {string} The owner Ethereum address
 */
export const getInboxOwner = (params) => {
  const gsocKey = deriveInboxKey(params)
  // Use bee-js built-in method: privateKey -> publicKey -> address
  const publicKey = gsocKey.publicKey()
  const ethAddress = publicKey.address()
  return '0x' + ethAddress.toHex()
}

/**
 * Get indexed identifier for a specific message slot
 * Each message uses a unique slot to avoid overwrites
 *
 * @param {string} baseIdentifier - Base identifier from inbox params
 * @param {number} index - Slot index (0, 1, 2, ...)
 * @returns {string} The indexed identifier (32-byte hex)
 */
export const getIndexedIdentifier = (baseIdentifier, index) => {
  return ethers.keccak256(
    ethers.concat([
      ethers.getBytes(baseIdentifier),
      ethers.toUtf8Bytes(index.toString())
    ])
  )
}

/**
 * Encrypt metadata for recipient (used in Mode 1: Encrypted Send)
 * Only the recipient can decrypt this with their private key
 *
 * @param {Object} metadata - Metadata to encrypt (e.g., { from, filename })
 * @param {Uint8Array} recipientPublicKey - Recipient's public key
 * @param {Uint8Array} senderPrivateKey - Sender's ephemeral private key for ECDH
 * @returns {Promise<Object>} Encrypted metadata with ephemeral public key
 */
export const encryptMetadata = async (metadata, recipientPublicKey, senderPrivateKey) => {
  const metaBytes = new TextEncoder().encode(JSON.stringify(metadata))

  // Use ECDH to derive shared secret, then AES-GCM to encrypt
  const sharedSecret = await deriveSharedSecret(senderPrivateKey, recipientPublicKey)
  const { ciphertext, iv } = await encryptData(metaBytes, sharedSecret)

  // Get sender's public key (ephemeral) for the recipient to derive the same secret
  const secp256k1 = await import('@noble/secp256k1')
  const ephemeralPublicKey = secp256k1.getPublicKey(senderPrivateKey)

  return {
    ephemeralPublicKey: bytesToHex(ephemeralPublicKey),
    ciphertext: bytesToHex(ciphertext),
    iv: bytesToHex(iv)
  }
}

/**
 * Decrypt metadata with recipient's private key
 *
 * @param {Object} encryptedMeta - { ephemeralPublicKey, ciphertext, iv }
 * @param {Uint8Array} privateKey - Recipient's private key
 * @returns {Promise<Object>} Decrypted metadata
 */
export const decryptMetadata = async (encryptedMeta, privateKey) => {
  const ephemeralPublicKey = hexToBytes(encryptedMeta.ephemeralPublicKey)
  const ciphertext = hexToBytes(encryptedMeta.ciphertext)
  const iv = hexToBytes(encryptedMeta.iv)

  const sharedSecret = await deriveSharedSecret(privateKey, ephemeralPublicKey)
  const decrypted = await decryptData(ciphertext, iv, sharedSecret)

  return JSON.parse(new TextDecoder().decode(decrypted))
}

/**
 * Write message to inbox slot
 *
 * @param {Object} params - Inbox params { targetOverlay, baseIdentifier, proximity, recipientPublicKey }
 * @param {number} index - Slot index to write to
 * @param {Object} payload - { reference } or { reference, senderInfo: { from, filename } }
 * @param {Object} options - { anonymous: true } for Honest Inbox mode
 * @returns {Promise<Object>} Upload result with reference
 */
export const writeToInbox = async (params, index, payload, options = {}) => {
  const bee = getBee()
  const stampId = getDefaultStampId()
  const gsocKey = deriveInboxKey(params)
  const identifier = getIndexedIdentifier(params.baseIdentifier, index)

  const message = {
    version: 1,
    reference: payload.reference,
    timestamp: Date.now()
  }

  // For Mode 1 (Encrypted Send), include encrypted sender metadata
  if (!options.anonymous && payload.senderInfo && params.recipientPublicKey) {
    const secp256k1 = await import('@noble/secp256k1')
    const ephemeralPrivateKey = secp256k1.utils.randomSecretKey()

    message.encryptedMeta = await encryptMetadata(
      payload.senderInfo,
      typeof params.recipientPublicKey === 'string'
        ? hexToBytes(params.recipientPublicKey.replace('0x', ''))
        : params.recipientPublicKey,
      ephemeralPrivateKey
    )
  }

  const messageBytes = new TextEncoder().encode(JSON.stringify(message))

  return bee.gsocSend(stampId, gsocKey, identifier, messageBytes)
}

/**
 * Read message from inbox slot
 *
 * @param {Object} params - Inbox params
 * @param {number} index - Slot index to read
 * @returns {Promise<Object|null>} Message or null if slot is empty
 */
export const readInboxSlot = async (params, index) => {
  const bee = getBee()
  const owner = getInboxOwner(params)
  const identifier = getIndexedIdentifier(params.baseIdentifier, index)

  try {
    const reader = bee.makeSOCReader(owner)
    const result = await reader.download(identifier)

    // Handle different payload formats from bee-js
    let payloadBytes
    if (result.payload instanceof Uint8Array) {
      payloadBytes = result.payload
    } else if (result.payload?.buffer) {
      // If it's a typed array view
      payloadBytes = new Uint8Array(result.payload.buffer, result.payload.byteOffset, result.payload.byteLength)
    } else if (typeof result.payload === 'string') {
      // If returned as string
      return JSON.parse(result.payload)
    } else if (result.data) {
      // Alternative field name
      payloadBytes = result.data instanceof Uint8Array ? result.data : new Uint8Array(result.data)
    } else {
      // Try to use result directly if it's the payload
      payloadBytes = new Uint8Array(result)
    }

    // Try to parse as JSON, handling variable binary prefixes from real Bee nodes
    const decoded = new TextDecoder().decode(payloadBytes)
    try {
      return JSON.parse(decoded)
    } catch {
      // Real Bee SOC data may include binary prefixes (span, signature, etc.)
      // Look for our specific message format marker
      const jsonStart = decoded.indexOf('{"version":')
      if (jsonStart >= 0) {
        // Find balanced JSON object - count braces
        let braceCount = 0
        let jsonEnd = -1
        for (let i = jsonStart; i < decoded.length; i++) {
          if (decoded[i] === '{') braceCount++
          if (decoded[i] === '}') braceCount--
          if (braceCount === 0) {
            jsonEnd = i + 1
            break
          }
        }
        if (jsonEnd > jsonStart) {
          const jsonPart = decoded.slice(jsonStart, jsonEnd)
          return JSON.parse(jsonPart)
        }
      }
      throw new Error('Invalid SOC payload format - no valid JSON found')
    }
  } catch (error) {
    // Handle not found errors gracefully
    if (error.message?.includes('not found') || error.status === 404 || error.message?.includes('404')) {
      return null
    }
    throw error
  }
}

/**
 * Poll inbox for all messages starting from an index
 * Uses parallel requests for speed, stops after consecutive empty slots
 *
 * @param {Object} params - Inbox params
 * @param {number} lastKnownIndex - Start scanning from this index (default 0)
 * @param {number} maxScan - Maximum slots to scan (default 20)
 * @returns {Promise<Array>} Array of messages with their indices
 */
export const pollInbox = async (params, lastKnownIndex = 0, maxScan = 20) => {
  const BATCH_SIZE = 5 // Request 5 slots in parallel
  const MAX_EMPTY_BATCHES = 2 // Stop after 2 batches with no messages

  const messages = []
  let emptyBatches = 0
  let currentIndex = lastKnownIndex

  while (currentIndex < lastKnownIndex + maxScan && emptyBatches < MAX_EMPTY_BATCHES) {
    // Create batch of parallel requests
    const batchPromises = []
    for (let i = 0; i < BATCH_SIZE && currentIndex + i < lastKnownIndex + maxScan; i++) {
      const idx = currentIndex + i
      batchPromises.push(
        readInboxSlot(params, idx)
          .then(msg => msg ? { ...msg, index: idx } : null)
          .catch(() => null)
      )
    }

    // Wait for batch to complete
    const results = await Promise.all(batchPromises)
    const batchMessages = results.filter(m => m !== null)

    if (batchMessages.length === 0) {
      emptyBatches++
    } else {
      emptyBatches = 0
      messages.push(...batchMessages)
    }

    currentIndex += BATCH_SIZE
  }

  // Sort by index to ensure order
  return messages.sort((a, b) => a.index - b.index)
}

/**
 * Subscribe to inbox for real-time message notifications via WebSocket.
 * Uses bee.gsocSubscribe() for instant delivery instead of polling.
 *
 * This is a hybrid approach:
 * - Use pollInbox() on app start to get all existing messages
 * - Use subscribeToInbox() for real-time notifications of NEW messages
 *
 * The subscription automatically chains to the next slot when a message arrives.
 *
 * @param {Object} params - Inbox params { targetOverlay, baseIdentifier, proximity }
 * @param {number} startIndex - Start subscribing from this slot index
 * @param {Object} callbacks - { onMessage, onError, onClose }
 * @param {Function} callbacks.onMessage - Called with (message, index) when a message arrives
 * @param {Function} callbacks.onError - Called with (error) on subscription errors
 * @param {Function} callbacks.onClose - Called when subscription is closed
 * @returns {Object} { cancel: () => void, getCurrentIndex: () => number }
 *
 * @example
 * // First, poll to get existing messages and find the next index
 * const existingMessages = await pollInbox(params, 0)
 * const nextIndex = existingMessages.length > 0
 *   ? existingMessages[existingMessages.length - 1].index + 1
 *   : 0
 *
 * // Then subscribe for real-time updates
 * const subscription = subscribeToInbox(params, nextIndex, {
 *   onMessage: (message, index) => {
 *     console.log('New message at slot', index, message)
 *   },
 *   onError: (error) => {
 *     console.error('Subscription error:', error)
 *   },
 *   onClose: () => {
 *     console.log('Subscription closed')
 *   }
 * })
 *
 * // Later, to stop:
 * subscription.cancel()
 */
export const subscribeToInbox = (params, startIndex, callbacks) => {
  const bee = getBee()
  const owner = getInboxOwner(params)

  let currentIndex = startIndex
  let currentSubscription = null
  let cancelled = false
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY_MS = 2000

  /**
   * Parse message bytes into structured message object
   * Handles various payload formats from bee-js
   */
  const parseMessage = (messageBytes) => {
    // Convert to Uint8Array if needed
    let bytes
    if (messageBytes instanceof Uint8Array) {
      bytes = messageBytes
    } else if (messageBytes?.toUint8Array) {
      bytes = messageBytes.toUint8Array()
    } else if (typeof messageBytes === 'string') {
      return JSON.parse(messageBytes)
    } else {
      bytes = new Uint8Array(messageBytes)
    }

    const decoded = new TextDecoder().decode(bytes)

    try {
      return JSON.parse(decoded)
    } catch {
      // Handle binary prefixes from real Bee nodes
      const jsonStart = decoded.indexOf('{"version":')
      if (jsonStart >= 0) {
        let braceCount = 0
        let jsonEnd = -1
        for (let i = jsonStart; i < decoded.length; i++) {
          if (decoded[i] === '{') braceCount++
          if (decoded[i] === '}') braceCount--
          if (braceCount === 0) {
            jsonEnd = i + 1
            break
          }
        }
        if (jsonEnd > jsonStart) {
          return JSON.parse(decoded.slice(jsonStart, jsonEnd))
        }
      }
      throw new Error('Invalid message format')
    }
  }

  /**
   * Subscribe to a specific slot index
   */
  const subscribeToSlot = (index) => {
    if (cancelled) return

    const identifier = getIndexedIdentifier(params.baseIdentifier, index)
    console.log('[GSOC subscribe] Subscribing to slot', index)

    try {
      currentSubscription = bee.gsocSubscribe(owner, identifier, {
        onMessage: (messageBytes) => {
          try {
            const message = parseMessage(messageBytes)
            console.log('[GSOC subscribe] Message received at slot', index)
            reconnectAttempts = 0 // Reset on successful message

            // Notify callback
            callbacks.onMessage?.({ ...message, index })

            // Subscribe to next slot for continuous monitoring
            currentIndex = index + 1
            subscribeToSlot(currentIndex)
          } catch (error) {
            console.error('[GSOC subscribe] Failed to parse message:', error)
            callbacks.onError?.(error)
          }
        },
        onError: (error) => {
          console.error('[GSOC subscribe] Subscription error at slot', index, ':', error.message)

          // Attempt reconnection with exponential backoff
          if (!cancelled && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++
            const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1)
            console.log(`[GSOC subscribe] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
            setTimeout(() => subscribeToSlot(index), delay)
          } else {
            callbacks.onError?.(error)
          }
        },
        onClose: () => {
          console.log('[GSOC subscribe] Subscription closed for slot', index)
          if (!cancelled) {
            // Unexpected close - attempt reconnection
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttempts++
              const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1)
              console.log(`[GSOC subscribe] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
              setTimeout(() => subscribeToSlot(index), delay)
            } else {
              callbacks.onClose?.()
            }
          } else {
            callbacks.onClose?.()
          }
        }
      })
    } catch (error) {
      console.error('[GSOC subscribe] Failed to create subscription:', error)
      callbacks.onError?.(error)
    }
  }

  // Start subscription
  subscribeToSlot(currentIndex)

  return {
    /**
     * Cancel the subscription
     */
    cancel: () => {
      console.log('[GSOC subscribe] Cancelling subscription')
      cancelled = true
      currentSubscription?.cancel?.()
    },
    /**
     * Get the current slot index being watched
     */
    getCurrentIndex: () => currentIndex,
    /**
     * Check if subscription is active
     */
    isActive: () => !cancelled
  }
}

/**
 * Find the next available slot for writing
 * Uses binary search for efficiency
 *
 * @param {Object} params - Inbox params
 * @param {number} maxSlots - Maximum slot number to consider (default 10000)
 * @returns {Promise<number>} Next available slot index
 */
export const findNextSlot = async (params, maxSlots = 10000) => {
  // First, do exponential search to find upper bound
  let low = 0
  let high = 1

  while (high < maxSlots) {
    const msg = await readInboxSlot(params, high)
    if (!msg) break
    low = high
    high *= 2
  }

  high = Math.min(high, maxSlots)

  // Binary search to find exact next slot
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const msg = await readInboxSlot(params, mid)
    if (msg) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * Check if an inbox has any messages
 *
 * @param {Object} params - Inbox params
 * @returns {Promise<boolean>} True if inbox has at least one message
 */
export const hasMessages = async (params) => {
  const msg = await readInboxSlot(params, 0)
  return msg !== null
}

export default {
  mineInboxKey,
  deriveInboxKey,
  getInboxOwner,
  getIndexedIdentifier,
  encryptMetadata,
  decryptMetadata,
  writeToInbox,
  readInboxSlot,
  pollInbox,
  subscribeToInbox,
  findNextSlot,
  hasMessages,
  INBOX_PREFIX
}
