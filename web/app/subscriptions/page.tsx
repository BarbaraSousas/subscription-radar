'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Subscription, SubscriptionStatus } from '@/types'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Fetch subscriptions from the backend
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true)

        // Build query params
        const params = new URLSearchParams()
        if (statusFilter !== 'all') {
          params.set('status_filter', statusFilter)
        }
        if (categoryFilter !== 'all') {
          params.set('category', categoryFilter)
        }

        const url = `/api/subscriptions${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(url, {
          credentials: 'include', // Include cookies
        })

        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions')
        }

        const data = await response.json()
        setSubscriptions(data)
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptions()
  }, [statusFilter, categoryFilter])

  // Fetch all subscriptions once to get categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/subscriptions', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const categories = Array.from(
            new Set(data.map((sub: Subscription) => sub.category || 'Other'))
          )
          setAllCategories(categories as string[])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const statusBadgeColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Subscriptions
        </h1>
        <Link href="/subscriptions/new">
          <Button>Add Subscription</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            id="status-filter"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <Select
            id="category-filter"
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...allCategories.map((cat) => ({ value: cat, label: cat })),
            ]}
          />
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {isLoading
                ? 'Loading...'
                : statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No subscriptions match the selected filters.'
                : 'No subscriptions yet. Add your first one!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {subscription.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${statusBadgeColor(
                          subscription.status
                        )}`}
                      >
                        {subscription.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {subscription.vendor && `${subscription.vendor} • `}
                      {subscription.category}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Next renewal:{' '}
                      {format(new Date(subscription.next_renewal_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${subscription.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      / {subscription.interval}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
