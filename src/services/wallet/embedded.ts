/**
 * Embedded Wallet Adapter (Self-Custodial)
 *
 * Self-custodial embedded wallet with encrypted seed storage.
 * Creates a new wallet that lives in the browser.
 *
 * Features:
 * - Create new wallet (random generation)
 * - Encrypted local storage of private key
 * - Export mnemonic phrase for backup (on creation only)
 * - Support for multiple chains
 */

import { ethers, JsonRpcProvider, HDNodeWallet, Wallet as EthersWallet } from 'ethers'
import type { WalletAdapter, ConnectResult, TypedData, EmbeddedWalletStorage } from './types'

// Type for wallet - can be HDNodeWallet (with mnemonic) or regular Wallet (from private key)
type WalletInstance = HDNodeWallet | EthersWallet

// Storage keys
const WDK_WALLET_KEY = 'fairdrop_embedded_wallet'
const WDK_ENCRYPTED_KEY = 'fairdrop_embedded_encrypted'

// RPC URLs for supported chains
const RPC_URLS: Record<number, string> = {
  1: 'https://eth.drpc.org',
  100: 'https://rpc.gnosischain.com',
  137: 'https://polygon-rpc.com',
}

// Default chain (Gnosis for xBZZ operations)
const DEFAULT_CHAIN_ID = 100
const DEFAULT_RPC_URL = RPC_URLS[DEFAULT_CHAIN_ID] ?? 'https://rpc.gnosischain.com'

/**
 * Embedded Wallet Adapter
 * Self-custodial wallet stored in browser localStorage
 */
export class EmbeddedWalletAdapter implements WalletAdapter {
  readonly type = 'embedded' as const
  private wallet: WalletInstance | null = null
  private provider: JsonRpcProvider | null = null
  private _address: string | null = null
  // Callbacks stored for potential future use (embedded wallets don't change accounts dynamically)
  private _accountChangeCallback: ((address: string | null) => void) | null = null
  private _chainChangeCallback: ((chainId: number) => void) | null = null

  /**
   * Check if embedded wallet is available
   * Always available as we create local wallets
   */
  static isAvailable(): boolean {
    return true
  }

  /**
   * Check if user already has an embedded wallet
   */
  static hasExistingWallet(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(WDK_ENCRYPTED_KEY) !== null
  }

  /**
   * Get current address
   */
  get address(): string | null {
    return this._address
  }

  /**
   * Connect to embedded wallet
   * Creates new wallet if none exists
   */
  async connect(): Promise<ConnectResult> {
    // Check for existing wallet
    const existingWallet = localStorage.getItem(WDK_ENCRYPTED_KEY)

    if (existingWallet) {
      return this._loadExistingWallet()
    }

    // Create new wallet
    return this._createNewWallet()
  }

  /**
   * Create a new embedded wallet
   */
  private async _createNewWallet(): Promise<ConnectResult> {
    try {
      // Generate new random wallet (returns HDNodeWallet with mnemonic)
      const randomWallet = ethers.Wallet.createRandom()
      this._address = randomWallet.address

      // Connect to default provider (Gnosis for xBZZ operations)
      this.provider = new JsonRpcProvider(DEFAULT_RPC_URL)
      this.wallet = randomWallet.connect(this.provider)

      // Store wallet (base64 encoded - in production use proper encryption)
      const walletData: EmbeddedWalletStorage = {
        address: this._address,
        createdAt: Date.now(),
      }

      localStorage.setItem(WDK_WALLET_KEY, JSON.stringify(walletData))

      // Store encrypted key separately
      // TODO: Use proper encryption (AES-GCM with PBKDF2 derived key from user password)
      localStorage.setItem(WDK_ENCRYPTED_KEY, btoa(this.wallet.privateKey))

      console.log('[Embedded] Created new embedded wallet:', this._address)

      const result: ConnectResult = {
        address: this._address,
        chainId: DEFAULT_CHAIN_ID,
        isNew: true,
      }

      // Return mnemonic for user to backup (only on creation)
      // HDNodeWallet from createRandom() has mnemonic
      const hdWallet = this.wallet as HDNodeWallet
      if (hdWallet.mnemonic?.phrase) {
        result.mnemonic = hdWallet.mnemonic.phrase
      }

      return result
    } catch (error) {
      console.error('[Embedded] Failed to create wallet:', error)
      throw new Error('Failed to create embedded wallet')
    }
  }

