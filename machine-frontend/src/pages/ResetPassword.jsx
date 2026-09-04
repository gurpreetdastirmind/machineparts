import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { useNotification } from '../context/NotificationContext'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      addNotification('Invalid reset link', 'error')
      return
    }

    if (password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error')
      return
    }

    if (password !== confirmPassword) {
      addNotification('Passwords do not match', 'error')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      addNotification('Password reset successfully! Please login.', 'success')
      navigate('/auth/login')
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to reset password', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Link to="/auth/forgot-password" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Set New Password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <div className="mt-1 h-1 w-full bg-gray-200 rounded">
              <div 
                className={`h-full rounded transition-all ${
                  password.length === 0 ? 'w-0' :
                  password.length < 4 ? 'w-1/3 bg-red-500' :
                  password.length < 8 ? 'w-2/3 bg-yellow-500' :
                  'w-full bg-green-500'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password strength: {password.length === 0 ? 'Empty' :
                password.length < 4 ? 'Weak' :
                password.length < 8 ? 'Medium' : 'Strong'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword