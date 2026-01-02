/**
 * ProtectedRoute Component
 *
 * Route guard that requires an unlocked account.
 * Redirects to account selection if not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAccount } from '@/features/account/hooks/useAccount'

/**
 * ProtectedRoute props
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  requireUnlocked?: boolean
}

/**
 * ProtectedRoute component
 */
export function ProtectedRoute({
  children,
  requireUnlocked = true,
}: ProtectedRouteProps) {
  const { account, isUnlocked } = useAccount()
  const location = useLocation()

  // If we require an unlocked account but don't have one
  if (requireUnlocked && (!account || !isUnlocked)) {
    // Redirect to home with return URL
    return (
      <Navigate
        to="/"
        state={{ from: location.pathname, requiresAccount: true }}
        replace
      />
    )
  }

  return <>{children}</>
}

/**
 * PublicRoute Component
 *
 * Route that redirects to inbox if already authenticated.
 * Useful for login/signup pages.
 */
interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function PublicRoute({ children, redirectTo = '/inbox' }: PublicRouteProps) {
  const { account, isUnlocked } = useAccount()

  // If already authenticated, redirect
  if (account && isUnlocked) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
