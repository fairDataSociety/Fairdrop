/**
 * Multibox - SOC-based Encrypted Messaging
 * Enables sending encrypted messages/files to recipients using Single Owner Chunks
 *
 * This is the core of the Honest Inbox feature - allowing anonymous senders
 * to upload encrypted files that only the recipient can decrypt.
 */

import { getBee, getDefaultStampId } from './client'
import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  bytesToHex,
  hexToBytes
} from './encryption'
import {
  mineInboxKey,
  writeToInbox,
  findNextSlot,
  pollInbox as gsocPollInbox,
  decryptMetadata
} from './gsoc'

/**
 * Create a new inbox identity for receiving anonymous uploads
 * Generates a keypair and stores the private key locally
 * @param {string} name - Name/identifier for this inbox
 * @param {Object} options - Options for inbox creation
 * @param {string} options.targetOverlay - Bee node overlay for GSOC mining (optional)
 * @returns {Object} Inbox info with publicKey (to share), id, and optionally gsocParams
 */
export const createInbox = async (name, options = {}) => {
  const { privateKey, publicKey } = generateKeyPair()

  // Create inbox ID from name
  const inboxId = name.toLowerCase().replace(/[^a-z0-9]/g, '-')

  // Store private key in localStorage (encrypted in production)
  const inboxData = {
    id: inboxId,
    name,
    privateKey: bytesToHex(privateKey),
    publicKey: bytesToHex(publicKey),
    created: Date.now()
  }

  // Try to set up GSOC inbox for network-level privacy
  let gsocParams = null
  if (options.targetOverlay) {
    try {
      const { params } = await mineInboxKey(options.targetOverlay, options.proximity || 16)
      gsocParams = {
        ...params,
        recipientPublicKey: bytesToHex(publicKey)
      }
      inboxData.gsocParams = gsocParams
      console.log('[Multibox] GSOC inbox created for', name)
    } catch (error) {
      console.warn('[Multibox] Failed to set up GSOC inbox:', error)
    }
  }

  // Get existing inboxes
  const inboxes = JSON.parse(localStorage.getItem('fairdrop_inboxes') || '{}')
  inboxes[inboxId] = inboxData
  localStorage.setItem('fairdrop_inboxes', JSON.stringify(inboxes))

  return {
    id: inboxId,
    name,
    publicKey: bytesToHex(publicKey),
    gsocParams
  }
}

/**
 * Get an existing inbox by ID
 * @param {string} inboxId - Inbox identifier
 * @returns {Object|null} Inbox data or null if not found
 */
export const getInbox = (inboxId) => {
  const inboxes = JSON.parse(localStorage.getItem('fairdrop_inboxes') || '{}')
  return inboxes[inboxId] || null
}

/**
 * Get all local inboxes
 * @returns {Array} Array of inbox info (without private keys)
 */
export const getAllInboxes = () => {
  const inboxes = JSON.parse(localStorage.getItem('fairdrop_inboxes') || '{}')
  return Object.values(inboxes).map(({ id, name, publicKey, created }) => ({
    id,
    name,
    publicKey,
    created
  }))
}

/**
 * Delete an inbox
 * @param {string} inboxId - Inbox identifier
 */
export const deleteInbox = (inboxId) => {
  const inboxes = JSON.parse(localStorage.getItem('fairdrop_inboxes') || '{}')
  delete inboxes[inboxId]
  localStorage.setItem('fairdrop_inboxes', JSON.stringify(inboxes))
}

/**
 * Lookup an inbox's public key by identifier
 * Checks local mailboxes, inboxes, and eventually external registry
 * @param {string} identifier - Inbox name, mailbox name, or ENS name
 * @returns {Promise<string|null>} Public key hex or null
 */
