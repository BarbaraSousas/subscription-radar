import { InputHTMLAttributes, forwardRef } from 'react'
import { Search } from 'lucide-react'
import clsx from 'clsx'

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, placeholder = 'Search...', onClear, value, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          className={clsx(
            'w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
