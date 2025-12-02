'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Subscription, SubscriptionStatus } from '@/types'

// TODO: Replace with actual API call to /api/v1/subscriptions
const getMockSubscriptions = (): Subscription[] => {
  const today = new Date()

  return [
    {
      id: 1,
      name: 'Netflix',
      vendor: 'Netflix Inc.',
      category: 'Entertainment',
      amount: 15.99,
      currency: 'USD',
      interval: 'monthly' as const,
      next_renewal_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: '2024-01-01',
      status: 'active' as const,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Spotify',
      vendor: 'Spotify AB',
      category: 'Entertainment',
      amount: 9.99,
      currency: 'USD',
      interval: 'monthly' as const,
      next_renewal_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: '2024-01-01',
      status: 'active' as const,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'GitHub Pro',
      vendor: 'GitHub',
      category: 'Software',
      amount: 4.00,
      currency: 'USD',
      interval: 'monthly' as const,
      next_renewal_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: '2024-01-01',
      status: 'active' as const,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'ChatGPT Plus',
      vendor: 'OpenAI',
      category: 'Software',
      amount: 20.00,
      currency: 'USD',
      interval: 'monthly' as const,
      next_renewal_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: '2024-02-01',
      status: 'active' as const,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Adobe Creative Cloud',
      vendor: 'Adobe Inc.',
      category: 'Software',
      amount: 54.99,
      currency: 'USD',
      interval: 'monthly' as const,
      next_renewal_date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: '2024-01-15',
      status: 'paused' as const,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchSubscriptions = async () => {
    //   try {
    //     const response = await fetch('/api/v1/subscriptions')
    //     const data = await response.json()
    //     setSubscriptions(data)
    //   } catch (error) {
    //     console.error('Failed to fetch subscriptions:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    // fetchSubscriptions()

    // MOCK MODE: Use mock data
    setTimeout(() => {
      const mockData = getMockSubscriptions()
      setSubscriptions(mockData)
      setFilteredSubscriptions(mockData)
      setIsLoading(false)
    }, 500)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...subscriptions]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.category === categoryFilter)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, statusFilter, categoryFilter])

  // Get unique categories
  const categories = Array.from(
    new Set(subscriptions.map((sub) => sub.category || 'Other'))
  )

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
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
          />
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredSubscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {subscriptions.length === 0
                ? 'No subscriptions yet. Add your first one!'
                : 'No subscriptions match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSubscriptions.map((subscription) => (
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
