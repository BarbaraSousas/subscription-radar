'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import type { DashboardStats } from '@/types'

// TODO: Replace with actual API call to /api/subscriptions/dashboard
const getMockDashboardStats = (): DashboardStats => {
  const today = new Date()

  return {
    total_monthly_spend: 127.96,
    active_subscriptions: 5,
    upcoming_renewals: [
      {
        subscription: {
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
        days_until_renewal: 2,
      },
      {
        subscription: {
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
        days_until_renewal: 5,
      },
      {
        subscription: {
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
        days_until_renewal: 7,
      },
    ],
    spend_by_category: [
      { category: 'Entertainment', total_amount: 25.98, count: 2 },
      { category: 'Software', total_amount: 101.98, count: 3 },
    ],
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchStats = async () => {
    //   try {
    //     const response = await fetch('/api/subscriptions/dashboard')
    //     const data = await response.json()
    //     setStats(data)
    //   } catch (error) {
    //     console.error('Failed to fetch dashboard stats:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    // fetchStats()

    // MOCK MODE: Use mock data
    setTimeout(() => {
      setStats(getMockDashboardStats())
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600 dark:text-red-400">
          Failed to load dashboard
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Link href="/subscriptions/new">
          <Button>Add Subscription</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Monthly Spend
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ${stats.total_monthly_spend.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Subscriptions
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.active_subscriptions}
          </p>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upcoming Renewals
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.upcoming_renewals.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No upcoming renewals
            </div>
          ) : (
            stats.upcoming_renewals.map(({ subscription, days_until_renewal }) => (
              <div
                key={subscription.id}
                className="p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {subscription.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscription.category} • Renews on{' '}
                    {format(new Date(subscription.next_renewal_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${subscription.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {days_until_renewal} {days_until_renewal === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spend by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Spend by Category
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.spend_by_category.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cat.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cat.count} {cat.count === 1 ? 'subscription' : 'subscriptions'}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${cat.total_amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
