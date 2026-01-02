/**
 * Progress Component
 *
 * Progress bar for upload/download operations.
 * Uses Tailwind CSS for styling.
 */

import { type HTMLAttributes } from 'react'

/**
 * Progress bar props
 */
interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

/**
 * Size styles
 */
const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

/**
 * Variant styles for the progress bar
 */
const variantStyles = {
  default: 'bg-blue-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

/**
 * Progress component
 */
export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  className = '',
  ...props
}: ProgressProps) {
  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(0, value), max)
  const percentage = (clampedValue / max) * 100

  const containerClasses = [
    'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const barClasses = [
    sizeStyles[size],
    variantStyles[variant],
    'rounded-full',
    animated ? 'transition-all duration-300 ease-out' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={containerClasses}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div className={barClasses} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

/**
 * Circular progress props
 */
interface CircularProgressProps {
  value: number // 0-100
  size?: number // Size in pixels
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  className?: string
}

/**
 * Variant stroke colors
 */
const circularVariantStyles = {
  default: 'stroke-blue-600',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  error: 'stroke-red-500',
}

/**
 * Circular progress component
 */
export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  className = '',
}: CircularProgressProps) {
  const clampedValue = Math.min(Math.max(0, value), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${circularVariantStyles[variant]} transition-all duration-300 ease-out`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {showLabel && (
        <span className="absolute text-xs font-medium text-gray-700 dark:text-gray-300">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}

export default Progress
