'use client'

import { useState } from 'react'
import type { Subscription } from '@/types'
import { calculateMonthlyCost } from '@/lib/calculations'
import { getDaysUntilRenewal } from '@/lib/notifications'
import { Calendar, Pencil, Trash2, Search, Filter } from 'lucide-react'

interface Props {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: number) => void
}

export function SubscriptionList({ subscriptions, onEdit, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'renewal'>('name')

  const categories = ['all', ...Array.from(new Set(subscriptions.map(s => s.category)))]

  const filteredAndSorted = subscriptions
    .filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || sub.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'cost':
          return calculateMonthlyCost(b.cost, b.billing_cycle) - calculateMonthlyCost(a.cost, a.billing_cycle)
        case 'renewal':
          return getDaysUntilRenewal(a.next_renewal) - getDaysUntilRenewal(b.next_renewal)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'cost' | 'renewal')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Sort by Name</option>
              <option value="cost">Sort by Cost</option>
              <option value="renewal">Sort by Renewal</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAndSorted.map(sub => {
              const daysUntil = getDaysUntilRenewal(sub.next_renewal)
              const monthlyCost = calculateMonthlyCost(sub.cost, sub.billing_cycle)

              return (
                <div key={sub.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: sub.color || '#6366f1' + '20' }}
                      >
                        <span className="text-2xl" style={{ color: sub.color || '#6366f1' }}>
                          {sub.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{sub.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700">
                                {sub.category}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">
                                {sub.billing_cycle}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-semibold text-gray-900">
                              ${sub.cost.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${monthlyCost.toFixed(2)}/mo
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Next renewal: {new Date(sub.next_renewal).toLocaleDateString()}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              daysUntil <= 7
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
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
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
