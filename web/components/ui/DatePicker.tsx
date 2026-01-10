import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'
import { Calendar } from 'lucide-react'

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            id={id}
            className={clsx(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600',
              className
            )}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
