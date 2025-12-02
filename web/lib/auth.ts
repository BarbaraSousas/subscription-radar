import { User } from '@/types'

const AUTH_API_BASE = '/api/auth'

// Client-side auth helpers that call Next.js API routes
// These API routes will handle mock mode vs real backend

export const authClient = {
  /**
   * Login user with email and password
   * Sets httpOnly cookie on success
   */
  login: async (email: string, password: string) => {
    const response = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: send/receive cookies
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    return response.json()
  },

  /**
   * Register new user
   * Sets httpOnly cookie on success
   */
  register: async (email: string, password: string, full_name?: string) => {
    const response = await fetch(`${AUTH_API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }

    return response.json()
  },

  /**
   * Get current authenticated user
   * Returns null if not authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${AUTH_API_BASE}/me`, {
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      return response.json()
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  },

  /**
   * Logout user
   * Clears httpOnly cookie
   */
  logout: async () => {
    const response = await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    return response.json()
  },
}
