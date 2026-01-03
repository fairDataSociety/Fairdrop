/**
 * Layout Component
 *
 * Main application layout using original fairdrop.xyz CSS classes.
 * Uses .red for coral backgrounds, .white for white backgrounds.
 * Settings is a dark slide-out panel (no route).
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useCallback, lazy, Suspense } from 'react'
import { UnlockModal, CreateAccountModal } from '@/features/account/components'
import { useAccount } from '@/features/account/hooks/useAccount'
import { FairdropLogo } from '@/shared/components'

// Lazy load settings panel
const SettingsPanel = lazy(() =>
  import('@/features/settings/components/SettingsPanel').then((m) => ({ default: m.SettingsPanel }))
)


/**
 * Layout component using original CSS classes
 */
export function Layout() {
  const location = useLocation()
  const { isUnlocked, account, lock } = useAccount()

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAccountToUnlock, setSelectedAccountToUnlock] = useState<string | null>(null)

  // Determine theme based on route - mailbox uses white, others use red
  const isWhiteTheme = location.pathname.startsWith('/mailbox')

  // Handle settings click (opens slide-out panel)
  const handleSettingsClick = useCallback(() => {
    setMenuOpen(false)
    setSettingsOpen(true)
  }, [])

  // Handle menu toggle
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev)
  }, [])

  // Close menu when clicking background
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  // Build parent wrapper classes
  const parentClasses = [
    'parent-wrapper',
    isWhiteTheme ? 'nav-black white' : 'nav-white red'
  ].filter(Boolean).join(' ')

  return (
    <div className={parentClasses}>
      {/* Slide-out menu with hamburger toggle */}
      <div className={`menu-wrapper ${menuOpen ? 'menuShown' : ''}`}>
        {/* Hamburger toggle - positioned absolutely over nav-header-spacer */}
        <div className="menu-toggle" onClick={toggleMenu}>
          <button className={`hamburger hamburger--spin ${menuOpen ? 'is-active' : ''}`} type="button">
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </div>
        <div className="menu-background-screen" onClick={closeMenu}></div>
        <div className={`menu ${menuOpen ? 'show' : ''}`}>
          <div className="menu-header">
            <img alt="fairdrop logo" src="/assets/images/fairdrop-logo.svg" />
          </div>
          <div className="menu-main">
            {/* Login section */}
            {!isUnlocked && (
              <div className="menu-section">
                <div
                  className="menu-item-header"
                  onClick={() => {
                    closeMenu()
                    window.location.href = '/mailbox'
                  }}
                >
                  Login &gt;
                </div>
              </div>
            )}
            {isUnlocked && account && (
              <div className="menu-section">
                <div
                  className="menu-item-header logged-in"
                  onClick={handleSettingsClick}
                >
                  {account.subdomain}
                </div>
              </div>
            )}

            {/* Upload section */}
            <div className="menu-section">
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/upload?mode=store'
                }}
              >
                Store &gt;
              </div>
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/upload?mode=send'
                }}
              >
                Send &gt;
              </div>
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/upload?mode=quick'
                }}
              >
                Quick (Unencrypted) &gt;
              </div>
            </div>

            {/* My Files section */}
            <div className="menu-section">
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/mailbox/received'
                }}
              >
                Received Files &gt;
              </div>
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/mailbox/sent'
                }}
              >
                Sent Files &gt;
              </div>
              <div
                className="menu-item-header"
                onClick={() => {
                  closeMenu()
                  window.location.href = '/mailbox/stored'
                }}
              >
                Stored Files &gt;
              </div>
            </div>

            {/* Settings section */}
            <div className="menu-section">
              <div className="menu-item-header" onClick={handleSettingsClick}>
                Settings &gt;
              </div>
            </div>

            {/* About section */}
            <div className="menu-section">
              <a
                href="https://fairdatasociety.org"
                target="_blank"
                rel="noopener noreferrer"
                className="menu-item-header"
              >
                About Fair Data Society &gt;
              </a>
            </div>

            {/* Logout */}
            {isUnlocked && account && (
              <div className="menu-section">
                <div
                  className="menu-item-header"
                  onClick={() => {
                    lock()
                    closeMenu()
                  }}
                >
                  Log Out
                </div>
              </div>
            )}
          </div>

          {/* Footer links */}
          <div className="menu-footer">
            <div className="menu-footer-item">
              <a href="https://github.com/fairDataSociety" target="_blank" rel="noopener noreferrer">
                <img alt="github logo" src="/assets/images/github-logo.svg" />
              </a>
            </div>
            <div className="menu-footer-item">
              <a href="https://twitter.com/DataFundProject" target="_blank" rel="noopener noreferrer">
                <img alt="twitter logo" src="/assets/images/twitter-logo.svg" />
              </a>
            </div>
            <div className="menu-footer-item">
              <a href="https://datafund.io" target="_blank" rel="noopener noreferrer">
                <img alt="datafund logo" src="/assets/images/datafund-footer-logo.svg" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main wrapper */}
      <div className={`wrapper ${isWhiteTheme ? 'nav-black white' : 'nav-white red'} nav-enabled`}>
        {/* Navigation header */}
        <div className="nav-header">
          <div className="nav-header-item-left">
            <div className="nav-header-spacer"></div>
          </div>
          <div className="nav-header-item-left">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FairdropLogo />
            </Link>
          </div>
          <div className="nav-header-item-left hide-mobile">
            <div className="version-number">2.0</div>
          </div>
          {!isUnlocked && (
            <div className="nav-header-item-right hide-mobile">
              <Link className="nav-header-item-button nav-header-sign-in" to="/mailbox">
                Log in / Register
              </Link>
            </div>
          )}
          {isUnlocked && account && (
            <>
              <div className="nav-header-item-right hide-mobile">
                <button className="nav-header-item-button nav-header-sign-out" onClick={() => lock()}>
                  Log out
                </button>
              </div>
              <div className="nav-header-item-right hide-mobile">
                <Link className="nav-context" to="/mailbox/received">
                  {account.subdomain}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Page content */}
        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>

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

      {/* Unlock Modal for protected routes */}
      <UnlockModal
        isOpen={showUnlockModal && !selectedAccountToUnlock}
        onClose={() => setShowUnlockModal(false)}
        subdomain=""
        onUnlocked={() => setShowUnlockModal(false)}
      />

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setShowCreateModal(false)}
      />

      {/* Settings Panel (slide-out overlay) */}
      {settingsOpen && (
        <Suspense fallback={<div className="settings-panel-loading">Loading...</div>}>
          <SettingsPanel
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Layout
