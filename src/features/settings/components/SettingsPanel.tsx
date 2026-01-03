/**
 * SettingsPanel Component
 *
 * Dark slide-out overlay panel for settings.
 * Matches original fairdrop.xyz design.
 */

import { useEffect } from 'react'
import { useAccount } from '@/features/account/hooks/useAccount'

/**
 * SettingsPanel props
 */
interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * SettingsPanel component - dark slide-out overlay
 */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { account, isUnlocked } = useAccount()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="settings-panel-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Panel */}
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: '#1a1a1a',
          color: 'white',
          overflow: 'auto',
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #333',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              fontSize: '24px',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* ACCOUNT Section */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>
              ACCOUNT
            </h3>
            {isUnlocked && account ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#aaa' }}>Username</span>
                  <span>{account.subdomain}.fairdrop.eth</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#aaa' }}>Address</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(account.publicKey)
                    }}
                    style={{
                      background: '#37bd72',
                      border: 'none',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#888' }}>Not logged in</p>
            )}
          </section>

          {/* ENS IDENTITY Section */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>
              ENS IDENTITY <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' }}>Coming Soon</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Custom Domain</span>
                <span style={{ color: '#666' }}>yourname.eth</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Migrate Domain</span>
                <button
                  disabled
                  style={{
                    background: '#333',
                    border: '1px solid #444',
                    color: '#888',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'not-allowed',
                    fontSize: '12px',
                  }}
                >
                  Setup ENS
                </button>
              </div>
            </div>
          </section>

          {/* STORAGE Section */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>
              STORAGE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Provider</span>
                <span>Swarm Network</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Used Space</span>
                <span>0 B</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Postage Stamp</span>
                <span style={{ background: '#37bd72', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Free Tier</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Buy Stamp</span>
                <button
                  disabled
                  style={{
                    background: '#333',
                    border: '1px solid #444',
                    color: '#888',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'not-allowed',
                    fontSize: '12px',
                  }}
                >
                  Purchase via Beeport <span style={{ fontSize: '10px' }}>Soon</span>
                </button>
              </div>
            </div>
          </section>

          {/* WALLET Section */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>
              WALLET <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' }}>Coming Soon</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>External Wallet</span>
                <button
                  disabled
                  style={{
                    background: '#333',
                    border: '1px solid #444',
                    color: '#888',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'not-allowed',
                    fontSize: '12px',
                  }}
                >
                  Connect MetaMask
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Embedded Wallet</span>
                <button
                  disabled
                  style={{
                    background: '#333',
                    border: '1px solid #444',
                    color: '#888',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'not-allowed',
                    fontSize: '12px',
                  }}
                >
                  Setup Tether WDK
                </button>
              </div>
            </div>
          </section>

          {/* PREFERENCES Section */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '16px', letterSpacing: '1px' }}>
              PREFERENCES
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#aaa' }}>Analytics</span>
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Help improve Fairdrop</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    background: '#333',
                    borderRadius: '24px',
                    transition: '0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.2s',
                    }}
                  />
                </span>
              </label>
            </div>
          </section>

          {/* Footer */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Fairdrop v2.0</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="https://github.com/fairDataSociety/fairdrop" target="_blank" rel="noopener noreferrer" style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>
                GitHub
              </a>
              <a href="https://fairdatasociety.org" target="_blank" rel="noopener noreferrer" style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>
                Fair Data Society
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default SettingsPanel
