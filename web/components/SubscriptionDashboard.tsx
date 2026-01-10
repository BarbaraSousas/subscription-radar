'use client'

import type { Subscription } from '@/types'
import { getTotalMonthlySpending, getTotalYearlySpending, getSpendingByCategory } from '@/lib/calculations'
import { getDaysUntilRenewal } from '@/lib/notifications'
import { DollarSign, TrendingUp, CreditCard, Bell, Calendar, Pencil, Trash2 } from 'lucide-react'

interface Props {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: number) => void
}

export function SubscriptionDashboard({ subscriptions, onEdit, onDelete }: Props) {
  const monthlyTotal = getTotalMonthlySpending(subscriptions)
  const yearlyTotal = getTotalYearlySpending(subscriptions)
  const categorySpending = getSpendingByCategory(subscriptions)
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

  // Get upcoming renewals (next 7 days)
  const upcomingRenewals = subscriptions
    .filter(sub => {
      const days = getDaysUntilRenewal(sub.next_renewal)
      return days >= 0 && days <= 7
    })
    .sort((a, b) => getDaysUntilRenewal(a.next_renewal) - getDaysUntilRenewal(b.next_renewal))

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Total</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${monthlyTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Yearly Total</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${yearlyTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {subscriptions.length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {topCategory ? topCategory[0] : 'None'}
              </p>
              {topCategory && (
                <p className="text-xs text-gray-500 mt-0.5">
                  ${topCategory[1].toFixed(2)}/mo
                </p>
              )}
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-gray-900">Upcoming Renewals (Next 7 Days)</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingRenewals.map(sub => {
              const daysUntil = getDaysUntilRenewal(sub.next_renewal)
              return (
                <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: sub.color || '#6366f1' + '20' }}
                    >
                      <span className="text-xl" style={{ color: sub.color || '#6366f1' }}>
                        {sub.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${sub.cost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 capitalize">{sub.billing_cycle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(sub)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Subscriptions</h2>
        </div>
        {subscriptions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subscriptions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subscriptions.map(sub => (
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: sub.color || '#6366f1' + '20' }}
                  >
                    <span className="text-xl" style={{ color: sub.color || '#6366f1' }}>
                      {sub.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sub.name}</p>
                    <p className="text-sm text-gray-500">{sub.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${sub.cost.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 capitalize">{sub.billing_cycle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(sub)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(sub.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
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
