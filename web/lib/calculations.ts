import type { Subscription, BillingCycle } from '@/types'

/**
 * Calculate the monthly cost of a subscription based on its billing cycle
 */
export function calculateMonthlyCost(cost: number, billingCycle: BillingCycle): number {
  switch (billingCycle) {
    case 'weekly':
      return cost * 52 / 12
    case 'monthly':
      return cost
    case 'quarterly':
      return cost * 4 / 12
    case 'yearly':
      return cost / 12
    default:
      return cost
  }
}

/**
 * Calculate total monthly spending across all subscriptions
 */
export function getTotalMonthlySpending(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    return total + calculateMonthlyCost(sub.cost, sub.billing_cycle)
  }, 0)
}

/**
 * Calculate total yearly spending across all subscriptions
 */
export function getTotalYearlySpending(subscriptions: Subscription[]): number {
  return getTotalMonthlySpending(subscriptions) * 12
}

/**
 * Get spending organized by category
 */
export function getSpendingByCategory(subscriptions: Subscription[]): Record<string, number> {
  const categorySpending: Record<string, number> = {}

  subscriptions.forEach(sub => {
    const monthlyCost = calculateMonthlyCost(sub.cost, sub.billing_cycle)
    const category = sub.category || 'Other'

    if (categorySpending[category]) {
      categorySpending[category] += monthlyCost
    } else {
      categorySpending[category] = monthlyCost
    }
  })

  return categorySpending
}

/**
 * Get spending organized by billing cycle
 */
export function getSpendingByBillingCycle(subscriptions: Subscription[]): Record<string, number> {
  const cycleSpending: Record<string, number> = {}

  subscriptions.forEach(sub => {
    const monthlyCost = calculateMonthlyCost(sub.cost, sub.billing_cycle)
    const cycle = sub.billing_cycle

    if (cycleSpending[cycle]) {
      cycleSpending[cycle] += monthlyCost
    } else {
      cycleSpending[cycle] = monthlyCost
    }
  })

  return cycleSpending
}
