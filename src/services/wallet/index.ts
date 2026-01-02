/**
 * Unified Wallet Abstraction Layer
 *
 * Provides a consistent API for both external (MetaMask, WalletConnect)
 * and embedded (self-custodial) wallets.
 *
 * Usage:
 *   const wallet = await Wallet.connect({ type: 'external' });
 *   await wallet.signMessage(message);
 *   await wallet.sendTransaction(tx);
 */

import { ethers, BrowserProvider, JsonRpcProvider, Signer } from 'ethers'
import { ExternalWalletAdapter } from './external'
import { EmbeddedWalletAdapter } from './embedded'
import type {
  WalletAdapter,
  WalletType,
  WalletState,
  ConnectResult,
  TypedData,
  StoredWalletState,
  WalletEvent,
  WalletEventCallback,
} from './types'

// Re-export types
export type {
  WalletType,
  WalletState,
  ConnectResult,
  TypedData,
  WalletAdapter,
  WalletEvent,
  WalletEventCallback,
}

// Storage keys
const WALLET_TYPE_KEY = 'fairdrop_wallet_type'
const WALLET_STATE_KEY = 'fairdrop_wallet_state'

/**
 * Connect options
 */
export interface ConnectOptions {
  type?: WalletType
}

/**
 * Unified Wallet class
 * Wraps wallet adapters with a consistent API and event system
 */
export class Wallet {
  private adapter: WalletAdapter
  readonly type: WalletType
  private _state: WalletState = 'disconnected'
  private _address: string | null = null
  private _chainId: number | null = null
  private _listeners: Map<WalletEvent, Set<WalletEventCallback<WalletEvent>>> = new Map()

  constructor(adapter: WalletAdapter) {
    this.adapter = adapter
    this.type = adapter.type
  }

  /**
   * Get current state
   */
  get state(): WalletState {
    return this._state
  }

  /**
   * Get current address
   */
  get address(): string | null {
    return this._address
  }

  /**
   * Get current chain ID
   */
  get chainId(): number | null {
    return this._chainId
  }

  /**
   * Connect to a wallet
   */
  static async connect(options: ConnectOptions = {}): Promise<Wallet> {
    const type = options.type ?? 'external'

    let adapter: WalletAdapter
    if (type === 'embedded') {
      adapter = new EmbeddedWalletAdapter()
    } else {
      adapter = new ExternalWalletAdapter()
    }

    const wallet = new Wallet(adapter)
    await wallet._connect()

    // Store wallet type for reconnection
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALLET_TYPE_KEY, type)
    }

    return wallet
  }

  /**
   * Try to reconnect to previously connected wallet
   */
  static async reconnect(): Promise<Wallet | null> {
    if (typeof window === 'undefined') {
      return null
    }

    const storedType = localStorage.getItem(WALLET_TYPE_KEY) as WalletType | null
    const storedState = localStorage.getItem(WALLET_STATE_KEY)

    if (!storedType || !storedState) {
      return null
    }

    try {
      const state: StoredWalletState = JSON.parse(storedState)
      if (!state.connected) {
        return null
      }

      const wallet = await Wallet.connect({ type: storedType })
      return wallet
    } catch (error) {
      console.warn('[Wallet] Reconnection failed:', error)
      return null
    }
  }

  /**
   * Check if a wallet type is available
   */
  static isAvailable(type: WalletType): boolean {
    if (type === 'embedded') {
      return EmbeddedWalletAdapter.isAvailable()
    }
    return ExternalWalletAdapter.isAvailable()
  }

  /**
   * Check if embedded wallet exists
   */
  static hasEmbeddedWallet(): boolean {
    return EmbeddedWalletAdapter.hasExistingWallet()
  }

  /**
   * Internal connect method
   */
  private async _connect(): Promise<this> {
    this._state = 'connecting'
    this._emit('stateChange', this._state)

    try {
      const result: ConnectResult = await this.adapter.connect()
      this._address = result.address
      this._chainId = result.chainId
      this._state = 'connected'

      // Store state
      if (typeof window !== 'undefined') {
        const stateToStore: StoredWalletState = {
          connected: true,
          address: this._address,
          chainId: this._chainId,
          connectedAt: Date.now(),
        }
        localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(stateToStore))
      }

      // Set up listeners
      this.adapter.onAccountChange((address) => {
        this._address = address
        this._emit('accountChange', address)
        if (!address) {
          this.disconnect()
        }
      })

      this.adapter.onChainChange((chainId) => {
        this._chainId = chainId
        this._emit('chainChange', chainId)
      })

      this._emit('stateChange', this._state)
      this._emit('connect', { address: this._address, chainId: this._chainId })

      return this
    } catch (error) {
      this._state = 'error'
      this._emit('stateChange', this._state)
      this._emit('error', error as Error)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.adapter.disconnect()
    this._address = null
    this._chainId = null
    this._state = 'disconnected'

    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STATE_KEY)
    }

    this._emit('stateChange', this._state)
    this._emit('disconnect', undefined)
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (this._state !== 'connected') {
      throw new Error('Wallet not connected')
    }
    return this.adapter.signMessage(message)
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData: TypedData): Promise<string> {
    if (this._state !== 'connected') {
      throw new Error('Wallet not connected')
    }
    return this.adapter.signTypedData(typedData)
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx: ethers.TransactionRequest): Promise<string> {
    if (this._state !== 'connected') {
      throw new Error('Wallet not connected')
    }
    return this.adapter.sendTransaction(tx)
  }

  /**
   * Get the signer for direct ethers.js usage
   */
  getSigner(): Signer | null {
    return this.adapter.getSigner()
  }

  /**
   * Get the provider
   */
  getProvider(): BrowserProvider | JsonRpcProvider | null {
    return this.adapter.getProvider()
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (this._state !== 'connected') {
      throw new Error('Wallet not connected')
    }
    return this.adapter.getBalance()
  }

  /**
   * Switch chain
   */
  async switchChain(chainId: number): Promise<void> {
    return this.adapter.switchChain(chainId)
  }

  /**
   * Format address for display
   */
  formatAddress(): string {
    if (!this._address) return ''
    return `${this._address.slice(0, 6)}...${this._address.slice(-4)}`
  }

  /**
   * Add event listener
   */
  on<E extends WalletEvent>(event: E, callback: WalletEventCallback<E>): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event)!.add(callback as WalletEventCallback<WalletEvent>)
    return () => this.off(event, callback)
  }

  /**
   * Remove event listener
   */
  off<E extends WalletEvent>(event: E, callback: WalletEventCallback<E>): void {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.delete(callback as WalletEventCallback<WalletEvent>)
    }
  }

  /**
   * Emit event
   */
  private _emit<E extends WalletEvent>(
    event: E,
    data: E extends 'disconnect' ? undefined : Parameters<WalletEventCallback<E>>[0]
  ): void {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.forEach((cb) => cb(data as never))
    }
  }

  /**
   * Delete embedded wallet (only for embedded type)
   */
  deleteEmbeddedWallet(): void {
    if (this.adapter instanceof EmbeddedWalletAdapter) {
      this.adapter.deleteWallet()
    } else {
      throw new Error('Can only delete embedded wallets')
    }
  }

  /**
   * Export mnemonic (only for embedded type, only after creation)
   */
  exportMnemonic(): string {
    if (this.adapter instanceof EmbeddedWalletAdapter) {
      return this.adapter.exportMnemonic()
    }
    throw new Error('Mnemonic export only available for embedded wallets')
  }
}

export { ExternalWalletAdapter } from './external'
export { EmbeddedWalletAdapter } from './embedded'
export default Wallet
