/**
 * Unified Wallet Abstraction Layer
 *
 * Provides a consistent API for both external (MetaMask, WalletConnect)
 * and embedded (Tether WDK) wallets.
 *
 * Usage:
 *   const wallet = await Wallet.connect({ type: 'external' });
 *   await wallet.signMessage(message);
 *   await wallet.sendTransaction(tx);
 */

import { ExternalWalletAdapter } from './external/appkit-adapter';
import { EmbeddedWalletAdapter } from './embedded/wdk-adapter';

// Storage keys
const WALLET_TYPE_KEY = 'fairdrop_wallet_type';
const WALLET_STATE_KEY = 'fairdrop_wallet_state';

/**
 * Wallet types
 */
export const WalletType = {
  EXTERNAL: 'external',  // MetaMask, WalletConnect, etc.
  EMBEDDED: 'embedded'   // Tether WDK self-custodial
};

/**
 * Wallet connection states
 */
export const WalletState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

/**
 * Unified Wallet class
 */
class Wallet {
  constructor(adapter) {
    this.adapter = adapter;
    this.type = adapter.type;
    this.state = WalletState.DISCONNECTED;
    this.address = null;
    this.chainId = null;
    this._listeners = {};
  }

  /**
   * Connect to a wallet
   * @param {Object} options - { type: 'external' | 'embedded' }
   * @returns {Promise<Wallet>}
   */
  static async connect(options = { type: WalletType.EXTERNAL }) {
    const { type } = options;

    let adapter;
    if (type === WalletType.EMBEDDED) {
      adapter = new EmbeddedWalletAdapter();
    } else {
      adapter = new ExternalWalletAdapter();
    }

    const wallet = new Wallet(adapter);
    await wallet._connect();

    // Store wallet type for reconnection
    localStorage.setItem(WALLET_TYPE_KEY, type);

    return wallet;
  }

  /**
   * Try to reconnect to previously connected wallet
   * @returns {Promise<Wallet|null>}
   */
  static async reconnect() {
    const storedType = localStorage.getItem(WALLET_TYPE_KEY);
    const storedState = localStorage.getItem(WALLET_STATE_KEY);

    if (!storedType || !storedState) {
      return null;
    }

    try {
      const state = JSON.parse(storedState);
      if (!state.connected) {
        return null;
      }

      const wallet = await Wallet.connect({ type: storedType });
      return wallet;
    } catch (error) {
      console.warn('[Wallet] Reconnection failed:', error);
      return null;
    }
  }

  /**
   * Check if a wallet type is available
   * @param {string} type - 'external' | 'embedded'
   * @returns {boolean}
   */
  static isAvailable(type) {
    if (type === WalletType.EMBEDDED) {
      return EmbeddedWalletAdapter.isAvailable();
    }
    return ExternalWalletAdapter.isAvailable();
  }

  /**
   * Internal connect method
   */
  async _connect() {
    this.state = WalletState.CONNECTING;
    this._emit('stateChange', this.state);

    try {
      const result = await this.adapter.connect();
      this.address = result.address;
      this.chainId = result.chainId;
      this.state = WalletState.CONNECTED;

      // Store state
      localStorage.setItem(WALLET_STATE_KEY, JSON.stringify({
        connected: true,
        address: this.address,
        chainId: this.chainId,
        connectedAt: Date.now()
      }));

      // Set up listeners
      this.adapter.onAccountChange((address) => {
        this.address = address;
        this._emit('accountChange', address);
        if (!address) {
          this.disconnect();
        }
      });

      this.adapter.onChainChange((chainId) => {
        this.chainId = chainId;
        this._emit('chainChange', chainId);
      });

      this._emit('stateChange', this.state);
      this._emit('connect', { address: this.address, chainId: this.chainId });

      return this;
    } catch (error) {
      this.state = WalletState.ERROR;
      this._emit('stateChange', this.state);
      this._emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.adapter.disconnect();
    this.address = null;
    this.chainId = null;
    this.state = WalletState.DISCONNECTED;

    localStorage.removeItem(WALLET_STATE_KEY);

    this._emit('stateChange', this.state);
    this._emit('disconnect');
  }

  /**
   * Sign a message
   * @param {string} message - Message to sign
   * @returns {Promise<string>} Signature
   */
  async signMessage(message) {
    if (this.state !== WalletState.CONNECTED) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.signMessage(message);
  }

  /**
   * Sign typed data (EIP-712)
   * @param {Object} typedData - EIP-712 typed data
   * @returns {Promise<string>} Signature
   */
  async signTypedData(typedData) {
    if (this.state !== WalletState.CONNECTED) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.signTypedData(typedData);
  }

  /**
   * Send a transaction
   * @param {Object} tx - Transaction object
   * @returns {Promise<string>} Transaction hash
   */
  async sendTransaction(tx) {
    if (this.state !== WalletState.CONNECTED) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.sendTransaction(tx);
  }

  /**
   * Get the signer for direct ethers.js usage
   * @returns {ethers.Signer}
   */
  getSigner() {
    return this.adapter.getSigner();
  }

  /**
   * Get the provider
   * @returns {ethers.Provider}
   */
  getProvider() {
    return this.adapter.getProvider();
  }

  /**
   * Get wallet balance
   * @returns {Promise<string>} Balance in ETH
   */
  async getBalance() {
    if (this.state !== WalletState.CONNECTED) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.getBalance();
  }

  /**
   * Switch chain
   * @param {number} chainId - Chain ID to switch to
   */
  async switchChain(chainId) {
    return this.adapter.switchChain(chainId);
  }

  /**
   * Format address for display
   * @returns {string}
   */
  formatAddress() {
    if (!this.address) return '';
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit event
   */
  _emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
}

export { Wallet };
export default Wallet;
