/**
 * Client-side Encryption Layer
 * Uses secp256k1 ECDH for key agreement and AES-GCM for encryption
 */

import * as secp256k1 from '@noble/secp256k1'

// Type definitions
export interface KeyPair {
  privateKey: Uint8Array
  publicKey: Uint8Array
}

export interface EncryptedData {
  ciphertext: Uint8Array
  iv: Uint8Array
}

export interface EncryptedFile extends EncryptedData {
  ephemeralPublicKey: Uint8Array
}

export interface FileMetadata {
  name: string
  type: string
  size: number
  timestamp: number
}

export interface DecryptedFile {
  file: Blob
  metadata: FileMetadata
}

/**
 * Generate a new keypair for encryption
 */
export function generateKeyPair(): KeyPair {
  const privateKey = secp256k1.utils.randomSecretKey()
  const publicKey = secp256k1.getPublicKey(privateKey)
  return { privateKey, publicKey }
}

/**
 * Derive a shared secret using ECDH
 */
export async function deriveSharedSecret(
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<Uint8Array> {
  const sharedPoint = secp256k1.getSharedSecret(privateKey, publicKey)
  // Hash the shared point to get a symmetric key
  const hashBuffer = await crypto.subtle.digest('SHA-256', sharedPoint.slice(1))
  return new Uint8Array(hashBuffer)
}

/**
 * Convert Uint8Array to ArrayBuffer for crypto operations
 * Explicitly type as ArrayBuffer to satisfy strict TypeScript
 */
function toBuffer(data: Uint8Array): ArrayBuffer {
  // slice() returns ArrayBuffer | SharedArrayBuffer, but we know it's ArrayBuffer
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
}

/**
 * Encrypt data using AES-GCM with a shared secret
 */
export async function encryptData(
  data: Uint8Array,
  sharedSecret: Uint8Array
): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await crypto.subtle.importKey('raw', toBuffer(sharedSecret), { name: 'AES-GCM' }, false, [
    'encrypt',
  ])

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, toBuffer(data))

  return {
    ciphertext: new Uint8Array(ciphertext),
    iv,
  }
}

/**
 * Decrypt data using AES-GCM with a shared secret
 */
export async function decryptData(
  ciphertext: Uint8Array,
  iv: Uint8Array,
  sharedSecret: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', toBuffer(sharedSecret), { name: 'AES-GCM' }, false, [
    'decrypt',
  ])

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    key,
    toBuffer(ciphertext)
  )

  return new Uint8Array(decrypted)
}

/**
 * Encrypt a file for a recipient
 */
export async function encryptFile(file: File, recipientPublicKey: Uint8Array): Promise<EncryptedFile> {
  // Generate ephemeral keypair for this message
  const ephemeral = generateKeyPair()

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(ephemeral.privateKey, recipientPublicKey)

  // Read file as array buffer
  const fileData = new Uint8Array(await file.arrayBuffer())

  // Create metadata
  const metadata: FileMetadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    timestamp: Date.now(),
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
    iv,
  }
}

/**
 * Decrypt a file with your private key
 */
export async function decryptFile(
  encryptedData: EncryptedFile,
  privateKey: Uint8Array
): Promise<DecryptedFile> {
  const { ephemeralPublicKey, ciphertext, iv } = encryptedData

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(privateKey, ephemeralPublicKey)

  // Decrypt
  const decrypted = await decryptData(ciphertext, iv, sharedSecret)

  // Parse metadata length
  const metadataLength = new Uint32Array(decrypted.slice(0, 4).buffer)[0]
  if (metadataLength === undefined) {
    throw new Error('Invalid encrypted data format')
  }

  // Parse metadata
  const metadataBytes = decrypted.slice(4, 4 + metadataLength)
  const metadata = JSON.parse(new TextDecoder().decode(metadataBytes)) as FileMetadata

  // Extract file data
  const fileData = decrypted.slice(4 + metadataLength)

  // Create blob
  const blob = new Blob([fileData], { type: metadata.type })

  return { file: blob, metadata }
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
