/**
 * SettingsPage Component
 *
 * Main settings page with tabs for different settings sections.
 */

import { useState, useCallback } from 'react'
import { StampManager } from './StampManager'
import { WalletConnection } from './WalletConnection'
import { ENSSettings } from './ENSSettings'
import { AccountSettings } from '@/features/account/components/AccountSettings'

/**
 * Settings tab type
 */
type SettingsTab = 'account' | 'stamps' | 'wallet' | 'ens'

/**
 * Tab config
 */
interface TabConfig {
  id: SettingsTab
  label: string
  icon: React.ReactNode
}

/**
 * Settings tabs
 */
const TABS: TabConfig[] = [
  {
    id: 'account',
    label: 'Account',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: 'stamps',
    label: 'Stamps',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
        />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    id: 'ens',
    label: 'ENS',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
]

/**
 * SettingsPage component
 */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  // Handle account lock
  const handleAccountLock = useCallback(() => {
    // Account was locked, stay on settings
  }, [])

  // Handle account delete
  const handleAccountDelete = useCallback(() => {
    // Account was deleted, stay on settings
  }, [])

  // Handle wallet connected
  const handleWalletConnected = useCallback((address: string) => {
    console.log('Wallet connected:', address)
  }, [])

  // Handle wallet disconnected
  const handleWalletDisconnected = useCallback(() => {
    console.log('Wallet disconnected')
  }, [])

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account, stamps, wallet, and ENS settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Tab navigation */}
          <nav className="md:w-48 flex-shrink-0">
            <ul className="flex md:flex-col gap-1">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={
                        activeTab === tab.id ? 'text-[#F97068]' : 'text-gray-400'
                      }
                    >
                      {tab.icon}
                    </span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'account' && (
              <AccountSettings onLock={handleAccountLock} onDelete={handleAccountDelete} />
            )}

            {activeTab === 'stamps' && <StampManager />}

            {activeTab === 'wallet' && (
              <WalletConnection
                onConnected={handleWalletConnected}
                onDisconnected={handleWalletDisconnected}
              />
            )}

            {activeTab === 'ens' && <ENSSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
