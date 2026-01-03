/**
 * DropboxPage Component
 *
 * Anonymous file drop to a username via /:username route
 * Matches original fairdrop.xyz design with blue background (#5580D2)
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { resolveRecipient } from '@/services/ens'
import { useAnonymousSend } from '@/features/honest-inbox/hooks'
import { FileDropzone } from '@/shared/components'
import type { RecipientResolution } from '@/services/ens'

/**
 * DropboxPage component - matches original fairdrop.xyz/username design
 */
export function DropboxPage() {
  const { username } = useParams<{ username: string }>()
  const [resolution, setResolution] = useState<RecipientResolution | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Anonymous send hook
  const {
    send,
    isUploading,
    isEncrypting,
    progress,
    result,
    error: sendError,
    reset,
    setFile,
    setRecipientPublicKey,
  } = useAnonymousSend()

  // Resolve recipient on mount
  useEffect(() => {
    async function resolve() {
      if (!username) {
        setError('No username provided')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await resolveRecipient(username)

        if (result.publicKey) {
          setResolution(result)
        } else if (result.method === 'not-found') {
          setError(`User "${username}" not found`)
        } else if (result.method === 'fairdrop-no-key' || result.method === 'ens-no-key') {
          setError(`User "${username}" has no public key configured`)
        } else {
          setError(`Could not resolve "${username}"`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resolve recipient')
      } finally {
        setIsLoading(false)
      }
    }

    resolve()
  }, [username])

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!resolution?.publicKey || files.length === 0) return

      const file = files[0]
      if (!file) return
      setFile(file)
      setRecipientPublicKey(resolution.publicKey)
      await send()
    },
    [resolution, setFile, setRecipientPublicKey, send]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="dropbox" style={{ background: '#5580D2', minHeight: '100vh' }}>
        <div className="dropbox-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  // Error state - user not found
  if (error || !resolution?.publicKey) {
    return (
      <div className="dropbox" style={{ background: '#5580D2', minHeight: '100vh' }}>
        <div className="dropbox-center">
          <h2 className="last" style={{ color: 'white' }}>
            {error || 'User not found'}
          </h2>
          <div className="dropbox-feedback" style={{ marginTop: '20px' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'underline' }}>
              Go to homepage
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Success state - file sent
  if (result) {
    return (
      <div className="dropbox" style={{ background: '#5580D2', minHeight: '100vh' }}>
        <div className="dropbox-center">
          <h2 className="last" style={{ color: 'white' }}>
            File sent!
          </h2>
          <div className="dropbox-feedback" style={{ marginTop: '20px' }}>
            <button
              onClick={reset}
              style={{
                background: 'white',
                color: '#5580D2',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Send another file
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sending state
  if (isUploading || isEncrypting) {
    return (
      <div className="dropbox" style={{ background: '#5580D2', minHeight: '100vh' }}>
        <div className="dropbox-center">
          <h2 className="last" style={{ color: 'white' }}>
            Sending file to: {username}
          </h2>
          <div className="dropbox-feedback" style={{ marginTop: '20px', color: 'white' }}>
            <div style={{ marginBottom: '10px' }}>{progress || 'Encrypting...'}</div>
            <div
              style={{
                width: '200px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '50%',
                  height: '100%',
                  background: 'white',
                  borderRadius: '2px',
                  animation: 'pulse 1s infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main dropbox view - ready to receive file
  return (
    <div className="dropbox" style={{ background: '#5580D2', minHeight: '100vh' }}>
      <div className="dropbox-center">
        <h2 className="last" style={{ color: 'white' }}>
          Send a file anonymously to:
          <br />
          {username}
        </h2>
        <h3 className="hide-mobile" style={{ color: 'white', marginTop: '30px' }}>
          <img alt="click to select a file" src="/assets/images/fairdrop-select.svg" />{' '}
          <span
            className="select-file-action"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleFileSelect([file])
              }
              input.click()
            }}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            select
          </span>{' '}
          or <img alt="drop file glyph" src="/assets/images/fairdrop-drop.svg" /> drop a file
        </h3>

        {/* Hidden dropzone for drag-and-drop */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>
          <FileDropzone onFilesSelected={handleFileSelect} maxFiles={1} />
        </div>

        {/* Mobile buttons */}
        <div className="show-mobile" style={{ marginTop: '30px' }}>
          <button
            className="btn btn-white btn-lg"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleFileSelect([file])
              }
              input.click()
            }}
          >
            Select File
          </button>
        </div>

        {/* Error display */}
        {sendError && (
          <div className="dropbox-feedback" style={{ marginTop: '20px', color: '#ffcccc' }}>
            Error: {sendError}
          </div>
        )}
      </div>
    </div>
  )
}

export default DropboxPage
