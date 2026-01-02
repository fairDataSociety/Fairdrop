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

// Extend Window interface for Ethereum wallet
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
    }
  }
}

export {}
