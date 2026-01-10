import { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  variant?: 'default' | 'primary'
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg shadow-sm border p-6',
        {
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700': variant === 'default',
          'bg-indigo-600 dark:bg-indigo-700 border-indigo-600 dark:border-indigo-700 text-white':
            variant === 'primary',
        },
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className={clsx(
              'text-sm font-medium',
              variant === 'primary'
                ? 'text-indigo-100'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {title}
          </p>
          <p
            className={clsx(
              'mt-2 text-3xl font-bold',
              variant === 'primary' ? 'text-white' : 'text-gray-900 dark:text-white'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={clsx(
                'mt-1 text-sm',
                variant === 'primary'
                  ? 'text-indigo-200'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              'p-3 rounded-lg',
              variant === 'primary'
                ? 'bg-indigo-500 dark:bg-indigo-600'
                : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
