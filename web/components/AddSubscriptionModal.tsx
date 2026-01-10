'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { DatePicker } from './ui/DatePicker'
import { ColorPicker } from './ui/ColorPicker'
import { Button } from './ui/Button'
import { subscriptionsAPI } from '@/lib/api'
import { CATEGORIES } from '@/types'
import type { BillingCycle } from '@/types'

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required'),
  cost: z.number().positive('Cost must be positive'),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  category: z.string().min(1, 'Category is required'),
  next_renewal: z.string().min(1, 'Next renewal date is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddSubscriptionModal({ isOpen, onClose, onSuccess }: AddSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      cost: 0,
      billing_cycle: 'monthly',
      category: 'Entertainment',
      next_renewal: '',
      color: '#6366F1',
      website: '',
      description: '',
    },
  })

  const colorValue = watch('color')

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Send data with frontend field names (backend now accepts them)
      const subscriptionData = {
        name: data.name,
        cost: Number(data.cost),
        billing_cycle: data.billing_cycle,
        category: data.category,
        next_renewal: data.next_renewal,
        color: data.color,
        website: data.website || undefined,
        description: data.description || undefined,
      }

      console.log('[AddSubscription] Sending to backend:', subscriptionData)

      await subscriptionsAPI.create(subscriptionData)

      reset()
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('[AddSubscription] Error:', err)
      setError(err.response?.data?.detail || 'Failed to create subscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Subscription" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Input
          id="name"
          label="Subscription Name *"
          placeholder="e.g., Netflix, Spotify"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cost"
            label="Cost *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.cost?.message}
            {...register('cost', { valueAsNumber: true })}
          />

          <Select
            id="billing_cycle"
            label="Billing Cycle *"
            error={errors.billing_cycle?.message}
            {...register('billing_cycle')}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="category"
            label="Category *"
            error={errors.category?.message}
            {...register('category')}
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          />

          <DatePicker
            id="next_renewal"
            label="Next Renewal Date *"
            error={errors.next_renewal?.message}
            {...register('next_renewal')}
          />
        </div>

        <ColorPicker
          id="color"
          label="Color"
          value={colorValue}
          onChange={(color) => setValue('color', color)}
          error={errors.color?.message}
        />

        <Input
          id="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
          error={errors.website?.message}
          {...register('website')}
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Optional notes about this subscription"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...register('description')}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Add Subscription
          </Button>
        </div>
      </form>
    </Modal>
  )
}
