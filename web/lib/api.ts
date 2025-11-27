import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
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
    skip?: number
    limit?: number
  }) => api.get('/subscriptions', { params }),

  create: (data: any) => api.post('/subscriptions', data),

  get: (id: number) => api.get(`/subscriptions/${id}`),

  update: (id: number, data: any) => api.patch(`/subscriptions/${id}`, data),

  delete: (id: number) => api.delete(`/subscriptions/${id}`),

  getDashboard: () => api.get('/subscriptions/dashboard'),
}