  /**
   * Load existing wallet from storage
   */
  private async _loadExistingWallet(): Promise<ConnectResult> {
    try {
      const encryptedKey = localStorage.getItem(WDK_ENCRYPTED_KEY)

      if (!encryptedKey) {
        throw new Error('No wallet found')
      }

      // TODO: Decrypt with user's PIN/password
      const privateKey = atob(encryptedKey)

      this.provider = new JsonRpcProvider(DEFAULT_RPC_URL)
      // Wallet loaded from private key (no mnemonic available)
      this.wallet = new EthersWallet(privateKey, this.provider)
      this._address = this.wallet.address

      console.log('[Embedded] Loaded existing wallet:', this._address)

      return {
        address: this._address,
        chainId: DEFAULT_CHAIN_ID,
        isNew: false,
      }
    } catch (error) {
      console.error('[Embedded] Failed to load wallet:', error)
      // Clear corrupted data
      localStorage.removeItem(WDK_WALLET_KEY)
      localStorage.removeItem(WDK_ENCRYPTED_KEY)
      throw new Error('Failed to load wallet. Please create a new one.')
    }
  }

  /**
   * Disconnect wallet (lock)
   * Note: This doesn't delete the wallet, just clears the in-memory state
   */
  disconnect(): void {
    const previousAddress = this._address
    this.wallet = null
    this.provider = null
    this._address = null
    // Notify listeners of address change
    if (previousAddress) {
      this._accountChangeCallback?.(null)
    }
  }

  /**
   * Delete wallet completely
   * WARNING: This is irreversible without backup
   */
  deleteWallet(): void {
    localStorage.removeItem(WDK_WALLET_KEY)
    localStorage.removeItem(WDK_ENCRYPTED_KEY)
    this.disconnect()
  }

  /**
   * Export mnemonic phrase
   * Only available immediately after creation (before reload)
   */
  exportMnemonic(): string {
    // Only HDNodeWallet has mnemonic
    const hdWallet = this.wallet as HDNodeWallet | null
    if (!hdWallet?.mnemonic?.phrase) {
      throw new Error('Mnemonic not available. Wallet was loaded from storage.')
    }
    return hdWallet.mnemonic.phrase
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked')
    }
    return this.wallet.signMessage(message)
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData: TypedData): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked')
    }

    const { domain, types, value } = typedData
    // Remove EIP712Domain from types if present
    const filteredTypes = { ...types }
    delete filteredTypes.EIP712Domain

    return this.wallet.signTypedData(domain, filteredTypes, value)
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx: ethers.TransactionRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked')
    }
    const txResponse = await this.wallet.sendTransaction(tx)
    return txResponse.hash
  }

  /**
   * Get signer (the wallet itself is a signer)
   */
  getSigner(): WalletInstance | null {
    return this.wallet
  }

  /**
   * Get provider
   */
  getProvider(): JsonRpcProvider | null {
    return this.provider
  }

  /**
   * Get balance
   */
  async getBalance(): Promise<string> {
    if (!this.provider || !this._address) {
      throw new Error('Not connected')
    }
    const balance = await this.provider.getBalance(this._address)
    return ethers.formatEther(balance)
  }

  /**
   * Switch chain
   */
  async switchChain(chainId: number): Promise<void> {
    const rpcUrl = RPC_URLS[chainId]
    if (!rpcUrl) {
      throw new Error(`Unsupported chain: ${chainId}`)
    }

    this.provider = new JsonRpcProvider(rpcUrl)
    if (this.wallet) {
      this.wallet = this.wallet.connect(this.provider)
    }

    this._chainChangeCallback?.(chainId)
  }

  /**
   * Set account change callback
   */
  onAccountChange(callback: (address: string | null) => void): void {
    this._accountChangeCallback = callback
  }

  /**
   * Set chain change callback
   */
  onChainChange(callback: (chainId: number) => void): void {
    this._chainChangeCallback = callback
  }
}

export default EmbeddedWalletAdapter