export const lookupInboxPublicKey = async (identifier) => {
  const normalizedId = identifier.toLowerCase()

  // First check local mailboxes (registered users)
  const mailboxes = JSON.parse(localStorage.getItem('fairdrop_mailboxes_v2') || '{}')
  const mailbox = mailboxes[normalizedId]
  if (mailbox?.publicKey) {
    return mailbox.publicKey
  }

  // Check local inboxes (honest inbox recipients)
  const localInbox = getInbox(normalizedId)
  if (localInbox) {
    return localInbox.publicKey
  }

  // Check if it looks like a hex public key directly
  if (identifier.startsWith('0x') || /^[0-9a-f]{66}$/i.test(identifier)) {
    return identifier.replace('0x', '')
  }

  // TODO: Query external registry (ENS, Swarm feed)

  return null
}

/**
 * Send an anonymous file to an inbox
 * Encrypts the file, uploads to Swarm, and writes to GSOC (if params provided)
 * @param {File} file - File to send
 * @param {string} recipientPublicKey - Recipient's public key (hex)
 * @param {Object} options - Upload options
 * @param {Object} options.gsocParams - GSOC inbox params for notification (optional)
 * @returns {Promise<Object>} Upload result with reference and metadata
 */
export const sendAnonymousFile = async (file, recipientPublicKey, options = {}) => {
  const {
    stampId = getDefaultStampId(),
    message = '',
    gsocParams = null,
    onProgress,
    onStatusChange
  } = options

  if (!stampId) {
    throw new Error('No postage stamp available')
  }

  onStatusChange?.('encrypting')

  // Encrypt the file
  const publicKeyBytes = hexToBytes(recipientPublicKey)
  const encrypted = await encryptFile(file, publicKeyBytes)

  onProgress?.(30)
  onStatusChange?.('uploading')

  // Create upload payload - NO sender info for full anonymity
  const payload = {
    version: 1,
    type: 'anonymous-upload',
    ephemeralPublicKey: bytesToHex(encrypted.ephemeralPublicKey),
    iv: bytesToHex(encrypted.iv),
    ciphertext: bytesToHex(encrypted.ciphertext),
    message,
    timestamp: Date.now()
    // NO from, filename, or sender info - this is anonymous!
  }

  // Upload to Swarm
  const bee = getBee()
  const result = await bee.uploadFile(
    stampId,
    new TextEncoder().encode(JSON.stringify(payload)),
    'message.json',
    { contentType: 'application/json' }
  )

  onProgress?.(80)

  // Write to GSOC inbox if params provided (enables auto-discovery)
  if (gsocParams) {
    onStatusChange?.('notifying')
    try {
      const slot = await findNextSlot(gsocParams)
      await writeToInbox(gsocParams, slot, {
        reference: result.reference
        // NO senderInfo - this is honest inbox (Mode 2)
      }, { anonymous: true })
      console.log('[Multibox] GSOC notification written to slot', slot)
    } catch (error) {
      console.warn('[Multibox] Failed to write GSOC notification:', error)
      // Don't fail the upload - message is still on Swarm
    }
  }

  onProgress?.(100)
  onStatusChange?.('complete')

  return {
    reference: result.reference,
    timestamp: payload.timestamp
  }
}

/**
 * Get private key for decryption from inbox or mailbox
 * @param {string} identifier - Inbox ID or mailbox subdomain
 * @returns {Object|null} Object with privateKey or null
 */
const getDecryptionKey = (identifier) => {
  const normalizedId = identifier.toLowerCase()

  // Check inboxes first
  const inbox = getInbox(normalizedId)
  if (inbox?.privateKey) {
    return { privateKey: inbox.privateKey, source: 'inbox' }
  }

  // Check mailboxes
  const mailboxes = JSON.parse(localStorage.getItem('fairdrop_mailboxes_v2') || '{}')
  const mailbox = mailboxes[normalizedId]
  if (mailbox?.privateKey) {
    return { privateKey: mailbox.privateKey, source: 'mailbox' }
  }

  return null
}

/**
 * Receive/decrypt a file from an anonymous sender
 * @param {string} reference - Swarm reference to the encrypted payload
 * @param {string} identifier - ID of the inbox or mailbox to decrypt with
 * @returns {Promise<Object>} Decrypted file and metadata
 */
