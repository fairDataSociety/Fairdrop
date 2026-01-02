/**
 * Honest Inbox Service (Mode 2: Fully Anonymous Sending)
 *
 * Unlike standard encrypted send (Mode 1) where sender identity is revealed to recipient,
 * Honest Inbox allows completely anonymous file delivery:
 * - Sender identity NOT revealed to recipient
 * - No filename in encrypted payload
 * - GSOC notification uses anonymous flag
 * - Sent messages NOT stored locally (preserves sender anonymity)
 * - Shareable inbox links: /honest/inbox?key=<publicKey>
 *
 * Use cases: whistleblowing, anonymous tips, secure dropboxes
 */

import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  hexToBytes,
  bytesToHex,
} from './encryption'
import type { EncryptedFile, DecryptedFile } from './encryption'
import { uploadData } from './upload'
import { downloadData } from './download'
import { mineInboxKey, writeToInbox, pollInbox, subscribeToInbox, findNextSlot } from './gsoc'
import type { GSOCMessage, SubscriptionCallbacks, InboxSubscription } from './gsoc'
import {
  saveHonestInbox,
  getHonestInbox,
  getHonestInboxes,
  deleteHonestInbox as deleteFromStorage,
} from '../storage'
import type { HonestInbox, ProgressCallback, StatusCallback } from '@/shared/types'

// Honest inbox ID generation
const HONEST_INBOX_PREFIX = 'hi-'

/**
 * Generate a unique ID for a new honest inbox
 */
function generateInboxId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${HONEST_INBOX_PREFIX}${timestamp}-${random}`
}

/**
 * Options for creating a new honest inbox
 */
export interface CreateHonestInboxOptions {
  /** Optional target overlay for GSOC mining (uses default if not provided) */
  targetOverlay?: string
  /** Neighborhood proximity (default: 16) */
  proximity?: number
}

/**
 * Options for sending an anonymous file
 */
export interface AnonymousSendOptions {
  /** Progress callback during upload */
  onProgress?: ProgressCallback
  /** Status callback during upload */
  onStatusChange?: StatusCallback
}

/**
 * Result from anonymous send operation
 */
export interface AnonymousSendResult {
  /** Swarm reference to the uploaded encrypted file */
  reference: string
  /** URL to download the file (requires private key to decrypt) */
  downloadUrl: string
}

/**
 * Message received in a honest inbox (no sender info)
 */
export interface AnonymousMessage {
  /** Swarm reference to the encrypted file */
  reference: string
  /** Timestamp when the message was sent */
  timestamp: number
  /** Slot index in the GSOC inbox */
  index: number
}

/**
 * Create a new honest inbox
 * Generates a keypair and optionally mines GSOC parameters
 *
 * @param name - Human-readable name for the inbox
 * @param options - Optional configuration for GSOC mining
 * @returns The created honest inbox with all parameters
 */
export async function createHonestInbox(
  name: string,
  options: CreateHonestInboxOptions = {}
): Promise<HonestInbox> {
  // Generate keypair for encryption
  const keyPair = generateKeyPair()

  const inbox: HonestInbox = {
    id: generateInboxId(),
    name,
    publicKey: bytesToHex(keyPair.publicKey),
    privateKey: bytesToHex(keyPair.privateKey),
    created: Date.now(),
  }

  // If target overlay is provided, mine GSOC parameters
  if (options.targetOverlay) {
    const { params } = await mineInboxKey(options.targetOverlay, options.proximity ?? 16)
    inbox.gsocParams = {
      ...params,
      recipientPublicKey: inbox.publicKey,
    }
  }

  // Save to local storage
  saveHonestInbox(inbox)

  return inbox
}

/**
 * Get all honest inboxes from storage
 */
export function getAllHonestInboxes(): HonestInbox[] {
  const stored = getHonestInboxes()
  return Object.values(stored)
}

/**
 * Get a specific honest inbox by ID
 */
export function getHonestInboxById(id: string): HonestInbox | null {
  return getHonestInbox(id)
}

/**
 * Delete a honest inbox
 */
export function deleteHonestInbox(id: string): void {
  deleteFromStorage(id)
}

/**
 * Generate a shareable link for a honest inbox
 *
 * @param publicKey - The public key of the inbox
 * @param name - Optional name to include in the link
 * @returns URL that can be shared with potential senders
 */
export function getHonestInboxLink(publicKey: string, name?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({ key: publicKey })
  if (name) {
    params.set('name', name)
  }
  return `${baseUrl}/honest/inbox?${params.toString()}`
}

/**
 * Parse a honest inbox link to extract public key and name
 *
 * @param url - The URL to parse
 * @returns Object with publicKey and optional name, or null if invalid
 */
export function parseHonestInboxLink(url: string): { publicKey: string; name?: string } | null {
  try {
    const urlObj = new URL(url)
    const publicKey = urlObj.searchParams.get('key')
    const name = urlObj.searchParams.get('name')

    if (!publicKey) {
      return null
    }

    const result: { publicKey: string; name?: string } = { publicKey }
    if (name) {
      result.name = name
    }
    return result
  } catch {
    return null
  }
}

/**
 * Send a file anonymously to a honest inbox
 * The sender's identity is not revealed - no account required
 *
 * @param file - The file to send
 * @param recipientPublicKey - The recipient's public key (from their honest inbox link)
 * @param options - Optional progress callbacks
 * @returns Result with reference and download URL
 */
export async function sendAnonymousFile(
  file: File,
  recipientPublicKey: string,
  options: AnonymousSendOptions = {}
): Promise<AnonymousSendResult> {
  const { onProgress, onStatusChange } = options

  onStatusChange?.('encrypting')

  // Convert public key to bytes
  const pubKeyBytes = hexToBytes(recipientPublicKey.replace('0x', ''))

  // Create an anonymous file (strip filename for privacy)
  const anonymousFile = new File([file], 'file', { type: file.type })

  // Encrypt the file
  const encrypted = await encryptFile(anonymousFile, pubKeyBytes)

  onStatusChange?.('uploading')

  // Combine encrypted data into a single blob for upload
  const dataToUpload = combineEncryptedData(encrypted)

  // Build upload options, only including onProgress if defined
  const uploadOptions: { contentType: string; filename: string; onProgress?: ProgressCallback } = {
    contentType: 'application/octet-stream',
    filename: 'encrypted',
  }
  if (onProgress) {
    uploadOptions.onProgress = onProgress
  }

  // Upload to Swarm
  const reference = await uploadData(dataToUpload, uploadOptions)

  onStatusChange?.('complete')
  onProgress?.(100)

  // Generate download URL
  const downloadUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/download/${reference}`
      : `/download/${reference}`

  return {
    reference,
    downloadUrl,
  }

  // Note: We do NOT store this in "sent" messages to preserve anonymity
}

