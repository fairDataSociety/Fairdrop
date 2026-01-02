/**
 * Swarm Services
 * Re-exports all Swarm-related functionality
 */

// Client
export { getBee, checkConnection, getBeeUrl, getDefaultStampId, setDefaultStampId } from './client'

// Encryption
export {
  generateKeyPair,
  deriveSharedSecret,
  encryptData,
  decryptData,
  encryptFile,
  decryptFile,
  hexToBytes,
  bytesToHex,
} from './encryption'
export type { KeyPair, EncryptedData, EncryptedFile, FileMetadata, DecryptedFile } from './encryption'

// Upload
export { uploadFile, uploadFiles, uploadData, getShareableLink, getGatewayLink } from './upload'
export type { UploadOptions, UploadResult } from './upload'

// Download
export { downloadFile, downloadData, checkReference, createBlobUrl, triggerDownload } from './download'
export type { DownloadOptions, DownloadResult } from './download'

// Stamps
export {
  getAllStamps,
  getLocalStamps,
  getStamp,
  isStampUsable,
  getStampCapacity,
  requestSponsoredStamp,
  calculateStorageCost,
  estimateDepth,
} from './stamps'

// GSOC Inbox
export {
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
  INBOX_PREFIX,
} from './gsoc'
export type {
  GSOCMessage,
  EncryptedMetadata,
  SenderInfo,
  WritePayload,
  WriteOptions,
  SubscriptionCallbacks,
  InboxSubscription,
  MinedInbox,
} from './gsoc'

// Honest Inbox (Mode 2: Anonymous Sending)
export {
  createHonestInbox,
  getAllHonestInboxes,
  getHonestInboxById,
  deleteHonestInbox,
  getHonestInboxLink,
  parseHonestInboxLink,
  sendAnonymousFile,
  sendToHonestInbox,
  receiveAnonymousFile,
  getHonestInboxMessages,
  subscribeToHonestInbox,
} from './honestInbox'
export type {
  CreateHonestInboxOptions,
  AnonymousSendOptions,
  AnonymousSendResult,
  AnonymousMessage,
} from './honestInbox'
