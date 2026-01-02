/**
 * Client-side Encryption Layer
 * Uses secp256k1 ECDH for key agreement and AES-GCM for encryption
 */

import * as secp256k1 from '@noble/secp256k1'

/**
 * Generate a new keypair for encryption
 * @returns {Object} Object with privateKey (Uint8Array) and publicKey (Uint8Array)
 */
export const generateKeyPair = () => {
  const privateKey = secp256k1.utils.randomSecretKey()
  const publicKey = secp256k1.getPublicKey(privateKey)
  return { privateKey, publicKey }
}

/**
 * Derive a shared secret using ECDH
 * @param {Uint8Array} privateKey - Your private key
 * @param {Uint8Array} publicKey - Recipient's public key
 * @returns {Promise<Uint8Array>} The shared secret (256 bits)
 */
export const deriveSharedSecret = async (privateKey, publicKey) => {
  const sharedPoint = secp256k1.getSharedSecret(privateKey, publicKey)
  // Hash the shared point to get a symmetric key
  const hashBuffer = await crypto.subtle.digest('SHA-256', sharedPoint.slice(1))
  return new Uint8Array(hashBuffer)
}

/**
 * Encrypt data using AES-GCM with a shared secret
 * @param {Uint8Array} data - Data to encrypt
 * @param {Uint8Array} sharedSecret - 256-bit shared secret
 * @returns {Promise<Object>} Object with ciphertext, iv, and authTag
 */
export const encryptData = async (data, sharedSecret) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return {
    ciphertext: new Uint8Array(ciphertext),
    iv
  }
}

/**
 * Decrypt data using AES-GCM with a shared secret
 * @param {Uint8Array} ciphertext - Encrypted data (includes auth tag)
 * @param {Uint8Array} iv - Initialization vector
 * @param {Uint8Array} sharedSecret - 256-bit shared secret
 * @returns {Promise<Uint8Array>} Decrypted data
 */
export const decryptData = async (ciphertext, iv, sharedSecret) => {
  const key = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new Uint8Array(decrypted)
}

/**
 * Encrypt a file for a recipient
 * @param {File} file - File to encrypt
 * @param {Uint8Array} recipientPublicKey - Recipient's public key
 * @returns {Promise<Object>} Encrypted file data with ephemeral public key
 */
export const encryptFile = async (file, recipientPublicKey) => {
  // Generate ephemeral keypair for this message
  const ephemeral = generateKeyPair()

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(ephemeral.privateKey, recipientPublicKey)

  // Read file as array buffer
  const fileData = new Uint8Array(await file.arrayBuffer())

  // Create metadata
  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    timestamp: Date.now()
  }
  const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata))

  // Combine metadata length + metadata + file data
  const metadataLength = new Uint32Array([metadataBytes.length])
  const combined = new Uint8Array(4 + metadataBytes.length + fileData.length)
  combined.set(new Uint8Array(metadataLength.buffer), 0)
  combined.set(metadataBytes, 4)
  combined.set(fileData, 4 + metadataBytes.length)

  // Encrypt combined data
  const { ciphertext, iv } = await encryptData(combined, sharedSecret)

  return {
    ephemeralPublicKey: ephemeral.publicKey,
    ciphertext,
    iv
  }
}

/**
 * Decrypt a file with your private key
 * @param {Object} encryptedData - Object with ephemeralPublicKey, ciphertext, iv
 * @param {Uint8Array} privateKey - Your private key
 * @returns {Promise<Object>} Object with file (Blob) and metadata
 */
export const decryptFile = async (encryptedData, privateKey) => {
  const { ephemeralPublicKey, ciphertext, iv } = encryptedData

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(privateKey, ephemeralPublicKey)

  // Decrypt
  const decrypted = await decryptData(ciphertext, iv, sharedSecret)

  // Parse metadata length
  const metadataLength = new Uint32Array(decrypted.slice(0, 4).buffer)[0]

  // Parse metadata
  const metadataBytes = decrypted.slice(4, 4 + metadataLength)
  const metadata = JSON.parse(new TextDecoder().decode(metadataBytes))

  // Extract file data
  const fileData = decrypted.slice(4 + metadataLength)

  // Create blob
  const blob = new Blob([fileData], { type: metadata.type })

  return { file: blob, metadata }
}

/**
 * Convert hex string to Uint8Array
 */
export const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string
 */
export const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default {
  generateKeyPair,
  deriveSharedSecret,
  encryptData,
  decryptData,
  encryptFile,
  decryptFile,
  hexToBytes,
  bytesToHex
}
