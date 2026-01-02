/**
 * App Component
 *
 * Main application with routing and providers.
 */

import { Suspense, lazy } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
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
const HonestInboxPage = lazy(() =>
  import('@/features/honest-inbox/components/HonestInboxPage').then((m) => ({
    default: m.HonestInboxPage,
  }))
)
const HonestInboxManager = lazy(() =>
  import('@/features/honest-inbox/components/HonestInboxManager').then((m) => ({
    default: m.HonestInboxManager,
  }))
)
const SettingsPage = lazy(() =>
  import('@/features/settings/components/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)

/**
 * Home page
 */
function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">Fairdrop v2</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
        Secure file sharing on Swarm - encrypted, decentralized, censorship-resistant.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/upload"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Upload File
        </a>
        <a
          href="/inbox"
          className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
        >
          My Inbox
        </a>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left max-w-4xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            End-to-End Encrypted
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Files are encrypted before upload. Only you and your recipient can decrypt them.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Decentralized Storage
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Built on Swarm, a censorship-resistant, unstoppable storage network.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ENS Identity
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Use your ENS name or get a free subdomain. Share your address easily.
          </p>
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
      <a
        href="/"
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  )
}

/**
 * Honest inbox route handler
 * Determines whether to show inbox page (with key param) or manager
 */
function HonestInboxRoute() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')

  if (key) {
    return (
      <Suspense fallback={<PageLoading />}>
        <HonestInboxPage />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <HonestInboxManager />
    </Suspense>
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

          <Route path="honest/inbox" element={<HonestInboxRoute />} />

          {/* Protected routes */}
          <Route
            path="inbox"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <InboxLayout />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoading />}>
                <SettingsPage />
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
