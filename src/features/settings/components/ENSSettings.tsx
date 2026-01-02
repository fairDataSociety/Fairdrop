/**
 * ENSSettings Component
 *
 * Manage ENS domain settings including public key and inbox parameters.
 */

import { useState, useCallback, useEffect } from 'react'
import { useAccount } from '@/features/account/hooks/useAccount'
import {
  ENS_DOMAIN,
  getFairdropPublicKey,
  getInboxParams,
  setInboxParams,
  migrateToCustomDomain,
  isENSName,
} from '@/services/ens'
import { Button, Card, Input, Badge } from '@/shared/components'
import type { InboxParams } from '@/shared/types'

/**
 * ENS record status
 */
interface ENSStatus {
  hasPublicKey: boolean
  hasInboxParams: boolean
  publicKey: string | null
  inboxParams: InboxParams | null
}

/**
 * Format public key for display
 */
function formatPublicKey(key: string): string {
  if (key.length <= 20) return key
  return `${key.slice(0, 10)}...${key.slice(-8)}`
}

/**
 * ENSSettings component
 */
export function ENSSettings() {
  const { account, subdomain, publicKey } = useAccount()

  const [ensStatus, setEnsStatus] = useState<ENSStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Migration state
  const [showMigration, setShowMigration] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Inbox params state
  const [showInboxConfig, setShowInboxConfig] = useState(false)
  const [inboxOverlay, setInboxOverlay] = useState('')
  const [inboxId, setInboxId] = useState('')
  const [inboxProximity, setInboxProximity] = useState('16')
  const [isUpdatingInbox, setIsUpdatingInbox] = useState(false)

  // Get full ENS name
  const ensName = subdomain ? `${subdomain}.${ENS_DOMAIN}` : null

  // Load ENS status
  const loadENSStatus = useCallback(async () => {
    if (!ensName) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [publicKeyResult, inboxParamsResult] = await Promise.all([
        getFairdropPublicKey(ensName),
        getInboxParams(ensName),
      ])

      setEnsStatus({
        hasPublicKey: !!publicKeyResult,
        hasInboxParams: !!inboxParamsResult,
        publicKey: publicKeyResult,
        inboxParams: inboxParamsResult,
      })

      // Pre-fill inbox config form if params exist
      if (inboxParamsResult) {
        setInboxOverlay(inboxParamsResult.targetOverlay || '')
        setInboxId(inboxParamsResult.baseIdentifier || '')
        setInboxProximity(inboxParamsResult.proximity?.toString() || '16')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load ENS status'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [ensName])

  // Load on mount
  useEffect(() => {
    loadENSStatus()
  }, [loadENSStatus])

  // Handle migration
  const handleMigrate = useCallback(async () => {
    if (!customDomain || !subdomain) return

    // Validate domain format
    if (!isENSName(customDomain)) {
      setMigrationResult({
        success: false,
        message: 'Please enter a valid ENS domain (e.g., mydomain.eth)',
      })
      return
    }

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const result = await migrateToCustomDomain(customDomain, subdomain)

      if (result.success) {
        setMigrationResult({
          success: true,
          message: `Successfully migrated to ${result.newDomain}. You can now share ${customDomain} as your Fairdrop address.`,
        })
        setCustomDomain('')
      } else {
        setMigrationResult({
          success: false,
          message: result.error || 'Migration failed',
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Migration failed'
      setMigrationResult({
        success: false,
        message,
      })
    } finally {
      setIsMigrating(false)
    }
  }, [customDomain, subdomain])

  // Handle inbox params update
  const handleUpdateInboxParams = useCallback(async () => {
    if (!ensName) return

    setIsUpdatingInbox(true)
    setError(null)

    try {
      const params: Partial<InboxParams> = {
        proximity: parseInt(inboxProximity) || 16,
      }
      if (inboxOverlay) {
        params.targetOverlay = inboxOverlay
      }
      if (inboxId) {
        params.baseIdentifier = inboxId
      }

      const result = await setInboxParams(ensName, params)

      if (result.success) {
        await loadENSStatus()
        setShowInboxConfig(false)
      } else {
        setError(result.error || 'Failed to update inbox params')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update inbox params'
      setError(message)
    } finally {
      setIsUpdatingInbox(false)
    }
  }, [ensName, inboxOverlay, inboxId, inboxProximity, loadENSStatus])

  // No account state
  if (!account) {
    return (
      <Card padding="lg" className="text-center">
        <div className="py-8">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Account Active
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select or create an account to manage ENS settings.
          </p>
        </div>
      </Card>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-8">
          <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
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
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current ENS Info */}
      <Card padding="lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          ENS Domain
        </h3>

        <div className="space-y-4">
          {/* Domain name */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Fairdrop Address</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{ensName}</p>
            </div>
            <div className="flex items-center gap-2">
              {ensStatus?.hasPublicKey ? (
                <Badge variant="success" size="sm">
                  Configured
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Not Configured
                </Badge>
              )}
            </div>
          </div>

          {/* Public key status */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Public Key on ENS
            </label>
            {ensStatus?.publicKey ? (
              <div className="mt-1 flex items-center gap-2">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {formatPublicKey(ensStatus.publicKey)}
                </code>
                {ensStatus.publicKey === publicKey ? (
                  <Badge variant="success" size="sm">
                    Matches
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Mismatch
                  </Badge>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Not set - others cannot send you encrypted files via ENS lookup
              </p>
            )}
          </div>

          {/* Inbox params status */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                GSOC Inbox Parameters
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInboxConfig(!showInboxConfig)}
              >
                {showInboxConfig ? 'Cancel' : 'Configure'}
              </Button>
            </div>
            {ensStatus?.hasInboxParams ? (
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                <Badge variant="success" size="sm">
                  Configured
                </Badge>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  Proximity: {ensStatus.inboxParams?.proximity || 16}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Not set - real-time inbox notifications not enabled
              </p>
            )}
          </div>
        </div>

        {/* Inbox config form */}
        {showInboxConfig && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <label
                htmlFor="inbox-overlay"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Target Overlay
              </label>
              <Input
                id="inbox-overlay"
                value={inboxOverlay}
                onChange={(e) => setInboxOverlay(e.target.value)}
                placeholder="Bee node overlay address"
              />
            </div>

            <div>
              <label
                htmlFor="inbox-id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Base Identifier
              </label>
              <Input
                id="inbox-id"
                value={inboxId}
                onChange={(e) => setInboxId(e.target.value)}
                placeholder="Unique inbox identifier"
              />
            </div>

            <div>
              <label
                htmlFor="inbox-proximity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Proximity
              </label>
              <Input
                id="inbox-proximity"
                type="number"
                value={inboxProximity}
                onChange={(e) => setInboxProximity(e.target.value)}
                min="0"
                max="32"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lower = more specific, higher = broader reach (default: 16)
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowInboxConfig(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateInboxParams} disabled={isUpdatingInbox}>
                {isUpdatingInbox ? 'Updating...' : 'Update Inbox Params'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Migration to custom domain */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Custom Domain
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use your own ENS domain instead of {ENS_DOMAIN}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowMigration(!showMigration)}>
            {showMigration ? 'Cancel' : 'Migrate'}
          </Button>
        </div>

        {showMigration && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If you own an ENS domain, you can configure it to work with Fairdrop. Your public key
              and inbox settings will be copied to your custom domain.
            </p>

            <div>
              <label
                htmlFor="custom-domain"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Your ENS Domain
              </label>
              <Input
                id="custom-domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="mydomain.eth"
              />
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Requires wallet transaction
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You'll need to sign transactions to update ENS text records. Make sure you own
                    the domain you're migrating to.
                  </p>
                </div>
              </div>
            </div>

            {migrationResult && (
              <div
                className={`p-3 rounded-lg border ${
                  migrationResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <p
                  className={`text-sm ${
                    migrationResult.success
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {migrationResult.message}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowMigration(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={isMigrating || !customDomain.trim()}
              >
                {isMigrating ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    Migrating...
                  </>
                ) : (
                  'Migrate to Domain'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={loadENSStatus}>
          Refresh Status
        </Button>
      </div>
    </div>
  )
}

export default ENSSettings
