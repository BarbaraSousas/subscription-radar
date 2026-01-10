'use client'

import type { Subscription } from '@/types'
import { CATEGORY_COLORS } from '@/types'
import { getSpendingByCategory, calculateMonthlyCost } from '@/lib/calculations'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface Props {
  subscriptions: Subscription[]
}

export function Analytics({ subscriptions }: Props) {
  const categorySpending = getSpendingByCategory(subscriptions)

  const pieData = Object.entries(categorySpending).map(([category, amount]) => ({
    name: category,
    value: parseFloat(amount.toFixed(2)),
    color: CATEGORY_COLORS[category] || '#A8DADC'
  }))

  const barData = subscriptions.map(sub => ({
    name: sub.name,
    monthly: parseFloat(calculateMonthlyCost(sub.cost, sub.billing_cycle).toFixed(2)),
    yearly: parseFloat((calculateMonthlyCost(sub.cost, sub.billing_cycle) * 12).toFixed(2))
  })).sort((a, b) => b.monthly - a.monthly)

  const totalMonthly = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{pieData.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Average per Subscription</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            ${subscriptions.length > 0 ? (totalMonthly / subscriptions.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Highest Category</p>
          <p className="text-xl font-semibold text-gray-900 mt-2">
            {pieData.length > 0 ? pieData.sort((a, b) => b.value - a.value)[0].name : 'None'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data to display
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {pieData.sort((a, b) => b.value - a.value).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {((item.value / totalMonthly) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Subscription Comparison</h2>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="monthly" fill="#6366f1" name="Monthly Cost" />
              <Bar dataKey="yearly" fill="#a855f7" name="Yearly Cost" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No subscriptions to compare
          </div>
        )}
      </div>
    </div>
  )
}
