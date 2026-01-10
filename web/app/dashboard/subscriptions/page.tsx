'use client'

import { useState, useEffect } from 'react'
import { SubscriptionList } from '@/components/SubscriptionList'
import { subscriptionsAPI } from '@/lib/api'
import type { Subscription } from '@/types'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)
      const response = await subscriptionsAPI.list()
      setSubscriptions(response.data)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (subscription: Subscription) => {
    // TODO: Implement edit functionality
    console.log('Edit subscription:', subscription)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return

    try {
      await subscriptionsAPI.delete(id)
      fetchSubscriptions()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return <SubscriptionList subscriptions={subscriptions} onEdit={handleEdit} onDelete={handleDelete} />
}
