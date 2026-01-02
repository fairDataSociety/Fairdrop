/**
 * RecipientInput Component
 *
 * Recipient input with ENS resolution and validation.
 */

import { useCallback, useEffect } from 'react'
import { Input, Button, Badge } from '@/shared/components'

/**
 * Resolved recipient info
 */
interface ResolvedRecipient {
  displayName: string
  publicKey: string
}

/**
 * RecipientInput props
 */
interface RecipientInputProps {
  value: string
  onChange: (value: string) => void
  onResolve: () => Promise<void>
  resolvedRecipient: ResolvedRecipient | null
  isResolving: boolean
  error: string | null
  onContinue: () => void
  onBack: () => void
  onSkip?: () => void
}

/**
 * Truncate public key for display
 */
function truncateKey(key: string): string {
  if (key.length <= 16) return key
  return `${key.slice(0, 8)}...${key.slice(-6)}`
}

/**
 * RecipientInput component
 */
export function RecipientInput({
  value,
  onChange,
  onResolve,
  resolvedRecipient,
  isResolving,
  error,
  onContinue,
  onBack,
  onSkip,
}: RecipientInputProps) {
  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (value.trim() && !resolvedRecipient) {
        await onResolve()
      } else if (resolvedRecipient) {
        onContinue()
      }
    },
    [value, resolvedRecipient, onResolve, onContinue]
  )

  // Auto-resolve on Enter in input
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && value.trim() && !isResolving) {
        e.preventDefault()
        await onResolve()
      }
    },
    [value, isResolving, onResolve]
  )

  // Clear resolved when input changes
  useEffect(() => {
    // This is handled by the store when setRecipientInput is called
  }, [value])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Who should receive this file?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter an ENS name or public key
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Recipient"
            placeholder="alice.fairdrop.eth or 0x04..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isResolving}
            {...(error ? { error } : {})}
            rightIcon={
              isResolving ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
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
              ) : resolvedRecipient ? (
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : undefined
            }
          />
        </div>

        {/* Resolved recipient info */}
        {resolvedRecipient && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {resolvedRecipient.displayName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {truncateKey(resolvedRecipient.publicKey)}
                </p>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>

          <div className="flex gap-3">
            {onSkip && (
              <Button variant="secondary" onClick={onSkip}>
                Skip (Quick Share)
              </Button>
            )}
            <Button
              type="submit"
              disabled={!value.trim() || isResolving}
              isLoading={isResolving}
            >
              {resolvedRecipient ? 'Continue' : 'Lookup'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default RecipientInput
