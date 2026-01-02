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
import { keccak256, toUtf8Bytes, concat, getBytes } from 'ethers'
import { deriveSharedSecret, encryptData, decryptData, hexToBytes, bytesToHex } from './encryption'
import * as secp256k1 from '@noble/secp256k1'
import type { InboxParams } from '@/shared/types'

// Version prefix for inbox identifiers
export const INBOX_PREFIX = 'fairdrop-inbox-v2'

// Message format stored in GSOC slots
export interface GSOCMessage {
  version: number
  reference: string
  timestamp: number
  encryptedMeta?: EncryptedMetadata
  index?: number
}

// Encrypted sender metadata (Mode 1: Encrypted Send)
export interface EncryptedMetadata {
  ephemeralPublicKey: string
  ciphertext: string
  iv: string
}

// Sender info for Mode 1
export interface SenderInfo {
  from: string
  filename?: string
}

// Write payload for inbox
export interface WritePayload {
  reference: string
  senderInfo?: SenderInfo
}

// Write options
export interface WriteOptions {
  anonymous?: boolean
}

// Subscription callbacks
export interface SubscriptionCallbacks {
  onMessage?: (message: GSOCMessage) => void
  onError?: (error: Error) => void
  onClose?: () => void
}

// Subscription return type
export interface InboxSubscription {
  cancel: () => void
  getCurrentIndex: () => number
  isActive: () => boolean
}

// Mined inbox result
export interface MinedInbox {
  privateKey: unknown // bee-js PrivateKey type
  params: InboxParams
}

/**
 * Mine a GSOC private key for inbox (recipient does this once)
 * The mined key will produce an address within the target neighborhood
 */
export async function mineInboxKey(
  targetOverlay: string,
  proximity = 16
): Promise<MinedInbox> {
  console.log('[GSOC mineInboxKey] Starting with overlay:', targetOverlay?.slice(0, 16))
  console.log('[GSOC mineInboxKey] Proximity:', proximity)

  const bee = getBee()
  console.log('[GSOC mineInboxKey] Got Bee instance, URL:', bee.url)

  // Generate unique base identifier for this inbox
  const baseIdentifier = keccak256(
    toUtf8Bytes(INBOX_PREFIX + Date.now().toString() + Math.random())
  )

  // Mine GSOC key - bee-js gsocMine returns a PrivateKey instance
  console.log('[GSOC mineInboxKey] Calling bee.gsocMine with:')
  console.log('  - targetOverlay:', targetOverlay)
  console.log('  - baseIdentifier:', baseIdentifier)
  console.log('  - proximity:', proximity)

  let gsocKey: unknown
  try {
    gsocKey = bee.gsocMine(targetOverlay, baseIdentifier, proximity)
    console.log('[GSOC mineInboxKey] gsocMine succeeded')
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[GSOC mineInboxKey] gsocMine FAILED:', err.message)
    throw error
  }

  return {
    privateKey: gsocKey,
    params: {
      targetOverlay,
      baseIdentifier,
      proximity,
    },
  }
}

/**
 * Derive GSOC key from published params (sender does this)
 * All senders derive the same key - this provides network anonymity
 */
export function deriveInboxKey(params: InboxParams): unknown {
  const bee = getBee()
  return bee.gsocMine(params.targetOverlay, params.baseIdentifier, params.proximity || 16)
}

/**
 * Get the owner address from GSOC params
 * This is the address that owns all SOCs in this inbox
 */
export function getInboxOwner(params: InboxParams): string {
  const gsocKey = deriveInboxKey(params) as {
    publicKey: () => { address: () => { toHex: () => string } }
  }
  // Use bee-js built-in method: privateKey -> publicKey -> address
  const publicKey = gsocKey.publicKey()
  const ethAddress = publicKey.address()
  return '0x' + ethAddress.toHex()
}

/**
 * Get indexed identifier for a specific message slot
 * Each message uses a unique slot to avoid overwrites
 */
export function getIndexedIdentifier(baseIdentifier: string, index: number): string {
  return keccak256(concat([getBytes(baseIdentifier), toUtf8Bytes(index.toString())]))
}

/**
 * Encrypt metadata for recipient (used in Mode 1: Encrypted Send)
 * Only the recipient can decrypt this with their private key
 */
