/**
 * WalletConnection Component
 *
 * Connect and manage external wallets (MetaMask, WalletConnect)
 * or create/manage embedded self-custodial wallets.
 */

import { useState, useCallback, useEffect } from 'react'
import { Wallet, type WalletType, type WalletState } from '@/services/wallet'
import { Button, Card, Badge, Modal } from '@/shared/components'

/**
 * WalletConnection props
 */
interface WalletConnectionProps {
  onConnected?: (address: string) => void
  onDisconnected?: () => void
}

/**
 * Chain info
 */
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  100: 'Gnosis Chain',
  137: 'Polygon',
  42161: 'Arbitrum One',
}

/**
 * Get chain name
 */
function getChainName(chainId: number | null): string {
  if (!chainId) return 'Unknown'
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`
}

/**
 * Truncate address for display
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * WalletConnection component
 */
export function WalletConnection({ onConnected, onDisconnected }: WalletConnectionProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [state, setState] = useState<WalletState>('disconnected')
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)

  // Try to reconnect on mount
  useEffect(() => {
    const reconnect = async () => {
      try {
        const existingWallet = await Wallet.reconnect()
        if (existingWallet) {
          setWallet(existingWallet)
          setState(existingWallet.state)
          setAddress(existingWallet.address)
          setChainId(existingWallet.chainId)

          // Get balance
          const bal = await existingWallet.getBalance()
          setBalance(bal)

          onConnected?.(existingWallet.address!)
        }
      } catch {
        // Ignore reconnection errors
      }
    }

    reconnect()
  }, [onConnected])

  // Connect wallet
  const handleConnect = useCallback(
    async (type: WalletType) => {
      setIsConnecting(true)
      setError(null)
      setShowTypeSelector(false)

      try {
        const newWallet = await Wallet.connect({ type })
        setWallet(newWallet)
        setState(newWallet.state)
        setAddress(newWallet.address)
        setChainId(newWallet.chainId)

        // Set up event listeners
        newWallet.on('accountChange', (newAddress) => {
          setAddress(newAddress)
          if (!newAddress) {
            handleDisconnect()
          }
        })

        newWallet.on('chainChange', (newChainId) => {
          setChainId(newChainId)
        })

        newWallet.on('disconnect', () => {
          handleDisconnect()
        })

        // Get balance
        const bal = await newWallet.getBalance()
        setBalance(bal)

        onConnected?.(newWallet.address!)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect wallet'
        setError(message)
      } finally {
        setIsConnecting(false)
      }
    },
    [onConnected]
  )

  // Disconnect wallet
  const handleDisconnect = useCallback(() => {
    if (wallet) {
      wallet.disconnect()
    }
    setWallet(null)
    setState('disconnected')
    setAddress(null)
    setChainId(null)
    setBalance(null)
    onDisconnected?.()
  }, [wallet, onDisconnected])

  // Show wallet type selector
  const handleConnectClick = useCallback(() => {
    setShowTypeSelector(true)
    setError(null)
  }, [])

  // Copy address
  const [copiedAddress, setCopiedAddress] = useState(false)
  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }, [address])

  // Export mnemonic (embedded wallet only)
  const handleExportMnemonic = useCallback(() => {
    if (wallet && wallet.type === 'embedded') {
      try {
        const phrase = wallet.exportMnemonic()
        setMnemonic(phrase)
        setShowMnemonic(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export mnemonic'
        setError(message)
      }
    }
  }, [wallet])

  // Close mnemonic modal
  const handleCloseMnemonic = useCallback(() => {
    setShowMnemonic(false)
    setMnemonic(null)
  }, [])

  // Check wallet availability
  const externalAvailable = Wallet.isAvailable('external')
  const embeddedAvailable = Wallet.isAvailable('embedded')
  const hasEmbedded = Wallet.hasEmbeddedWallet()

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Wallet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect a wallet for ENS operations and transactions
            </p>
          </div>
          {state === 'connected' && (
            <Badge variant="success">Connected</Badge>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Connected state */}
        {state === 'connected' && address && (
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  {wallet?.type === 'embedded' ? (
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-gray-700 dark:text-gray-300">
                      {truncateAddress(address)}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {copiedAddress ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" size="sm">
                      {wallet?.type === 'embedded' ? 'Embedded' : 'External'}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getChainName(chainId)}
                    </span>
                  </div>
                </div>
              </div>
              {balance && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {parseFloat(balance).toFixed(4)} ETH
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {wallet?.type === 'embedded' && (
                <Button variant="secondary" size="sm" onClick={handleExportMnemonic}>
                  Export Backup
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Disconnected state */}
        {state === 'disconnected' && (
          <div className="text-center py-4">
            <Button onClick={handleConnectClick} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        )}

        {/* Connecting state */}
        {state === 'connecting' && (
          <div className="flex items-center justify-center py-8">
            <svg
              className="w-8 h-8 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </Card>

      {/* Wallet type selector modal */}
      <Modal
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        title="Connect Wallet"
      >
        <div className="space-y-3">
          {/* External wallet */}
          {externalAvailable && (
            <button
              onClick={() => handleConnect('external')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  External Wallet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  MetaMask, WalletConnect, and more
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Embedded wallet */}
          {embeddedAvailable && (
            <button
              onClick={() => handleConnect('embedded')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {hasEmbedded ? 'Embedded Wallet' : 'Create Wallet'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hasEmbedded
                    ? 'Use your existing self-custodial wallet'
                    : 'Create a new self-custodial wallet'}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* No wallets available */}
          {!externalAvailable && !embeddedAvailable && (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No wallet options available. Please install MetaMask or another Web3 wallet.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Mnemonic export modal */}
      <Modal
        isOpen={showMnemonic}
        onClose={handleCloseMnemonic}
        title="Backup Phrase"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Keep this phrase safe and private
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Anyone with this phrase can access your wallet. Never share it.
                </p>
              </div>
            </div>
          </div>

          {mnemonic && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-words">
                {mnemonic}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCloseMnemonic}>Done</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default WalletConnection
