// frontend/src/services/api.js
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Cache-busting headers for all GET requests
api.defaults.headers.get = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const tokenType = localStorage.getItem('tokenType') || 'user'
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Add token type header for backend validation
      config.headers['X-Token-Type'] = tokenType
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's an admin route and token is invalid
    if (error.response?.status === 403) {
      const isAdminRoute = window.location.pathname.includes('/admin')
      if (isAdminRoute) {
        toast.error('Admin access denied. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userData')
        localStorage.removeItem('tokenType')
        window.location.href = '/admin/login'
      } else {
        toast.error('Access denied.')
      }
    }
    
    if (error.response?.status === 401) {
      // Only redirect for non-admin routes
      if (!window.location.pathname.includes('/admin')) {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userData')
        localStorage.removeItem('tokenType')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api