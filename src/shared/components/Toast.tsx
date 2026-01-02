/**
 * Toast Component
 *
 * Notification toasts with auto-dismiss.
 * Uses Tailwind CSS for styling.
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Toast variants
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast position
 */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

/**
 * Toast data
 */
export interface ToastData {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Toast item props
 */
interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

/**
 * Toast container props
 */
interface ToastContainerProps {
  toasts: ToastData[]
  position?: ToastPosition
  onDismiss: (id: string) => void
}

/**
 * Variant styles
 */
const variantStyles: Record<ToastVariant, { bg: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    icon: (
      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
    icon: (
      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    icon: (
      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
}

/**
 * Position styles
 */
const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

/**
 * Toast item component
 */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, message, variant, duration = 5000, action } = toast
  const [isVisible, setIsVisible] = useState(false)

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Auto dismiss
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss(id), 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onDismiss])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onDismiss(id), 300)
  }, [id, onDismiss])

  const style = variantStyles[variant]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${style.bg} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0">{style.icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * Toast container component
 */
export function ToastContainer({
  toasts,
  position = 'top-right',
  onDismiss,
}: ToastContainerProps) {
  if (toasts.length === 0) return null

  const containerClasses = ['fixed z-50 flex flex-col gap-2 w-80', positionStyles[position]].join(
    ' '
  )

  return createPortal(
    <div className={containerClasses}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

/**
 * Toast hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', options?: Partial<ToastData>) => {
      const id = Math.random().toString(36).slice(2, 9)
      const toast: ToastData = {
        id,
        message,
        variant,
        ...options,
      }
      setToasts((prev) => [...prev, toast])
      return id
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback(
    (message: string, options?: Partial<ToastData>) => addToast(message, 'success', options),
    [addToast]
  )

  const error = useCallback(
    (message: string, options?: Partial<ToastData>) => addToast(message, 'error', options),
    [addToast]
  )

  const warning = useCallback(
    (message: string, options?: Partial<ToastData>) => addToast(message, 'warning', options),
    [addToast]
  )

  const info = useCallback(
    (message: string, options?: Partial<ToastData>) => addToast(message, 'info', options),
    [addToast]
  )

  return {
    toasts,
    addToast,
    dismissToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}

export default ToastContainer