export async function encryptMetadata(
  metadata: SenderInfo,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array
): Promise<EncryptedMetadata> {
  const metaBytes = new TextEncoder().encode(JSON.stringify(metadata))

  // Use ECDH to derive shared secret, then AES-GCM to encrypt
  const sharedSecret = await deriveSharedSecret(senderPrivateKey, recipientPublicKey)
  const { ciphertext, iv } = await encryptData(metaBytes, sharedSecret)

  // Get sender's public key (ephemeral) for the recipient to derive the same secret
  const ephemeralPublicKey = secp256k1.getPublicKey(senderPrivateKey)

  return {
    ephemeralPublicKey: bytesToHex(ephemeralPublicKey),
    ciphertext: bytesToHex(ciphertext),
    iv: bytesToHex(iv),
  }
}

/**
 * Decrypt metadata with recipient's private key
 */
export async function decryptMetadata(
  encryptedMeta: EncryptedMetadata,
  privateKey: Uint8Array
): Promise<SenderInfo> {
  const ephemeralPublicKey = hexToBytes(encryptedMeta.ephemeralPublicKey)
  const ciphertext = hexToBytes(encryptedMeta.ciphertext)
  const iv = hexToBytes(encryptedMeta.iv)

  const sharedSecret = await deriveSharedSecret(privateKey, ephemeralPublicKey)
  const decrypted = await decryptData(ciphertext, iv, sharedSecret)

  return JSON.parse(new TextDecoder().decode(decrypted)) as SenderInfo
}

/**
 * Write message to inbox slot
 */
export async function writeToInbox(
  params: InboxParams,
  index: number,
  payload: WritePayload,
  options: WriteOptions = {}
): Promise<unknown> {
  const bee = getBee()
  const stampId = getDefaultStampId()

  if (!stampId) {
    throw new Error('No postage stamp configured')
  }

  const gsocKey = deriveInboxKey(params)
  const identifier = getIndexedIdentifier(params.baseIdentifier, index)

  const message: GSOCMessage = {
    version: 1,
    reference: payload.reference,
    timestamp: Date.now(),
  }

  // For Mode 1 (Encrypted Send), include encrypted sender metadata
  if (!options.anonymous && payload.senderInfo && params.recipientPublicKey) {
    const ephemeralPrivateKey = secp256k1.utils.randomSecretKey()

    let recipientPubKey: Uint8Array
    if (typeof params.recipientPublicKey === 'string') {
      recipientPubKey = hexToBytes(params.recipientPublicKey.replace('0x', ''))
    } else {
      recipientPubKey = params.recipientPublicKey
    }

    message.encryptedMeta = await encryptMetadata(
      payload.senderInfo,
      recipientPubKey,
      ephemeralPrivateKey
    )
  }

  const messageBytes = new TextEncoder().encode(JSON.stringify(message))

  // Cast gsocKey - bee-js accepts PrivateKey | Uint8Array | string
  return bee.gsocSend(stampId, gsocKey as Uint8Array, identifier, messageBytes)
}

/**
 * Parse message bytes from SOC payload
 * Handles various payload formats from bee-js
 */
function parseMessageBytes(result: unknown): GSOCMessage {
  const res = result as Record<string, unknown>

  let payloadBytes: Uint8Array

  // Check if payload exists and handle different formats
  const payload = res.payload
  const data = res.data

  if (payload instanceof Uint8Array) {
    payloadBytes = payload
  } else if (payload && typeof payload === 'object' && 'buffer' in payload) {
    // If it's a typed array view
    const view = payload as { buffer: ArrayBuffer; byteOffset: number; byteLength: number }
    payloadBytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  } else if (typeof payload === 'string') {
    // If returned as string
    return JSON.parse(payload) as GSOCMessage
  } else if (data instanceof Uint8Array) {
    // Alternative field name
    payloadBytes = data
  } else if (data && typeof data === 'object') {
    payloadBytes = new Uint8Array(data as ArrayLike<number>)
  } else {
    // Try to use result directly if it's the payload
    payloadBytes = new Uint8Array(result as ArrayLike<number>)
  }

  // Try to parse as JSON, handling variable binary prefixes from real Bee nodes
  const decoded = new TextDecoder().decode(payloadBytes)
  try {
    return JSON.parse(decoded) as GSOCMessage
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
        return JSON.parse(jsonPart) as GSOCMessage
      }
    }
    throw new Error('Invalid SOC payload format - no valid JSON found')
  }
}

/**
 * Read message from inbox slot
 */
export async function readInboxSlot(
  params: InboxParams,
  index: number
): Promise<GSOCMessage | null> {
  const bee = getBee()
  const owner = getInboxOwner(params)
  const identifier = getIndexedIdentifier(params.baseIdentifier, index)

  try {
    const reader = bee.makeSOCReader(owner)
    const result = await reader.download(identifier)
    return parseMessageBytes(result)
  } catch (error) {
    // Handle not found errors gracefully
    const err = error as { message?: string; status?: number }
    if (
      err.message?.includes('not found') ||
      err.status === 404 ||
      err.message?.includes('404')
    ) {
      return null
    }
    throw error
  }
}

