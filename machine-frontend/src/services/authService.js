import api from './api'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response
    } catch (error) {
      console.error('Login API error:', error.response?.data || error.message)
      throw error
    }
  },

  register: (userData) => {
    return api.post('/auth/register', userData)
  },

  logout: () => {
    return api.post('/auth/logout')
  },

  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword })
  },

  getProfile: () => {
    return api.get('/user/profile')
  },

  // ✅ NEW: Update profile (sends to /auth/update-profile)
  updateProfile: (userData) => {
    return api.put('/auth/update-profile', userData)
  },

  // ✅ NEW: Change password (sends to /auth/change-password)
  changePassword: (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { currentPassword, newPassword })
  },

  refreshToken: () => {
    return api.post('/auth/refresh')
  }
}