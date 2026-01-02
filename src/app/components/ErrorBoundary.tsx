/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child component tree and displays fallback UI.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button, Card } from '@/shared/components'

/**
 * ErrorBoundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * ErrorBoundary state
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Default error fallback UI
 */
function DefaultFallback({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry: () => void
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-lg w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          An unexpected error occurred. Please try again.
        </p>

        {error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto text-red-600 dark:text-red-400">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </Card>
    </div>
  )
}

/**
 * ErrorBoundary component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <DefaultFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
