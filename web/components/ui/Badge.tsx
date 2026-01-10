import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'danger'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center px-2 py-1 text-xs font-medium rounded',
          {
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': variant === 'default',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': variant === 'primary',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'warning',
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
