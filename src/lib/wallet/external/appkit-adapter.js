/**
 * External Wallet Adapter
 *
 * Handles external wallet connections via:
 * - Direct MetaMask/injected provider
 * - Reown AppKit (WalletConnect, 300+ wallets)
 */

import { ethers } from 'ethers';

/**
 * External Wallet Adapter
 */
export class ExternalWalletAdapter {
  constructor() {
    this.type = 'external';
    this.provider = null;
    this.signer = null;
    this.address = null;
    this._accountChangeCallback = null;
    this._chainChangeCallback = null;
  }

  /**
   * Check if external wallets are available
   */
  static isAvailable() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to external wallet
   * Uses injected provider (MetaMask) first, falls back to AppKit modal
   */
  async connect() {
    // Try injected provider first (MetaMask, etc.)
    if (window.ethereum) {
      return this._connectInjected();
    }

    // If no injected provider, show AppKit modal
    return this._connectAppKit();
  }

  /**
   * Connect via injected provider (MetaMask)
   */
  async _connectInjected() {
    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Request accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();

      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Set up event listeners
      this._setupInjectedListeners();

      return {
        address: this.address,
        chainId
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw error;
    }
  }

  /**
   * Connect via Reown AppKit
   * This opens a modal with multiple wallet options
   */
  async _connectAppKit() {
    try {
      // Dynamic import to avoid loading AppKit if not needed
      const { createAppKit } = await import('@reown/appkit');
      const { EthersAdapter } = await import('@reown/appkit-adapter-ethers');

      // Initialize AppKit with Gnosis Chain (for xBZZ) and Ethereum
      const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

      const mainnet = {
        id: 1,
        name: 'Ethereum',
        network: 'mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth.drpc.org'] }
        }
      };

      const gnosis = {
        id: 100,
        name: 'Gnosis',
        network: 'gnosis',
        nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://rpc.gnosischain.com'] }
        }
      };

      const ethersAdapter = new EthersAdapter();

      const modal = createAppKit({
        adapters: [ethersAdapter],
        networks: [mainnet, gnosis],
        projectId,
        metadata: {
          name: 'Fairdrop',
          description: 'Secure file sharing on Swarm',
          url: 'https://fairdrop.xyz',
          icons: ['https://fairdrop.xyz/assets/images/fairdrop-logo.svg']
        },
        features: {
          analytics: false
        }
      });

      // Open modal and wait for connection
      await modal.open();

      // Wait for connection
      return new Promise((resolve, reject) => {
        const unsubscribe = modal.subscribeState((state) => {
          if (state.selectedNetworkId && state.address) {
            unsubscribe();
            this.address = state.address;

            // Get provider from AppKit
            this.provider = modal.getProvider();
            this.signer = this.provider.getSigner();

            resolve({
              address: state.address,
              chainId: state.selectedNetworkId
            });
          }
        });

        // Timeout after 2 minutes
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Connection timeout'));
        }, 120000);
      });
    } catch (error) {
      console.error('[AppKit] Connection error:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  /**
   * Set up listeners for injected provider
   */
  _setupInjectedListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.address = null;
        if (this._accountChangeCallback) {
          this._accountChangeCallback(null);
        }
      } else {
        this.address = accounts[0];
        if (this._accountChangeCallback) {
          this._accountChangeCallback(accounts[0]);
        }
      }
    });

    window.ethereum.on('chainChanged', (chainId) => {
      const parsedChainId = parseInt(chainId, 16);
      if (this._chainChangeCallback) {
        this._chainChangeCallback(parsedChainId);
      }
    });
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;

    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message) {
    if (!this.signer) {
      throw new Error('No signer available');
    }
    return this.signer.signMessage(message);
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData) {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const { domain, types, value } = typedData;
    // Remove EIP712Domain from types if present
    const filteredTypes = { ...types };
    delete filteredTypes.EIP712Domain;

    return this.signer.signTypedData(domain, filteredTypes, value);
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx) {
    if (!this.signer) {
      throw new Error('No signer available');
    }
    const txResponse = await this.signer.sendTransaction(tx);
    return txResponse.hash;
  }

  /**
   * Get signer
   */
  getSigner() {
    return this.signer;
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
    if (!window.ethereum) {
      throw new Error('No wallet connected');
    }

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
    } catch (error) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        // Would need chain config to add - skip for now
        throw new Error(`Chain ${chainId} not available in wallet`);
      }
      throw error;
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

export default ExternalWalletAdapter;
