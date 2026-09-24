import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'  // ✅ ADD
import { useAuth } from '../context/AuthContext'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'

const Register = () => {
  const { t } = useTranslation()  // ✅ ADD HOOK
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errors = {}
    if (!formData.firstName) errors.firstName = t('auth.firstNameRequired')       // ✅ TRANSLATED
    if (!formData.lastName) errors.lastName = t('auth.lastNameRequired')          // ✅ TRANSLATED
    if (!formData.email) errors.email = t('auth.emailRequired')                   // ✅ TRANSLATED
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('auth.emailInvalid')  // ✅ TRANSLATED
    if (!formData.phone) errors.phone = t('auth.phoneRequired')                   // ✅ TRANSLATED
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = t('auth.phoneInvalid')  // ✅ TRANSLATED
    if (!formData.password) errors.password = t('auth.passwordRequired')          // ✅ TRANSLATED
    else if (formData.password.length < 6) errors.password = t('auth.passwordMin')  // ✅ TRANSLATED
    if (!formData.confirmPassword) errors.confirmPassword = t('auth.confirmRequired')  // ✅ TRANSLATED
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('auth.passwordsDoNotMatch')  // ✅ TRANSLATED
    if (!agreeTerms) errors.agreeTerms = t('auth.agreeRequired')                  // ✅ TRANSLATED
    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    })
    setLoading(false)

    if (result.success) {
      navigate('/auth/login')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('auth.createAccount')}  {/* ✅ TRANSLATED */}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('auth.joinUs')}  {/* ✅ TRANSLATED */}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.firstName')}  {/* ✅ TRANSLATED */}
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.lastName')}  {/* ✅ TRANSLATED */}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.emailAddress')}  {/* ✅ TRANSLATED */}
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.phoneNumber')}  {/* ✅ TRANSLATED */}
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.password')}  {/* ✅ TRANSLATED */}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            <div className="mt-1 h-1 w-full bg-gray-200 rounded">
              <div
                className={`h-full rounded transition-all ${
                  formData.password.length === 0 ? 'w-0' :
                  formData.password.length < 4 ? 'w-1/3 bg-red-500' :
                  formData.password.length < 8 ? 'w-2/3 bg-yellow-500' :
                  'w-full bg-green-500'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('auth.passwordStrength')}: {
                formData.password.length === 0 ? t('auth.empty') :      // ✅ TRANSLATED
                formData.password.length < 4 ? t('auth.weak') :          // ✅ TRANSLATED
                formData.password.length < 8 ? t('auth.medium') :        // ✅ TRANSLATED
                t('auth.strong')                                          // ✅ TRANSLATED
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.confirmPassword')}  {/* ✅ TRANSLATED */}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-600 dark:text-gray-300">
              {t('auth.iAgreeTo')}{' '}  {/* ✅ TRANSLATED */}
              <Link to="/terms" className="text-blue-600 hover:underline">
                {t('auth.termsConditions')}  {/* ✅ TRANSLATED */}
              </Link>
              {' '}{t('auth.and')}{' '}  {/* ✅ TRANSLATED */}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                {t('auth.privacyPolicy')}  {/* ✅ TRANSLATED */}
              </Link>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('auth.creatingAccount')}  {/* ✅ TRANSLATED */}
              </>
            ) : (
              t('auth.createAccount')  /* ✅ TRANSLATED */
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          {t('auth.alreadyHaveAccount')}{' '}  {/* ✅ TRANSLATED */}
          <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
            {t('auth.login')}  {/* ✅ TRANSLATED */}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register