export const receiveAnonymousFile = async (reference, identifier) => {
  const keyInfo = getDecryptionKey(identifier)
  if (!keyInfo) {
    throw new Error('No decryption key found for this identity')
  }

  const bee = getBee()

  // Download the encrypted payload
  const result = await bee.downloadFile(reference)
  const payload = JSON.parse(new TextDecoder().decode(result.data))

  // Support both message formats
  if (payload.type !== 'anonymous-upload' && payload.type !== 'encrypted-file') {
    throw new Error('Invalid or unsupported message format')
  }

  // Reconstruct encrypted data
  const encryptedData = {
    ephemeralPublicKey: hexToBytes(payload.ephemeralPublicKey),
    iv: hexToBytes(payload.iv),
    ciphertext: hexToBytes(payload.ciphertext)
  }

  // Decrypt
  const privateKey = hexToBytes(keyInfo.privateKey)
  const { file, metadata } = await decryptFile(encryptedData, privateKey)

  return {
    file,
    metadata,
    filename: payload.filename,
    message: payload.message,
    timestamp: payload.timestamp
  }
}

/**
 * Poll an inbox for new messages via GSOC
 * @param {string} inboxId - Inbox identifier
 * @param {number} lastIndex - Start polling from this index (default 0)
 * @returns {Promise<Array>} Array of messages with references
 */
export const pollInbox = async (inboxId, lastIndex = 0) => {
  const inbox = getInbox(inboxId)
  if (!inbox) {
    throw new Error('Inbox not found')
  }

  if (!inbox.gsocParams) {
    console.log('[Multibox] Inbox has no GSOC params, cannot poll')
    return []
  }

  try {
    const messages = await gsocPollInbox(inbox.gsocParams, lastIndex)
    console.log(`[Multibox] Polled ${messages.length} messages from GSOC`)
    return messages
  } catch (error) {
    console.error('[Multibox] Poll error:', error)
    return []
  }
}

/**
 * Get messages from inbox and decrypt them
 * @param {string} inboxId - Inbox identifier
 * @param {number} lastIndex - Start polling from this index
 * @returns {Promise<Array>} Array of decrypted messages
 */
export const receiveInboxMessages = async (inboxId, lastIndex = 0) => {
  const messages = await pollInbox(inboxId, lastIndex)

  if (messages.length === 0) {
    return []
  }

  const decrypted = []
  for (const msg of messages) {
    try {
      const received = await receiveAnonymousFile(msg.reference, inboxId)
      decrypted.push({
        ...received,
        index: msg.index,
        timestamp: msg.timestamp
      })
    } catch (error) {
      console.error(`[Multibox] Failed to decrypt message at index ${msg.index}:`, error)
    }
  }

  return decrypted
}

/**
 * Create a shareable inbox link
 * @param {string} publicKey - Inbox public key
 * @param {string} name - Optional display name
 * @returns {string} Shareable URL
 */
export const getInboxLink = (publicKey, name = '') => {
  const baseUrl = window.location.origin
  const params = new URLSearchParams()
  params.set('key', publicKey)
  if (name) params.set('name', name)
  return `${baseUrl}/honest/inbox?${params.toString()}`
}

/**
 * Parse an inbox link to extract public key
 * @param {string} url - Inbox URL
 * @returns {Object|null} Parsed info or null
 */
export const parseInboxLink = (url) => {
  try {
    const parsed = new URL(url)
    const params = new URLSearchParams(parsed.search)
    return {
      publicKey: params.get('key'),
      name: params.get('name') || null
    }
  } catch {
    return null
  }
}

export default {
  createInbox,
  getInbox,
  getAllInboxes,
  deleteInbox,
  lookupInboxPublicKey,
  sendAnonymousFile,
  receiveAnonymousFile,
  pollInbox,
  receiveInboxMessages,
  getInboxLink,
  parseInboxLink
}
