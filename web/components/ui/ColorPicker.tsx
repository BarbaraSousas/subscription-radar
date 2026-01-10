'use client'

import { useState, forwardRef } from 'react'
import clsx from 'clsx'
import { Input } from './Input'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  error?: string
  id?: string
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ value, onChange, label, error, id }, ref) => {
    const [hexInput, setHexInput] = useState(value)

    const handleColorChange = (newColor: string) => {
      setHexInput(newColor)
      onChange(newColor)
    }

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setHexInput(newValue)
      if (/^#[0-9A-F]{6}$/i.test(newValue)) {
        onChange(newValue)
      }
    }

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
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              ref={ref}
              type="color"
              value={value}
              onChange={(e) => handleColorChange(e.target.value)}
              className={clsx(
                'h-10 w-16 rounded cursor-pointer border-2',
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              )}
            />
          </div>
          <Input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="#000000"
            maxLength={7}
            className="flex-1"
            error={error}
          />
        </div>
      </div>
    )
  }
)

ColorPicker.displayName = 'ColorPicker'
