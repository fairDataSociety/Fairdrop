/**
 * HonestInboxPage Component
 *
 * Landing page for sending files to a Honest Inbox.
 * Accessed via /honest/inbox?key=<publicKey>&name=<name>
 */

import { useMemo } from 'react'
import { AnonymousSendForm } from './AnonymousSendForm'
import { Card } from '@/shared/components'
import { parseHonestInboxLink } from '@/services/swarm'

/**
 * HonestInboxPage props
 */
interface HonestInboxPageProps {
  url?: string // The full URL to parse
  publicKey?: string // Or pass the public key directly
  recipientName?: string // Optional recipient name
}

/**
 * HonestInboxPage component
 */
export function HonestInboxPage({ url, publicKey, recipientName }: HonestInboxPageProps) {
  // Parse URL if provided
  const parsed = useMemo(() => {
    if (url) {
      return parseHonestInboxLink(url)
    }
    return null
  }, [url])

  // Use parsed values or props
  const finalPublicKey = publicKey || parsed?.publicKey
  const finalName = recipientName || parsed?.name

  // Invalid or missing public key
  if (!finalPublicKey) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Card padding="lg" className="text-center">
          <div className="py-8">
            <div className="text-5xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Invalid Inbox Link
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              This link is missing a valid public key. Please check the link and try again.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <AnonymousSendForm
        recipientPublicKey={finalPublicKey}
        {...(finalName ? { recipientName: finalName } : {})}
      />

      {/* Info section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xl">🔒</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              End-to-End Encrypted
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your file is encrypted before leaving your device. Only the recipient can decrypt it.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xl">🕵️</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Anonymous Sender
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your identity is not stored or transmitted. The recipient will only receive the
              encrypted file.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xl">🌐</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Decentralized Storage
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Files are stored on Swarm, a decentralized network. No central server can access
              your data.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Powered by{' '}
          <a
            href="https://fairdatasociety.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300"
          >
            Fair Data Society
          </a>{' '}
          &amp;{' '}
          <a
            href="https://ethswarm.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300"
          >
            Swarm
          </a>
        </p>
      </div>
    </div>
  )
}

export default HonestInboxPage