/**
 * Poll inbox for all messages starting from an index
 * Uses parallel requests for speed, stops after consecutive empty slots
 */
export async function pollInbox(
  params: InboxParams,
  lastKnownIndex = 0,
  maxScan = 20
): Promise<GSOCMessage[]> {
  const BATCH_SIZE = 5 // Request 5 slots in parallel
  const MAX_EMPTY_BATCHES = 2 // Stop after 2 batches with no messages

  const messages: GSOCMessage[] = []
  let emptyBatches = 0
  let currentIndex = lastKnownIndex

  while (currentIndex < lastKnownIndex + maxScan && emptyBatches < MAX_EMPTY_BATCHES) {
    // Create batch of parallel requests
    const batchPromises: Promise<GSOCMessage | null>[] = []
    for (let i = 0; i < BATCH_SIZE && currentIndex + i < lastKnownIndex + maxScan; i++) {
      const idx = currentIndex + i
      batchPromises.push(
        readInboxSlot(params, idx)
          .then((msg) => (msg ? { ...msg, index: idx } : null))
          .catch(() => null)
      )
    }

    // Wait for batch to complete
    const results = await Promise.all(batchPromises)
    const batchMessages = results.filter((m): m is GSOCMessage => m !== null)

    if (batchMessages.length === 0) {
      emptyBatches++
    } else {
      emptyBatches = 0
      messages.push(...batchMessages)
    }

    currentIndex += BATCH_SIZE
  }

  // Sort by index to ensure order
  return messages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
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
 */
export function subscribeToInbox(
  params: InboxParams,
  startIndex: number,
  callbacks: SubscriptionCallbacks
): InboxSubscription {
  const bee = getBee()
  const owner = getInboxOwner(params)

  let currentIndex = startIndex
  let currentSubscription: { cancel?: () => void } | null = null
  let cancelled = false
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY_MS = 2000

  /**
   * Parse message bytes into structured message object
   */
  const parseMessage = (messageBytes: unknown): GSOCMessage => {
    let bytes: Uint8Array
    const mb = messageBytes as { toUint8Array?: () => Uint8Array }

    if (messageBytes instanceof Uint8Array) {
      bytes = messageBytes
    } else if (mb.toUint8Array) {
      bytes = mb.toUint8Array()
    } else if (typeof messageBytes === 'string') {
      return JSON.parse(messageBytes) as GSOCMessage
    } else {
      bytes = new Uint8Array(messageBytes as ArrayLike<number>)
    }

    const decoded = new TextDecoder().decode(bytes)

    try {
      return JSON.parse(decoded) as GSOCMessage
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
          return JSON.parse(decoded.slice(jsonStart, jsonEnd)) as GSOCMessage
        }
      }
      throw new Error('Invalid message format')
    }
  }

  /**
   * Subscribe to a specific slot index
   */
  const subscribeToSlot = (index: number): void => {
    if (cancelled) return

    const identifier = getIndexedIdentifier(params.baseIdentifier, index)
    console.log('[GSOC subscribe] Subscribing to slot', index)

    try {
      currentSubscription = bee.gsocSubscribe(owner, identifier, {
        onMessage: (messageBytes: unknown) => {
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
            callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
          }
        },
        onError: (error: Error) => {
          console.error('[GSOC subscribe] Subscription error at slot', index, ':', error.message)

          // Attempt reconnection with exponential backoff
          if (!cancelled && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++
            const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1)
            console.log(
              `[GSOC subscribe] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
            )
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
              console.log(
                `[GSOC subscribe] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
              )
              setTimeout(() => subscribeToSlot(index), delay)
            } else {
              callbacks.onClose?.()
            }
          } else {
            callbacks.onClose?.()
          }
        },
      }) as { cancel?: () => void }
    } catch (error) {
      console.error('[GSOC subscribe] Failed to create subscription:', error)
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Start subscription
  subscribeToSlot(currentIndex)

  return {
    cancel: () => {
      console.log('[GSOC subscribe] Cancelling subscription')
      cancelled = true
      currentSubscription?.cancel?.()
    },
    getCurrentIndex: () => currentIndex,
    isActive: () => !cancelled,
  }
}

/**
 * Find the next available slot for writing
 * Uses binary search for efficiency
 */
export async function findNextSlot(params: InboxParams, maxSlots = 10000): Promise<number> {
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
 */
export async function hasMessages(params: InboxParams): Promise<boolean> {
  const msg = await readInboxSlot(params, 0)
  return msg !== null
}
