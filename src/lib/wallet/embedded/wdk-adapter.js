/**
 * Embedded Wallet Adapter (Tether WDK)
 *
 * Self-custodial embedded wallet using Tether's Wallet Development Kit.
 * Creates a new wallet that lives in the browser with encrypted seed storage.
 *
 * Note: This is a placeholder implementation. Full integration requires
 * Tether WDK SDK access and partnership setup.
 *
 * Features planned:
 * - Create new wallet (no seed import for security)
 * - Encrypted local storage of seed
 * - PIN/biometric unlock
 * - Export seed phrase for backup
 */

import { ethers } from 'ethers';

// Storage keys
const WDK_WALLET_KEY = 'fairdrop_embedded_wallet';
const WDK_ENCRYPTED_KEY = 'fairdrop_embedded_encrypted';

/**
 * Embedded Wallet Adapter
 */
export class EmbeddedWalletAdapter {
  constructor() {
    this.type = 'embedded';
    this.wallet = null;
    this.provider = null;
    this.address = null;
    this._accountChangeCallback = null;
    this._chainChangeCallback = null;
  }

  /**
   * Check if embedded wallet is available
   * For now, always available as we create local wallets
   */
  static isAvailable() {
    // Embedded wallet creation is always available
    // Check if Tether WDK SDK is loaded (future)
    // return typeof window !== 'undefined' && typeof window.TetherWDK !== 'undefined';
    return true;
  }

  /**
   * Check if user already has an embedded wallet
   */
  static hasExistingWallet() {
    return localStorage.getItem(WDK_ENCRYPTED_KEY) !== null;
  }

  /**
   * Connect to embedded wallet
   * Creates new wallet if none exists
   */
  async connect() {
    // Check for existing wallet
    const existingWallet = localStorage.getItem(WDK_ENCRYPTED_KEY);

    if (existingWallet) {
      // TODO: Prompt for PIN/password to decrypt
      // For now, use unencrypted fallback
      return this._loadExistingWallet();
    }

    // Create new wallet
    return this._createNewWallet();
  }

  /**
   * Create a new embedded wallet
   */
  async _createNewWallet() {
    try {
      // Generate new random wallet
      this.wallet = ethers.Wallet.createRandom();
      this.address = this.wallet.address;

      // Connect to default provider (Gnosis for xBZZ operations)
      this.provider = new ethers.JsonRpcProvider('https://rpc.gnosischain.com');
      this.wallet = this.wallet.connect(this.provider);

      // Store wallet (encrypted in production)
      // TODO: Encrypt with user's PIN/password
      const walletData = {
        address: this.address,
        // In production: encrypt this with user's password
        privateKey: this.wallet.privateKey,
        createdAt: Date.now()
      };

      localStorage.setItem(WDK_WALLET_KEY, JSON.stringify({
        address: this.address,
        createdAt: walletData.createdAt
      }));

      // Store encrypted key separately
      // TODO: Use proper encryption (AES-GCM with PBKDF2 derived key)
      localStorage.setItem(WDK_ENCRYPTED_KEY, btoa(walletData.privateKey));

      console.log('[WDK] Created new embedded wallet:', this.address);

      return {
        address: this.address,
        chainId: 100, // Gnosis
        isNew: true,
        // Return mnemonic for user to backup (only on creation)
        mnemonic: this.wallet.mnemonic?.phrase
      };
    } catch (error) {
      console.error('[WDK] Failed to create wallet:', error);
      throw new Error('Failed to create embedded wallet');
    }
  }

  /**
   * Load existing wallet
   */
  async _loadExistingWallet() {
    try {
      const encryptedKey = localStorage.getItem(WDK_ENCRYPTED_KEY);
      const walletInfo = JSON.parse(localStorage.getItem(WDK_WALLET_KEY) || '{}');

      if (!encryptedKey) {
        throw new Error('No wallet found');
      }

      // TODO: Decrypt with user's PIN/password
      const privateKey = atob(encryptedKey);

      this.provider = new ethers.JsonRpcProvider('https://rpc.gnosischain.com');
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.address = this.wallet.address;

      console.log('[WDK] Loaded existing wallet:', this.address);

      return {
        address: this.address,
        chainId: 100,
        isNew: false
      };
    } catch (error) {
      console.error('[WDK] Failed to load wallet:', error);
      // Clear corrupted data
      localStorage.removeItem(WDK_WALLET_KEY);
      localStorage.removeItem(WDK_ENCRYPTED_KEY);
      throw new Error('Failed to load wallet. Please create a new one.');
    }
  }

  /**
   * Disconnect wallet (lock)
   */
  disconnect() {
    // Don't delete the wallet, just lock it
    this.wallet = null;
    this.provider = null;
    this.address = null;
  }

  /**
   * Delete wallet completely
   * WARNING: This is irreversible without backup
   */
  deleteWallet() {
    localStorage.removeItem(WDK_WALLET_KEY);
    localStorage.removeItem(WDK_ENCRYPTED_KEY);
    this.disconnect();
  }

  /**
   * Export mnemonic phrase
   * Only available immediately after creation
   */
  exportMnemonic() {
    if (!this.wallet?.mnemonic) {
      throw new Error('Mnemonic not available. Wallet was loaded from storage.');
    }
    return this.wallet.mnemonic.phrase;
  }

  /**
   * Sign a message
   */
  async signMessage(message) {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked');
    }
    return this.wallet.signMessage(message);
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData) {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked');
    }

    const { domain, types, value } = typedData;
    const filteredTypes = { ...types };
    delete filteredTypes.EIP712Domain;

    return this.wallet.signTypedData(domain, filteredTypes, value);
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx) {
    if (!this.wallet) {
      throw new Error('Wallet not unlocked');
    }
    const txResponse = await this.wallet.sendTransaction(tx);
    return txResponse.hash;
  }

  /**
   * Get signer
   */
  getSigner() {
    return this.wallet;
  }

  /**
   * Get provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get balance
   */
  async getBalance() {
    if (!this.provider || !this.address) {
      throw new Error('Not connected');
    }
    const balance = await this.provider.getBalance(this.address);
    return ethers.formatEther(balance);
  }

  /**
   * Switch chain
   */
  async switchChain(chainId) {
    const rpcUrls = {
      1: 'https://eth.drpc.org',
      100: 'https://rpc.gnosischain.com',
      137: 'https://polygon-rpc.com'
    };

    const rpcUrl = rpcUrls[chainId];
    if (!rpcUrl) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    if (this.wallet) {
      this.wallet = this.wallet.connect(this.provider);
    }

    if (this._chainChangeCallback) {
      this._chainChangeCallback(chainId);
    }
  }

  /**
   * Set account change callback
   */
  onAccountChange(callback) {
    this._accountChangeCallback = callback;
  }

  /**
   * Set chain change callback
   */
  onChainChange(callback) {
    this._chainChangeCallback = callback;
  }
}

export default EmbeddedWalletAdapter;