/**
 * Send anonymous file to a honest inbox via GSOC notification
 * This notifies the recipient via their GSOC inbox
 *
 * @param file - The file to send
 * @param inbox - The recipient's honest inbox (with gsocParams)
 * @param options - Optional progress callbacks
 * @returns Result with reference and download URL
 */
export async function sendToHonestInbox(
  file: File,
  inbox: HonestInbox,
  options: AnonymousSendOptions = {}
): Promise<AnonymousSendResult> {
  if (!inbox.gsocParams) {
    throw new Error('Honest inbox has no GSOC parameters - cannot send notification')
  }

  // First, send the file anonymously
  const result = await sendAnonymousFile(file, inbox.publicKey, options)

  // Find the next available slot
  const nextSlot = await findNextSlot(inbox.gsocParams)

  // Write to GSOC inbox (anonymous mode - no sender info)
  await writeToInbox(
    inbox.gsocParams,
    nextSlot,
    { reference: result.reference },
    { anonymous: true }
  )

  return result
}

/**
 * Receive (download and decrypt) an anonymous file
 *
 * @param reference - The Swarm reference of the encrypted file
 * @param privateKey - The recipient's private key (from their honest inbox)
 * @returns The decrypted file with metadata
 */
export async function receiveAnonymousFile(
  reference: string,
  privateKey: string
): Promise<DecryptedFile> {
  // Download encrypted data from Swarm
  const encryptedData = await downloadData(reference)

  // Parse the encrypted data structure
  const encrypted = parseEncryptedData(encryptedData)

  // Convert private key to bytes
  const privKeyBytes = hexToBytes(privateKey.replace('0x', ''))

  // Decrypt the file
  return decryptFile(encrypted, privKeyBytes)
}

