/**
 * External Wallet Adapter
 *
 * Handles external wallet connections via:
 * - Direct MetaMask/injected provider
 * - Reown AppKit (WalletConnect, 300+ wallets)
 */

import { ethers, BrowserProvider, JsonRpcSigner, Eip1193Provider } from 'ethers'
import type { WalletAdapter, ConnectResult, TypedData, ChainConfig } from './types'

/**
 * Chain configurations for supported networks
 */
const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://eth.drpc.org',
  },
  100: {
    id: 100,
    name: 'Gnosis',
    network: 'gnosis',
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    rpcUrl: 'https://rpc.gnosischain.com',
  },
}

/**
 * External Wallet Adapter
 * Supports MetaMask, WalletConnect, and other injected providers
 */
export class ExternalWalletAdapter implements WalletAdapter {
  readonly type = 'external' as const
  private provider: BrowserProvider | null = null
  private signer: JsonRpcSigner | null = null
  private _address: string | null = null
  private _accountChangeCallback: ((address: string | null) => void) | null = null
  private _chainChangeCallback: ((chainId: number) => void) | null = null

  /**
   * Check if external wallets are available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  /**
   * Get current address
   */
  get address(): string | null {
    return this._address
  }

  /**
   * Connect to external wallet
   * Uses injected provider (MetaMask) first, falls back to AppKit modal
   */
  async connect(): Promise<ConnectResult> {
    // Try injected provider first (MetaMask, etc.)
    if (typeof window !== 'undefined' && window.ethereum) {
      return this._connectInjected()
    }

    // If no injected provider, show AppKit modal
    return this._connectAppKit()
  }

  /**
   * Connect via injected provider (MetaMask)
   */
  private async _connectInjected(): Promise<ConnectResult> {
    if (!window.ethereum) {
      throw new Error('No injected provider found')
    }

    try {
      this.provider = new BrowserProvider(window.ethereum as Eip1193Provider)

      // Request accounts
      await window.ethereum.request?.({ method: 'eth_requestAccounts' })

      this.signer = await this.provider.getSigner()
      this._address = await this.signer.getAddress()

      const network = await this.provider.getNetwork()
      const chainId = Number(network.chainId)

      // Set up event listeners
      this._setupInjectedListeners()

      return {
        address: this._address,
        chainId,
      }
    } catch (error) {
      const err = error as { code?: number }
      if (err.code === 4001) {
        throw new Error('Connection rejected by user')
      }
      throw error
    }
  }

  /**
   * Connect via Reown AppKit
   * This opens a modal with multiple wallet options
   */
  private async _connectAppKit(): Promise<ConnectResult> {
    try {
      // Dynamic import to avoid loading AppKit if not needed
      const { createAppKit } = await import('@reown/appkit')
      const { EthersAdapter } = await import('@reown/appkit-adapter-ethers')

      // Initialize AppKit with Gnosis Chain (for xBZZ) and Ethereum
      const projectId =
        import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

      const mainnet = {
        id: 1,
        name: 'Ethereum',
        network: 'mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth.drpc.org'] },
        },
      }

      const gnosis = {
        id: 100,
        name: 'Gnosis',
        network: 'gnosis',
        nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://rpc.gnosischain.com'] },
        },
      }

      const ethersAdapter = new EthersAdapter()

      // Cast config to bypass strict type checking on AppKit config
      const config = {
        adapters: [ethersAdapter],
        networks: [mainnet, gnosis],
        projectId,
        metadata: {
          name: 'Fairdrop',
          description: 'Secure file sharing on Swarm',
          url: 'https://fairdrop.xyz',
          icons: ['https://fairdrop.xyz/assets/images/fairdrop-logo.svg'],
        },
        features: {
          analytics: false,
        },
      }

      const modal = createAppKit(config as unknown as Parameters<typeof createAppKit>[0])

      // Open modal and wait for connection
      await modal.open()

      // Wait for connection
      return new Promise<ConnectResult>((resolve, reject) => {
        // AppKit's subscribeState has complex types, use explicit callback type
        const callback = (state: Record<string, unknown>): void => {
          const networkId = state.selectedNetworkId as number | undefined
          const address = state.address as string | undefined
          if (networkId && address) {
            unsubscribe()
            this._address = address

            resolve({
              address,
              chainId: networkId,
            })
          }
        }
        const unsubscribe = modal.subscribeState(callback as unknown as Parameters<typeof modal.subscribeState>[0])

        // Timeout after 2 minutes
        setTimeout(() => {
          unsubscribe()
          reject(new Error('Connection timeout'))
        }, 120000)
      })
    } catch (error) {
      console.error('[AppKit] Connection error:', error)
      throw new Error('Failed to connect wallet. Please try again.')
    }
  }

  /**
   * Set up listeners for injected provider
   */
  private _setupInjectedListeners(): void {
    if (typeof window === 'undefined' || !window.ethereum) return

    const ethereum = window.ethereum as Eip1193Provider & {
      on?: (event: string, callback: (data: unknown) => void) => void
      removeAllListeners?: (event: string) => void
    }

    ethereum.on?.('accountsChanged', (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        this._address = null
        this._accountChangeCallback?.(null)
      } else {
        this._address = accs[0] ?? null
        this._accountChangeCallback?.(this._address)
      }
    })

    ethereum.on?.('chainChanged', (chainId: unknown) => {
      const parsedChainId = parseInt(chainId as string, 16)
      this._chainChangeCallback?.(parsedChainId)
    })
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null
    this.signer = null
    this._address = null

    // Remove listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum as Eip1193Provider & {
        removeAllListeners?: (event: string) => void
      }
      ethereum.removeAllListeners?.('accountsChanged')
      ethereum.removeAllListeners?.('chainChanged')
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available')
    }
    return this.signer.signMessage(message)
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(typedData: TypedData): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available')
    }

    const { domain, types, value } = typedData
    // Remove EIP712Domain from types if present
    const filteredTypes = { ...types }
    delete filteredTypes.EIP712Domain

    return this.signer.signTypedData(domain, filteredTypes, value)
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx: ethers.TransactionRequest): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available')
    }
    const txResponse = await this.signer.sendTransaction(tx)
    return txResponse.hash
  }

  /**
   * Get signer
   */
  getSigner(): JsonRpcSigner | null {
    return this.signer
  }

  /**
   * Get provider
   */
  getProvider(): BrowserProvider | null {
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
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet connected')
    }

    const hexChainId = `0x${chainId.toString(16)}`

    try {
      await window.ethereum.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      })
    } catch (error) {
      const err = error as { code?: number }
      // Chain not added, try to add it
      if (err.code === 4902) {
        const config = CHAIN_CONFIGS[chainId]
        if (config) {
          await this._addChain(config)
        } else {
          throw new Error(`Chain ${chainId} not available in wallet`)
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Add a new chain to the wallet
   */
  private async _addChain(config: ChainConfig): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet connected')
    }

    await window.ethereum.request?.({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${config.id.toString(16)}`,
          chainName: config.name,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: [config.rpcUrl],
        },
      ],
    })
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

export default ExternalWalletAdapter
