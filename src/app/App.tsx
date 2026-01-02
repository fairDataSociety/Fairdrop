import { Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'

// Placeholder pages - will be replaced with actual feature components
function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">Fairdrop v2</h1>
      <p className="text-lg text-dark-500 mb-8">
        Secure file sharing on Swarm - encrypted, decentralized, censorship-resistant.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Upload File
        </button>
        <button className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
          My Inbox
        </button>
      </div>
    </div>
  )
}

function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload File</h2>
      <div className="border-2 border-dashed border-dark-300 rounded-xl p-12 text-center hover:border-primary-400 transition-colors cursor-pointer">
        <p className="text-dark-500">Drop a file here or click to upload</p>
      </div>
    </div>
  )
}

function DownloadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Download File</h2>
      <p className="text-dark-500">Enter a Swarm reference to download a file.</p>
    </div>
  )
}

function InboxPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Inbox</h2>
      <p className="text-dark-500">Your received, sent, and stored files will appear here.</p>
    </div>
  )
}

function HonestInboxPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Honest Inbox</h2>
      <p className="text-dark-500">
        Create an anonymous inbox to receive files without revealing your identity.
      </p>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <p className="text-dark-500">Manage your account, stamps, and wallet connections.</p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-dark-300 mb-4">404</h1>
      <p className="text-lg text-dark-500">Page not found</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="download/:reference?" element={<DownloadPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="honest/inbox" element={<HonestInboxPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
