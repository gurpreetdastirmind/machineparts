// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react'
import { authService } from '../services/authService'
import { cartService } from '../services/cartService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginType, setLoginType] = useState(null)
  const [tokenType, setTokenType] = useState(null)

  // ✅ Callback for cart merge — use a ref so it persists across renders
  const onCartMergeCompleteRef = useRef(null)

  const verifyingRef = useRef(false)
  const verifiedRef = useRef(false)

  // Debug function
  const debugState = useCallback(() => {
    const state = {
      user: user?.email,
      role: user?.role,
      isAdmin,
      loginType,
      tokenType,
      isAuthenticated: !!user && !!token,
      storedToken: localStorage.getItem('token') ? true : false,
      storedLoginType: localStorage.getItem('loginType'),
      storedTokenType: localStorage.getItem('tokenType'),
      storedUserRole: localStorage.getItem('userRole'),
      storedUserData: localStorage.getItem('userData')
    }
    console.log('🔍 Current Auth State:', state)
    return state
  }, [user, isAdmin, loginType, tokenType, token])

  // Clear ALL session data and reset ALL state
  const clearSession = useCallback(() => {
    console.log('🧹 Clearing ALL session data...')

    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginType')
    localStorage.removeItem('tokenType')

    setToken(null)
    setUser(null)
    setIsAdmin(false)
    setLoginType(null)
    setTokenType(null)

    verifiedRef.current = false
    verifyingRef.current = false

    console.log('✅ Session cleared successfully')
  }, [])

  // Merge guest cart with user cart
  const mergeGuestCart = useCallback(async (userToken) => {
    try {
      const guestCartData = localStorage.getItem('guestCart')
      if (!guestCartData) {
        console.log('No guest cart to merge')
        return false
      }

      const guestItems = JSON.parse(guestCartData)
      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        console.log('Guest cart is empty')
        return false
      }

      console.log(`🔄 Merging ${guestItems.length} guest cart items...`)

      let mergedCount = 0
      for (const item of guestItems) {
        try {
          await cartService.addToCart(item.productId, item.quantity)
          mergedCount++
          console.log(`✅ Merged: ${item.productId} x ${item.quantity}`)
        } catch (error) {
          console.error(`Failed to merge item ${item.productId}:`, error)
        }
      }

      localStorage.removeItem('guestCart')
      console.log(`✅ ${mergedCount} guest cart items merged and cleared`)

      if (onCartMergeCompleteRef.current) {
        onCartMergeCompleteRef.current()
      }

      return true
    } catch (error) {
      console.error('Error merging guest cart:', error)
      return false
    }
  }, [])

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('userData')
    const storedLoginType = localStorage.getItem('loginType')
    const storedTokenType = localStorage.getItem('tokenType')

    console.log('🔍 Checking localStorage on mount:', {
      storedToken: !!storedToken,
      storedUser: !!storedUser,
      storedLoginType,
      storedTokenType
    })

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('✅ Restored user:', parsedUser.email, 'Role:', parsedUser.role)

        const isUserAdmin = parsedUser.role === 'admin'
        const isLoginTypeAdmin = storedLoginType === 'admin'
        const isTokenTypeAdmin = storedTokenType === 'admin'

        const shouldBeAdmin = isUserAdmin && isLoginTypeAdmin && isTokenTypeAdmin

        setToken(storedToken)
        setUser(parsedUser)
        setIsAdmin(shouldBeAdmin)
        setLoginType(storedLoginType || (isUserAdmin ? 'admin' : 'user'))
        setTokenType(storedTokenType || (isUserAdmin ? 'admin' : 'user'))

        if (shouldBeAdmin) {
          localStorage.setItem('userRole', 'admin')
        } else {
          localStorage.removeItem('userRole')
        }

        setLoading(false)
      } catch (e) {
        console.error('Error parsing stored user:', e)
        clearSession()
        setLoading(false)
      }
    } else {
      clearSession()
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Verify session once when token and user are set
  useEffect(() => {
    if (token && user && !verifiedRef.current && !verifyingRef.current) {
      verifySession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user])

  const verifySession = useCallback(async () => {
    if (verifyingRef.current || verifiedRef.current) return

    verifyingRef.current = true

    try {
      console.log('🔐 Verifying session for:', user?.email)
      const response = await authService.getProfile()

      const userData = response.data?.data?.user || response.data?.user || response.data?.data

      if (userData) {
        console.log('👤 Verified user:', userData.email, 'Role:', userData.role)

        const isUserAdmin = userData.role === 'admin'
        const isLoginTypeAdmin = loginType === 'admin'
        const isTokenTypeAdmin = tokenType === 'admin'
        const shouldBeAdmin = isUserAdmin && isLoginTypeAdmin && isTokenTypeAdmin

        setUser(userData)
        setIsAdmin(shouldBeAdmin)

        localStorage.setItem('userData', JSON.stringify(userData))

        if (shouldBeAdmin) {
          localStorage.setItem('userRole', 'admin')
        } else {
          localStorage.removeItem('userRole')
          if (loginType === 'admin') {
            setLoginType('user')
            localStorage.setItem('loginType', 'user')
          }
          if (tokenType === 'admin') {
            setTokenType('user')
            localStorage.setItem('tokenType', 'user')
          }
        }

        verifiedRef.current = true
      } else {
        console.warn('⚠️ Session invalid, logging out')
        clearSession()
      }
    } catch (error) {
      console.error('❌ Session verification failed:', error)
      clearSession()
    } finally {
      verifyingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loginType, tokenType, clearSession])

  // USER LOGIN - Only for regular users
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 User login attempt with:', email)

      const response = await authService.login(email, password)
      console.log('📥 Login response:', response.data)

      let data = response.data?.data || response.data
      let newToken = data?.token || response.data?.token
      let userData = data?.user || response.data?.user || data

      if (!newToken && response.data?.token) {
        newToken = response.data.token
        userData = response.data.user || response.data
      }

      if (!newToken || !userData) {
        console.error('Invalid login response:', response.data)
        throw new Error('Invalid response from server')
      }

      if (userData.role === 'admin') {
        toast.error('Please use the admin login page')
        return {
          success: false,
          error: 'Please use admin login',
          isAdmin: true
        }
      }

      console.log('👤 User logged in:', userData.email, 'Role:', userData.role)

      clearSession()

      // ✅ SET STATE IMMEDIATELY
      setToken(newToken)
      setUser(userData)
      setIsAdmin(false)
      setLoginType('user')
      setTokenType('user')

      localStorage.setItem('token', newToken)
      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('loginType', 'user')
      localStorage.setItem('tokenType', 'user')
      localStorage.removeItem('userRole')

      verifiedRef.current = false
      verifyingRef.current = false

      console.log('✅ User state set successfully')

      await mergeGuestCart(newToken)

      if (onCartMergeCompleteRef.current) {
        onCartMergeCompleteRef.current()
      }

      toast.success(`Welcome ${userData.firstName || 'User'}!`)
      return { success: true, isAdmin: false }

    } catch (error) {
      console.error('❌ Login error:', error)

      let message = 'Login failed. Please try again.'

      if (error.response) {
        message = error.response.data?.message ||
                  error.response.data?.error ||
                  'Invalid email or password'
      } else if (error.request) {
        message = 'Cannot connect to server. Please check if server is running.'
      } else {
        message = error.message || 'Login failed'
      }

      toast.error(message)
      return { success: false, error: message }
    }
  }, [clearSession, mergeGuestCart])

  // ADMIN LOGIN
  const adminLogin = useCallback(async (email, password) => {
    try {
      console.log('🔐 Admin login attempt with:', email)

      const response = await authService.login(email, password)
      console.log('📥 Admin login response:', JSON.stringify(response.data, null, 2))

      let data = response.data?.data || response.data
      let newToken = data?.token || response.data?.token
      let userData = data?.user || response.data?.user || data

      if (!newToken && response.data?.token) {
        newToken = response.data.token
        userData = response.data.user || response.data
      }

      if (!userData && response.data?.data?.user) {
        userData = response.data.data.user
        newToken = response.data.data.token || response.data.token
      }

      console.log('Extracted - Token:', !!newToken, 'User:', userData?.email, 'Role:', userData?.role)

      if (!newToken || !userData) {
        console.error('Invalid admin login response:', response.data)
        throw new Error('Invalid response from server')
      }

      if (userData.role !== 'admin') {
        console.log('❌ User is not admin:', userData.role)
        toast.error('This account does not have admin privileges')
        return {
          success: false,
          error: 'Access denied. Admin privileges required.',
          isAdmin: false
        }
      }

      console.log('✅ Admin login successful for:', userData.email)

      clearSession()

      // ✅ SET STATE IMMEDIATELY
      setToken(newToken)
      setUser(userData)
      setIsAdmin(true)
      setLoginType('admin')
      setTokenType('admin')

      localStorage.setItem('token', newToken)
      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('userRole', 'admin')
      localStorage.setItem('loginType', 'admin')
      localStorage.setItem('tokenType', 'admin')

      verifiedRef.current = false
      verifyingRef.current = false

      console.log('✅ Admin state set successfully:', {
        email: userData.email,
        role: userData.role,
        isAdmin: true,
        loginType: 'admin',
        tokenType: 'admin'
      })

      toast.success(`Welcome ${userData.firstName || 'Admin'}!`)
      return { success: true, isAdmin: true }

    } catch (error) {
      console.error('❌ Admin login error:', error)

      let message = 'Login failed. Please try again.'

      if (error.response) {
        message = error.response.data?.message ||
                  error.response.data?.error ||
                  'Invalid email or password'
      } else if (error.request) {
        message = 'Cannot connect to server. Please check if server is running.'
      } else {
        message = error.message || 'Login failed'
      }

      toast.error(message)
      return { success: false, error: message, isAdmin: false }
    }
  }, [clearSession])

  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData)
      toast.success('Registration successful! Please login.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    toast.success('Logged out successfully')
  }, [clearSession])

  // ✅ setCartMergeCallback — stable across renders
  const setCartMergeCallback = useCallback((callback) => {
    onCartMergeCompleteRef.current = callback
  }, [])

  // ✅ Memoized context value — only recomputes when real dependencies change
  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    token,
    login,
    adminLogin,
    register,
    logout,
    loginType,
    tokenType,
    debugState,
    isAuthenticated: !!user && !!token && user?.email !== undefined,
    isAdmin: (user?.role === 'admin') && isAdmin && loginType === 'admin' && tokenType === 'admin',
    setCartMergeCallback
  }), [
    user,
    loading,
    token,
    login,
    adminLogin,
    register,
    logout,
    loginType,
    tokenType,
    isAdmin,
    debugState,
    setCartMergeCallback
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}