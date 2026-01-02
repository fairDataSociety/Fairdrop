import { Outlet, Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Upload', href: '/upload' },
  { name: 'Inbox', href: '/inbox' },
  { name: 'Honest Inbox', href: '/honest/inbox' },
  { name: 'Settings', href: '/settings' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600">Fairdrop</span>
              <span className="text-xs px-2 py-0.5 bg-accent-100 text-accent-700 rounded-full font-medium">
                v2
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-dark-500 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Account button placeholder */}
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              Connect
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-dark-500">
            <p>Built on Swarm - the decentralized storage network</p>
            <p>
              <a
                href="https://github.com/fairDataSociety/Fairdrop"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
