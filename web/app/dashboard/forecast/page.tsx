'use client'

import { useState, useEffect } from 'react'
import { Forecast } from '@/components/Forecast'
import { subscriptionsAPI } from '@/lib/api'
import type { Subscription } from '@/types'

export default function ForecastPage() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return <Forecast subscriptions={subscriptions} />
}
