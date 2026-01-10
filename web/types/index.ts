export interface User {
  id: number
  email: string
  full_name?: string
  is_active: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface Subscription {
  id: number
  name: string
  cost: number
  billing_cycle: BillingCycle
  category: string
  next_renewal: string
  color?: string
  description?: string
  website?: string
  status: SubscriptionStatus
  user_id: number
  created_at: string
  updated_at: string
}

export interface CategorySpend {
  category: string
  total_amount: number
  count: number
}

export interface UpcomingRenewal {
  subscription: Subscription
  days_until_renewal: number
}

export interface DashboardStats {
  total_monthly_spend: number
  active_subscriptions: number
  upcoming_renewals: UpcomingRenewal[]
  spend_by_category: CategorySpend[]
}

export interface SummaryStats {
  total_monthly_cost: number
  total_subscriptions: number
  average_cost: number
}

export interface CycleSpend {
  billing_cycle: string
  total_amount: number
  count: number
}

export interface MonthlyProjection {
  month: string
  projected_cost: number
}

export const CATEGORIES = [
  'Entertainment',
  'Software',
  'Productivity',
  'Health & Fitness',
  'Education',
  'Cloud Storage',
  'Music',
  'Gaming',
  'News',
  'Other'
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#E50914',
  'Software': '#FF6B6B',
  'Productivity': '#4ECDC4',
  'Health & Fitness': '#95E1D3',
  'Education': '#F38181',
  'Cloud Storage': '#AA96DA',
  'Music': '#1DB954',
  'Gaming': '#9D4EDD',
  'News': '#FFB84D',
  'Other': '#A8DADC'
}
