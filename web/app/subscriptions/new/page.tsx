'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IntervalType, SubscriptionStatus } from '@/types'

// Validation schema
const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  vendor: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  interval: z.nativeEnum(IntervalType),
  custom_interval_days: z.number().optional(),
  next_renewal_date: z.string().min(1, 'Next renewal date is required'),
  last_paid_at: z.string().optional(),
  status: z.nativeEnum(SubscriptionStatus).default(SubscriptionStatus.ACTIVE),
  tags: z.string().optional(),
  notes: z.string().optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export default function NewSubscriptionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      currency: 'USD',
      interval: IntervalType.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      category: 'Other',
    },
  })

  const selectedInterval = watch('interval')

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the backend API to create subscription
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create subscription')
      }

      // Redirect to subscriptions list on success
      router.push('/subscriptions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add Subscription
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track a new recurring subscription
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-6"
      >
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <Input
            id="name"
            label="Subscription Name *"
            placeholder="e.g., Netflix, Spotify, GitHub Pro"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            id="vendor"
            label="Vendor (Optional)"
            placeholder="e.g., Netflix Inc., Spotify AB"
            error={errors.vendor?.message}
            {...register('vendor')}
          />

          <Select
            id="category"
            label="Category *"
            error={errors.category?.message}
            {...register('category')}
            options={[
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Software', label: 'Software' },
              { value: 'Cloud Storage', label: 'Cloud Storage' },
              { value: 'Fitness', label: 'Fitness' },
              { value: 'Education', label: 'Education' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pricing
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="amount"
              type="number"
              step="0.01"
              label="Amount *"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <Input
              id="currency"
              label="Currency"
              placeholder="USD"
              error={errors.currency?.message}
              {...register('currency')}
            />
          </div>

          <Select
            id="interval"
            label="Billing Interval *"
            error={errors.interval?.message}
            {...register('interval')}
            options={[
              { value: IntervalType.MONTHLY, label: 'Monthly' },
              { value: IntervalType.ANNUAL, label: 'Annual' },
              { value: IntervalType.CUSTOM, label: 'Custom' },
            ]}
          />

          {selectedInterval === IntervalType.CUSTOM && (
            <Input
              id="custom_interval_days"
              type="number"
              label="Custom Interval (Days)"
              placeholder="e.g., 90 for quarterly"
              error={errors.custom_interval_days?.message}
              {...register('custom_interval_days', { valueAsNumber: true })}
            />
          )}
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dates
          </h2>

          <Input
            id="next_renewal_date"
            type="date"
            label="Next Renewal Date *"
            error={errors.next_renewal_date?.message}
            {...register('next_renewal_date')}
          />

          <Input
            id="last_paid_at"
            type="date"
            label="Last Payment Date (Optional)"
            error={errors.last_paid_at?.message}
            {...register('last_paid_at')}
          />
        </div>

        {/* Status & Notes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Additional Information
          </h2>

          <Select
            id="status"
            label="Status"
            error={errors.status?.message}
            {...register('status')}
            options={[
              { value: SubscriptionStatus.ACTIVE, label: 'Active' },
              { value: SubscriptionStatus.PAUSED, label: 'Paused' },
              { value: SubscriptionStatus.CANCELLED, label: 'Cancelled' },
            ]}
          />

          <Input
            id="tags"
            label="Tags (Optional)"
            placeholder="e.g., work, personal, family"
            error={errors.tags?.message}
            {...register('tags')}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any additional notes about this subscription..."
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              {...register('notes')}
            />
            {errors.notes && (
              <span className="text-sm text-red-600 dark:text-red-400">
                {errors.notes.message}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Subscription'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
