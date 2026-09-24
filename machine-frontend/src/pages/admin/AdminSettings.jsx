// frontend/src/pages/admin/AdminSettings.jsx
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import {
  FiLock, FiUser, FiMail, FiShield, FiSave, FiEye, FiEyeOff,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const { user } = useAuth()

  // ---- Change Password Form ----
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // ---- Update Profile Form ----
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ================= CHANGE PASSWORD =================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setSavingPassword(true)
    try {
      const response = await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      )

      if (response.data?.success) {
        toast.success('Password changed successfully!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(response.data?.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Change password error:', error)
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to change password'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  // ================= UPDATE PROFILE =================
  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    if (!profileForm.firstName?.trim()) {
      toast.error('First name is required')
      return
    }
    if (!profileForm.email?.trim()) {
      toast.error('Email is required')
      return
    }

    setSavingProfile(true)
    try {
      const response = await authService.updateProfile(profileForm)

      if (response.data?.success) {
        toast.success('Profile updated successfully!')
        // Update localStorage so it persists
        const updatedUser = { ...user, ...profileForm }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
      } else {
        toast.error(response.data?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to update profile'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 10) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
    if (score === 2) return { level: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' }
    if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' }
    return { level: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' }
  }

  const strength = getPasswordStrength(passwordForm.newPassword)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your admin account settings and security
        </p>
      </div>

      {/* Admin Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                <FiShield size={11} /> Admin
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================ PROFILE SETTINGS ================ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiUser className="text-blue-600" size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Profile Information</h3>
              <p className="text-xs text-gray-500">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Changing email will affect your login credentials
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9876543210"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
            >
              <FiSave size={18} />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* ================ CHANGE PASSWORD ================ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <FiLock className="text-rose-600" size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Change Password</h3>
              <p className="text-xs text-gray-500">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Strength Bar */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.text}`}>
                    Strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Match indicator */}
              {passwordForm.confirmPassword && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {passwordForm.newPassword === passwordForm.confirmPassword ? (
                    <>
                      <FiCheckCircle className="text-emerald-500" size={14} />
                      <span className="text-xs text-emerald-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="text-red-500" size={14} />
                      <span className="text-xs text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-rose-500/25"
            >
              <FiLock size={18} />
              {savingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          {/* Security Tips */}
          <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1.5">🔒 Password Tips</p>
            <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
              <li>Use at least 8 characters</li>
              <li>Include uppercase &amp; lowercase letters</li>
              <li>Add numbers and symbols</li>
              <li>Never reuse passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings