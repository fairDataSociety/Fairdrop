/**
 * Badge Component
 *
 * Status indicator badges.
 * Uses Tailwind CSS for styling.
 */

import { type HTMLAttributes, type ReactNode } from 'react'

/**
 * Badge variants
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

/**
 * Badge sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Badge props
 */
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
}

/**
 * Variant styles
 */
const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

/**
 * Dot styles
 */
const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

/**
 * Size styles
 */
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
}

/**
 * Badge component
 */
export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const classes = [
    'inline-flex items-center font-medium rounded-full',
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge
