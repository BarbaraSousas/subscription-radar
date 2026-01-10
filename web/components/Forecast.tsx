'use client'

import type { Subscription } from '@/types'
import { calculateMonthlyCost } from '@/lib/calculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

interface Props {
  subscriptions: Subscription[]
}

export function Forecast({ subscriptions }: Props) {
  // Generate forecast data for next 12 months
  const generateForecast = () => {
    const forecast = []
    const today = new Date()

    for (let i = 0; i < 12; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      let monthlyTotal = 0
      subscriptions.forEach(sub => {
        monthlyTotal += calculateMonthlyCost(sub.cost, sub.billing_cycle)
      })

      forecast.push({
        month: monthName,
        amount: parseFloat(monthlyTotal.toFixed(2)),
        subscriptions: subscriptions.length
      })
    }

    return forecast
  }

  const forecastData = generateForecast()
  const totalNextYear = forecastData.reduce((sum, month) => sum + month.amount, 0)
  const avgPerMonth = totalNextYear / 12

  // Upcoming payments in next 30 days
  const upcomingPayments = subscriptions
    .map(sub => {
      const nextRenewal = new Date(sub.next_renewal)
      const now = new Date()
      const daysUntil = Math.ceil((nextRenewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil >= 0 && daysUntil <= 30) {
        return {
          ...sub,
          daysUntil,
          date: nextRenewal
        }
      }
      return null
    })
    .filter(Boolean)
    .sort((a, b) => a!.daysUntil - b!.daysUntil)

  const totalUpcoming = upcomingPayments.reduce((sum, payment) => sum + (payment?.cost || 0), 0)

  return (
    <div className="space-y-6">
      {/* Forecast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm opacity-90">12-Month Forecast</p>
          </div>
          <p className="text-3xl font-semibold">${totalNextYear.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Average per Month</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">${avgPerMonth.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Next 30 Days</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">${totalUpcoming.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{upcomingPayments.length} payments</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">12-Month Spending Forecast</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            {/* @ts-ignore */}
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2}
              name="Monthly Spending"
              dot={{ fill: '#6366f1', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Upcoming Payments (Next 30 Days)</h2>
          </div>
        </div>
        {upcomingPayments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No upcoming payments in the next 30 days</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingPayments.map((payment) => (
              <div key={payment!.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: payment!.color || '#6366f1' + '20' }}
                  >
                    <span className="text-xl" style={{ color: payment!.color || '#6366f1' }}>
                      {payment!.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment!.name}</p>
                    <p className="text-sm text-gray-500">
                      {payment!.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${payment!.cost.toFixed(2)}</p>
                  <p className={`text-sm ${
                    payment!.daysUntil <= 7 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {payment!.daysUntil === 0 ? 'Today' : payment!.daysUntil === 1 ? 'Tomorrow' : `In ${payment!.daysUntil} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Savings Tip</h3>
          <p className="text-sm text-gray-700">
            Consider switching to annual billing for your subscriptions. You could save up to 20% on average!
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Spending Trend</h3>
          <p className="text-sm text-gray-700">
            Your projected spending for the next year is ${totalNextYear.toFixed(2)}. That&apos;s ${avgPerMonth.toFixed(2)} per month.
          </p>
        </div>
      </div>
    </div>
  )
}
