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

export enum IntervalType {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface Subscription {
  id: number
  name: string
  vendor?: string
  category?: string
  amount: number
  currency: string
  interval: IntervalType
  custom_interval_days?: number
  next_renewal_date: string
  last_paid_at?: string
  start_date: string
  status: SubscriptionStatus
  tags?: string
  notes?: string
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
