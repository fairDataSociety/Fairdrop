/**
 * App Component
 *
 * Main application with routing and providers.
 */

import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import { ErrorBoundary, ProtectedRoute, PageLoading } from './components'

// Lazy-loaded feature pages
const UploadWizard = lazy(() =>
  import('@/features/upload/components/UploadWizard').then((m) => ({ default: m.UploadWizard }))
)
const DownloadPage = lazy(() =>
  import('@/features/download/components/DownloadPage').then((m) => ({ default: m.DownloadPage }))
)
const InboxLayout = lazy(() =>
  import('@/features/inbox/components/InboxLayout').then((m) => ({ default: m.InboxLayout }))
)
const DropboxPage = lazy(() =>
  import('@/features/dropbox/components/DropboxPage').then((m) => ({ default: m.DropboxPage }))
)

/**
 * Home page - matches fairdrop.xyz design using original CSS classes
 */
function HomePage() {
  const handleSelectClick = () => {
    // Trigger file input
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Navigate to upload with file
        window.location.href = '/upload'
      }
    }
    input.click()
  }

  return (
    <div id="select-file" className="select-file">
      {/* Instructions overlay - uses original CSS class */}
      <div className="select-file-instruction">
        <div className="select-file-instruction-inner">
          <h2>
            An easy and secure way to send your files.
          </h2>
          <h2 className="last">
            <span className="avoid-wrap">No central server.&nbsp;</span>
            <span className="avoid-wrap">No tracking.&nbsp;</span>
            <span className="avoid-wrap">No backdoors.&nbsp;</span>
          </h2>
          <h3 className="hide-mobile">
            <img alt="click to select a file" src="/assets/images/fairdrop-select.svg"/> <span className="select-file-action" onClick={handleSelectClick}>select</span> or <img alt="drop file glyph" src="/assets/images/fairdrop-drop.svg"/> drop a file
          </h3>
          <h3 className="show-mobile">
            <button className="btn btn-white btn-lg send-file-unencrypted" onClick={() => window.location.href = '/upload?mode=quick'}>
              Quick Share
            </button>
            <br />
            <button className="btn btn-white btn-lg send-file-encrypted" onClick={handleSelectClick}>
              Send Encrypted
            </button>
            <br />
            <button className="btn btn-white btn-lg store-file-encrypted" onClick={() => window.location.href = '/upload?mode=store'}>
              Store File
            </button>
          </h3>
        </div>
      </div>
    </div>
  )
}

/**
 * 404 page
 */
function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-white/30 mb-4">404</h1>
      <p className="text-lg text-white/70 mb-6">Page not found</p>
      <a
        href="/"
        className="text-white underline underline-offset-4 hover:opacity-80 transition-opacity"
      >
        Go Home
      </a>
    </div>
  )
}


/**
 * App component
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />

          <Route
            path="upload"
            element={
              <Suspense fallback={<PageLoading />}>
                <UploadWizard />
              </Suspense>
            }
          />

          <Route
            path="download/:reference?"
            element={
              <Suspense fallback={<PageLoading />}>
                <DownloadPage />
              </Suspense>
            }
          />

          {/* Mailbox - shows account selector if not logged in */}
          <Route
            path="mailbox/:filter?"
            element={
              <Suspense fallback={<PageLoading />}>
                <InboxLayout />
              </Suspense>
            }
          />

          {/* Catch-all for /:username dropbox - must be LAST before 404 */}
          <Route
            path=":username"
            element={
              <Suspense fallback={<PageLoading />}>
                <DropboxPage />
              </Suspense>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
