/**
 * Calculate the number of days until a renewal date
 */
export function getDaysUntilRenewal(nextRenewal: string | Date): number {
  const renewalDate = typeof nextRenewal === 'string' ? new Date(nextRenewal) : nextRenewal
  const now = new Date()

  // Reset time parts to compare only dates
  renewalDate.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)

  const diffTime = renewalDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if a subscription is due for renewal soon (within specified days)
 */
export function isDueSoon(nextRenewal: string | Date, withinDays: number = 7): boolean {
  const daysUntil = getDaysUntilRenewal(nextRenewal)
  return daysUntil >= 0 && daysUntil <= withinDays
}

/**
 * Get a human-readable renewal status
 */
export function getRenewalStatus(nextRenewal: string | Date): string {
  const daysUntil = getDaysUntilRenewal(nextRenewal)

  if (daysUntil < 0) {
    return 'Overdue'
  } else if (daysUntil === 0) {
    return 'Today'
  } else if (daysUntil === 1) {
    return 'Tomorrow'
  } else if (daysUntil <= 7) {
    return `In ${daysUntil} days`
  } else {
    return `In ${daysUntil} days`
  }
}
