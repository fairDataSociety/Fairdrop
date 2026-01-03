/**
 * ASelectFile Component
 *
 * Full-viewport dropzone for file selection.
 * Matches original fairdrop.xyz 2020 design with three drop zones:
 * - Send encrypted
 * - Store encrypted
 * - Quick share (unencrypted)
 *
 * Uses dropzone library for drag-drop handling.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropzone from 'dropzone'
import { useUploadStore } from '../stores/uploadStore'
import type { UploadMode } from '@/shared/types'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/shared/utils/format'

// Disable Dropzone auto-discovery
Dropzone.autoDiscover = false

// Animation delay before navigation (allows CSS transition to complete)
const NAVIGATION_DELAY_MS = 555

/**
 * ASelectFile component props
 */
interface ASelectFileProps {
  onFileSelected?: () => void
}

/**
 * ASelectFile component
 */
export function ASelectFile({ onFileSelected }: ASelectFileProps) {
  const navigate = useNavigate()
  const setFile = useUploadStore((s) => s.setFile)
  const setFiles = useUploadStore((s) => s.setFiles)
  const setMode = useUploadStore((s) => s.setMode)

  // Refs for dropzone elements
  const dtSelectSaveFile = useRef<HTMLDivElement>(null)
  const dtSelectStoreFile = useRef<HTMLDivElement>(null)
  const dtSelectQuickFile = useRef<HTMLDivElement>(null)

  // State
  const [isSelecting, setIsSelecting] = useState(false)
  const [hasDropped, setHasDropped] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Track timeouts for drag leave detection
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle file selection and navigation
  const handleFilesSelected = useCallback(
    (files: File[], mode: UploadMode) => {
      // Clear any pending timeouts
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }

      setHasDropped(true)
      setIsSelecting(false)

      // Set files in store
      if (files.length === 1 && files[0]) {
        setFile(files[0])
      } else {
        setFiles(files)
      }

      // Set mode
      setMode(mode)

      // Notify parent
      onFileSelected?.()

      // Navigate after animation
      setTimeout(() => {
        if (mode === 'quick') {
          // Quick share goes straight to upload confirmation
          navigate('/upload?mode=quick&step=confirm')
        } else if (mode === 'store') {
          // Store needs account selection if not logged in
          navigate('/upload?mode=store&step=confirm')
        } else {
          // Send encrypted needs recipient
          navigate('/upload?mode=send&step=recipient')
        }
      }, NAVIGATION_DELAY_MS)
    },
    [setFile, setFiles, setMode, navigate, onFileSelected]
  )

  // Handle drag state changes
  const handleDragOver = useCallback(() => {
    setIsSelecting(true)

    // Clear previous timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }

    // Set timeout to detect drag leave
    dragTimeoutRef.current = setTimeout(() => {
      setIsSelecting(false)
    }, 100)
  }, [])

  // Initialize Dropzone instances
  useEffect(() => {
    const dropzones: Dropzone[] = []

    // Initialize a dropzone on an element
    const initDropzone = (
      element: HTMLDivElement | null,
      mode: UploadMode,
      multiple: boolean
    ) => {
      if (!element) return

      const dz = new Dropzone(element, {
        url: 'dummy://', // Dropzone requires URL even though we don't use it
        autoProcessQueue: false,
        previewsContainer: false,
        maxFilesize: MAX_FILE_SIZE_MB, // MB
        uploadMultiple: multiple,
        clickable: true,
        init: function (this: Dropzone) {
          if (multiple && this.hiddenFileInput) {
            this.hiddenFileInput.setAttribute('webkitdirectory', 'true')
          }
        },
      })

      // Handle drag events
      dz.on('dragenter', () => {
        handleDragOver()
      })

      dz.on('dragover', () => {
        handleDragOver()
      })

      dz.on('dragleave', () => {
        // Let the timeout handle this
      })

      // Handle file selection
      dz.on('addedfile', (file: Dropzone.DropzoneFile) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`)
          // Clear error after 5 seconds
          setTimeout(() => setErrorMessage(null), 5000)
          dz.removeFile(file)
          return
        }

        // Clear any previous error
        setErrorMessage(null)

        // Get all files from this dropzone
        const files = dz.files.map((f: Dropzone.DropzoneFile) => f as unknown as File)
        handleFilesSelected(files, mode)
      })

      dropzones.push(dz)
    }

    // Initialize all three dropzones
    initDropzone(dtSelectSaveFile.current, 'send', false)
    initDropzone(dtSelectStoreFile.current, 'store', false)
    initDropzone(dtSelectQuickFile.current, 'quick', true)

    // Cleanup
    return () => {
      dropzones.forEach((dz) => dz.destroy())
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [handleDragOver, handleFilesSelected])

  // Handle click on "select" link
  const handleSelectClick = useCallback(() => {
    // Click the send encrypted dropzone
    dtSelectSaveFile.current?.click()
  }, [])

  // Handle mobile button clicks
  const handleQuickClick = useCallback(() => {
    dtSelectQuickFile.current?.click()
  }, [])

  const handleSendClick = useCallback(() => {
    dtSelectSaveFile.current?.click()
  }, [])

  const handleStoreClick = useCallback(() => {
    dtSelectStoreFile.current?.click()
  }, [])

  // Build class names
  const selectFileClasses = [
    'select-file',
    hasDropped ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const mainClasses = [
    'select-file-main',
    'hide-mobile',
    'drop',
    isSelecting ? 'is-selecting' : '',
    hasDropped ? 'has-dropped' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const instructionClasses = [
    'select-file-instruction',
    isSelecting ? 'is-selecting' : '',
    hasDropped ? 'has-dropped' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div id="select-file" className={selectFileClasses}>
      {/* Main dropzone overlay - shows on drag */}
      <div className={mainClasses}>
        {/* Store zone - hidden in original design, but functional for clicks */}
        <div
          ref={dtSelectStoreFile}
          className="select-file-store no-events-mobile"
          style={{ display: 'none' }}
        >
          <div className="select-file-drop-inner">
            <h2>Store encrypted</h2>
            <div>Requires logging in to your mailbox</div>
          </div>
        </div>

        {/* Send encrypted zone */}
        <div ref={dtSelectSaveFile} className="select-file-send">
          <div className="select-file-drop-inner">
            <h2>Send encrypted</h2>
            <div>Requires logging in to your mailbox</div>
          </div>
        </div>

        {/* Quick share zone */}
        <div ref={dtSelectQuickFile} className="select-file-quick">
          <div className="select-file-drop-inner">
            <h2>Send in a quick way</h2>
            <div>Send a file or folder unencrypted - no mailboxes required</div>
          </div>
        </div>
      </div>

      {/* Centered instruction overlay */}
      <div className={instructionClasses}>
        <div className="select-file-instruction-inner">
          <h2>An easy and secure way to send your files.</h2>
          <h2 className="last">
            <span className="avoid-wrap">No central server.&nbsp;</span>
            <span className="avoid-wrap">No tracking.&nbsp;</span>
            <span className="avoid-wrap">No backdoors.&nbsp;</span>
          </h2>

          {/* Desktop: select/drop text */}
          <h3 className="hide-mobile">
            <img
              alt="click to select a file"
              src="/assets/images/fairdrop-select.svg"
            />{' '}
            <span className="select-file-action" onClick={handleSelectClick}>
              select
            </span>{' '}
            or{' '}
            <img
              alt="drop file glyph"
              src="/assets/images/fairdrop-drop.svg"
            />{' '}
            drop a file
          </h3>

          {/* Mobile: three buttons */}
          <h3 className="show-mobile">
            <button
              className="btn btn-white btn-lg send-file-unencrypted"
              onClick={handleQuickClick}
            >
              Quick Share
            </button>
            <br />
            <button
              className="btn btn-white btn-lg send-file-encrypted"
              onClick={handleSendClick}
            >
              Send Encrypted
            </button>
            <br />
            <button
              className="btn btn-white btn-lg store-file-encrypted"
              onClick={handleStoreClick}
            >
              Store File
            </button>
          </h3>

          {/* Error message */}
          {errorMessage && (
            <div className="error-toast" style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              fontWeight: 500,
            }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ASelectFile
