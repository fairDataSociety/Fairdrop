/**
 * Wallet Types
 *
 * Type definitions for the wallet abstraction layer
 */

import type { ethers, BrowserProvider, JsonRpcProvider, Signer } from 'ethers'

/**
 * Wallet types
 */
export type WalletType = 'external' | 'embedded'

/**
 * Wallet connection states
 */
export type WalletState = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Result from connecting a wallet
 */
export interface ConnectResult {
  address: string
  chainId: number
  /** True if this is a newly created wallet (embedded only) */
  isNew?: boolean
  /** Mnemonic phrase (only returned on new wallet creation) */
  mnemonic?: string
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  id: number
  name: string
  network: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string
}

/**
 * EIP-712 Typed Data
 */
export interface TypedData {
  domain: ethers.TypedDataDomain
  types: Record<string, ethers.TypedDataField[]>
  value: Record<string, unknown>
}

/**
 * Wallet adapter interface
 * All wallet implementations must implement this interface
 */
export interface WalletAdapter {
  readonly type: WalletType
  readonly address: string | null

  connect(): Promise<ConnectResult>
  disconnect(): void

  signMessage(message: string): Promise<string>
  signTypedData(typedData: TypedData): Promise<string>
  sendTransaction(tx: ethers.TransactionRequest): Promise<string>

  getSigner(): Signer | null
  getProvider(): BrowserProvider | JsonRpcProvider | null

  getBalance(): Promise<string>
  switchChain(chainId: number): Promise<void>

  onAccountChange(callback: (address: string | null) => void): void
  onChainChange(callback: (chainId: number) => void): void
}

/**
 * Stored wallet state
 */
export interface StoredWalletState {
  connected: boolean
  address: string | null
  chainId: number | null
  connectedAt: number
}

/**
 * Embedded wallet storage format
 */
export interface EmbeddedWalletStorage {
  address: string
  createdAt: number
}

/**
 * Wallet event types
 */
export type WalletEvent = 'connect' | 'disconnect' | 'accountChange' | 'chainChange' | 'stateChange' | 'error'

/**
 * Wallet event data map
 */
export interface WalletEventMap {
  connect: { address: string; chainId: number }
  disconnect: void
  accountChange: string | null
  chainChange: number
  stateChange: WalletState
  error: Error
}

/**
 * Wallet event callback
 */
export type WalletEventCallback<E extends WalletEvent> = (data: WalletEventMap[E]) => void