/**
 * Get messages from a honest inbox
 * Messages have no sender info - that's the point!
 *
 * @param inbox - The honest inbox to check
 * @param lastKnownIndex - Start scanning from this index (default 0)
 * @returns Array of anonymous messages
 */
export async function getHonestInboxMessages(
  inbox: HonestInbox,
  lastKnownIndex = 0
): Promise<AnonymousMessage[]> {
  if (!inbox.gsocParams) {
    return []
  }

  const messages = await pollInbox(inbox.gsocParams, lastKnownIndex)

  // Convert GSOC messages to anonymous messages (strip any metadata)
  return messages.map((msg: GSOCMessage) => ({
    reference: msg.reference,
    timestamp: msg.timestamp,
    index: msg.index ?? 0,
  }))
}

/**
 * Subscribe to real-time notifications for a honest inbox
 *
 * @param inbox - The honest inbox to subscribe to
 * @param startIndex - Start subscribing from this slot index
 * @param callbacks - Callbacks for message/error/close events
 * @returns Subscription control object
 */
export function subscribeToHonestInbox(
  inbox: HonestInbox,
  startIndex: number,
  callbacks: {
    onMessage?: (message: AnonymousMessage) => void
    onError?: (error: Error) => void
    onClose?: () => void
  }
): InboxSubscription {
  if (!inbox.gsocParams) {
    throw new Error('Honest inbox has no GSOC parameters - cannot subscribe')
  }

  // Wrap the callback to convert to anonymous message format
  const wrappedCallbacks: SubscriptionCallbacks = {
    onMessage: (msg: GSOCMessage) => {
      callbacks.onMessage?.({
        reference: msg.reference,
        timestamp: msg.timestamp,
        index: msg.index ?? 0,
      })
    },
  }
  if (callbacks.onError) {
    wrappedCallbacks.onError = callbacks.onError
  }
  if (callbacks.onClose) {
    wrappedCallbacks.onClose = callbacks.onClose
  }

  return subscribeToInbox(inbox.gsocParams, startIndex, wrappedCallbacks)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Combine encrypted file data into a single Uint8Array for upload
 * Format: [ephemeralPubKeyLen (4 bytes)][ephemeralPubKey][ivLen (4 bytes)][iv][ciphertext]
 */
function combineEncryptedData(encrypted: EncryptedFile): Uint8Array {
  const pubKey = encrypted.ephemeralPublicKey
  const iv = encrypted.iv
  const ciphertext = encrypted.ciphertext

  // Calculate total size
  const totalSize = 4 + pubKey.length + 4 + iv.length + ciphertext.length
  const result = new Uint8Array(totalSize)

  let offset = 0

  // Write ephemeral public key length and data
  const pubKeyLen = new Uint32Array([pubKey.length])
  result.set(new Uint8Array(pubKeyLen.buffer), offset)
  offset += 4
  result.set(pubKey, offset)
  offset += pubKey.length

  // Write IV length and data
  const ivLen = new Uint32Array([iv.length])
  result.set(new Uint8Array(ivLen.buffer), offset)
  offset += 4
  result.set(iv, offset)
  offset += iv.length

  // Write ciphertext
  result.set(ciphertext, offset)

  return result
}

/**
 * Parse encrypted data from a combined Uint8Array
 */
function parseEncryptedData(data: Uint8Array): EncryptedFile {
  let offset = 0

  // Read ephemeral public key
  const pubKeyLen = new Uint32Array(data.slice(offset, offset + 4).buffer)[0]
  if (pubKeyLen === undefined) {
    throw new Error('Invalid encrypted data format')
  }
  offset += 4
  const ephemeralPublicKey = data.slice(offset, offset + pubKeyLen)
  offset += pubKeyLen

  // Read IV
  const ivLen = new Uint32Array(data.slice(offset, offset + 4).buffer)[0]
  if (ivLen === undefined) {
    throw new Error('Invalid encrypted data format')
  }
  offset += 4
  const iv = data.slice(offset, offset + ivLen)
  offset += ivLen

  // Rest is ciphertext
  const ciphertext = data.slice(offset)

  return {
    ephemeralPublicKey,
    iv,
    ciphertext,
  }
}
