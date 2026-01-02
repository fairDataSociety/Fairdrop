/**
 * InboxNav Component
 *
 * Tab navigation for inbox sections (Received, Sent, Stored).
 */

import { useCallback } from 'react'
import { Badge } from '@/shared/components'
import type { MessageTab } from '../hooks/useInbox'

/**
 * Tab definition
 */
interface Tab {
  id: MessageTab
  label: string
  icon: string
}

/**
 * Available tabs
 */
const tabs: Tab[] = [
  { id: 'received', label: 'Received', icon: '📥' },
  { id: 'sent', label: 'Sent', icon: '📤' },
  { id: 'stored', label: 'Stored', icon: '📁' },
]

/**
 * InboxNav props
 */
interface InboxNavProps {
  activeTab: MessageTab
  onTabChange: (tab: MessageTab) => void
  counts?: {
    received: number
    sent: number
    stored: number
  }
  isLoading?: boolean
}

/**
 * InboxNav component
 */
export function InboxNav({
  activeTab,
  onTabChange,
  counts = { received: 0, sent: 0, stored: 0 },
  isLoading = false,
}: InboxNavProps) {
  const handleTabClick = useCallback(
    (tab: MessageTab) => {
      if (!isLoading) {
        onTabChange(tab)
      }
    },
    [onTabChange, isLoading]
  )

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count = counts[tab.id]

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={isLoading}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 -mb-px'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <Badge
                  variant={isActive ? 'info' : 'default'}
                  size="sm"
                >
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default InboxNav
