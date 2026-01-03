/**
 * App Component
 *
 * Main application with routing and providers.
 */

import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import { ErrorBoundary, PageLoading } from './components'

// Lazy-loaded feature pages
const ASelectFile = lazy(() =>
  import('@/features/upload/components/ASelectFile').then((m) => ({ default: m.ASelectFile }))
)
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
          <Route
            index
            element={
              <Suspense fallback={<PageLoading />}>
                <ASelectFile />
              </Suspense>
            }
          />

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
