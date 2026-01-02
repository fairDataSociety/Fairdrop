/**
 * Card Component
 *
 * Content container with optional header and footer.
 * Uses Tailwind CSS for styling.
 */

import { type ReactNode, type HTMLAttributes } from 'react'

/**
 * Card props
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hoverable?: boolean
}

/**
 * Card header props
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
}

/**
 * Card body props
 */
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Card footer props
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
}

/**
 * Padding styles
 */
const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/**
 * Shadow styles
 */
const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

/**
 * Rounded styles
 */
const roundedStyles = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
}

/**
 * Card component
 */
export function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  border = true,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'bg-white dark:bg-gray-800',
    paddingStyles[padding],
    shadowStyles[shadow],
    roundedStyles[rounded],
    border ? 'border border-gray-200 dark:border-gray-700' : '',
    hoverable ? 'transition-shadow hover:shadow-md cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

/**
 * Card header component
 */
export function CardHeader({
  children,
  title,
  subtitle,
  action,
  className = '',
  ...props
}: CardHeaderProps) {
  const classes = [
    'flex items-start justify-between mb-4',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // If title is provided, render structured header
  if (title) {
    return (
      <div className={classes} {...props}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )
  }

  // Otherwise render children directly
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

/**
 * Card body component
 */
export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

/**
 * Card footer component
 */
export function CardFooter({
  children,
  justify = 'end',
  className = '',
  ...props
}: CardFooterProps) {
  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }

  const classes = [
    'flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
    justifyStyles[justify],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card
