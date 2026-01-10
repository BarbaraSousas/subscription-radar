import axios from 'axios'

// Use Next.js API routes which handle authentication
const API_URL = '/api'

// Create axios instance that calls Next.js API routes
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies with requests
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
// TODO: Once backend is integrated, these can call the backend directly via `api` instance
// For now, they'll go through Next.js API routes which handle mock mode
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getCurrentUser: () => api.get('/auth/me'),
}

// Subscriptions API
export const subscriptionsAPI = {
  list: (params?: {
    status_filter?: string
    category?: string
    search?: string
    skip?: number
    limit?: number
  }) => api.get('/subscriptions', { params }),

  create: (data: any) => api.post('/subscriptions', data),

  get: (id: number) => api.get(`/subscriptions/${id}`),

  update: (id: number, data: any) => api.patch(`/subscriptions/${id}`, data),

  delete: (id: number) => api.delete(`/subscriptions/${id}`),

  getDashboard: () => api.get('/subscriptions/dashboard'),
}

// Analytics API (using Next.js API routes)
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),

  getByCategory: () => api.get('/analytics/by-category'),

  getByCycle: () => api.get('/analytics/by-cycle'),

  getUpcoming: (days: number = 30) =>
    api.get('/analytics/upcoming', { params: { days } }),

  getMonthlyProjection: (months: number = 12) =>
    api.get('/analytics/monthly-projection', { params: { months } }),
}
