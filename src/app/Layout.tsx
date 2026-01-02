/**
 * Layout Component
 *
 * Main application layout with header, navigation, and footer.
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { AccountSelector, UnlockModal, CreateAccountModal } from '@/features/account/components'
import { useAccount } from '@/features/account/hooks/useAccount'
import { useTheme } from './providers'

/**
 * Navigation items
 */
const navigation = [
  { name: 'Upload', href: '/upload' },
  { name: 'Inbox', href: '/inbox', requiresAuth: true },
  { name: 'Honest Inbox', href: '/honest/inbox' },
  { name: 'Settings', href: '/settings' },
]

/**
 * Theme toggle button
 */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}

/**
 * Mobile menu button
 */
function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  )
}

/**
 * Layout component
 */
export function Layout() {
  const location = useLocation()
  const { isUnlocked } = useAccount()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAccountToUnlock, setSelectedAccountToUnlock] = useState<string | null>(null)

  // Handle unlock account from selector
  const handleUnlockAccount = useCallback((selectedSubdomain: string) => {
    setSelectedAccountToUnlock(selectedSubdomain)
    setShowUnlockModal(true)
  }, [])

  // Handle create new account
  const handleCreateAccount = useCallback(() => {
    setShowCreateModal(true)
  }, [])

  // Close mobile menu on navigation
  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600">Fairdrop</span>
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                v2
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const isDisabled = item.requiresAuth && !isUnlocked
                return (
                  <Link
                    key={item.name}
                    to={isDisabled ? '#' : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                        setShowUnlockModal(true)
                      }
                    }}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : isDisabled
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Account selector */}
              <div className="hidden sm:block">
                <AccountSelector
                  onUnlockAccount={handleUnlockAccount}
                  onCreateAccount={handleCreateAccount}
                />
              </div>

              {/* Mobile menu button */}
              <MobileMenuButton
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const isDisabled = item.requiresAuth && !isUnlocked
                return (
                  <Link
                    key={item.name}
                    to={isDisabled ? '#' : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                        setShowUnlockModal(true)
                      }
                      handleNavClick()
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : isDisabled
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}

              {/* Mobile account selector */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <AccountSelector
                  onUnlockAccount={handleUnlockAccount}
                  onCreateAccount={handleCreateAccount}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Built on Swarm - the decentralized storage network</p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/fairDataSociety/Fairdrop"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://fairdatasociety.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Fair Data Society
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Unlock Modal */}
      {selectedAccountToUnlock && (
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => {
            setShowUnlockModal(false)
            setSelectedAccountToUnlock(null)
          }}
          subdomain={selectedAccountToUnlock}
          onUnlocked={() => {
            setShowUnlockModal(false)
            setSelectedAccountToUnlock(null)
          }}
        />
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setShowCreateModal(false)}
      />
    </div>
  )
}

export default Layout
