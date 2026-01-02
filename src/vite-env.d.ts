/// <reference types="vite/client" />

import type { Eip1193Provider } from 'ethers'

interface ImportMetaEnv {
  readonly VITE_BEE_URL: string
  readonly VITE_ENS_RPC: string
  readonly VITE_STAMP_ID: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ENS_DOMAIN?: string
  readonly VITE_ENS_REGISTRATION_API?: string
  readonly VITE_DEFAULT_STAMP_ID?: string
  readonly VITE_SPONSOR_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Extended Ethereum provider interface
 */
interface ExtendedEip1193Provider extends Eip1193Provider {
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  on?: (event: string, callback: (data: unknown) => void) => void
  removeListener?: (event: string, callback: (data: unknown) => void) => void
  removeAllListeners?: (event: string) => void
  selectedAddress?: string | null
}

// Extend Window interface for Ethereum wallet
declare global {
  interface Window {
    ethereum?: ExtendedEip1193Provider
  }
}

export {}
