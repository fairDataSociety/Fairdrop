/**
 * Core Fairdrop Types
 */

// Account types
export interface Account {
  subdomain: string
  publicKey: string
  privateKey: string
  passwordHash: string
  walletAddress?: string
  created: number
}

// Message/File types
export interface Message {
  reference: string
  filename: string
  size: number
  from?: string
  to?: string
  timestamp: number
  encrypted: boolean
}

// Upload result
export interface UploadResult {
  reference: string
  ephemeralPublicKey?: string
  url: string
}

// GSOC Inbox params
export interface InboxParams {
  targetOverlay: string
  baseIdentifier: string
  proximity: number
  recipientPublicKey?: string
}

// Honest Inbox
export interface HonestInbox {
  id: string
  name: string
  publicKey: string
  privateKey: string
  gsocParams?: InboxParams
  created: number
}

// Upload modes
export type UploadMode = 'send' | 'store' | 'quick' | 'anonymous'

// Upload status
export type UploadStatus =
  | 'idle'
  | 'encrypting'
  | 'uploading'
  | 'notifying'
  | 'complete'
  | 'error'

// Wallet types
export type WalletType = 'metamask' | 'walletconnect' | 'embedded'

export interface WalletState {
  connected: boolean
  address?: string
  chainId?: number
  type?: WalletType
}

// Stamp types
export interface PostageStamp {
  batchID: string
  utilization: number
  usable: boolean
  label?: string
  depth: number
  amount: string
  bucketDepth: number
  blockNumber: number
  immutableFlag: boolean
  batchTTL: number
}

// Error types
export class FairdropError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'FairdropError'
  }
}

// Progress callback type
export type ProgressCallback = (progress: number) => void

// Status callback type
export type StatusCallback = (status: UploadStatus) => void
