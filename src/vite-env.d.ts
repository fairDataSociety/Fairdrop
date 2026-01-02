/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BEE_URL: string
  readonly VITE_ENS_RPC: string
  readonly VITE_STAMP_ID: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
