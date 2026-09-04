// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { authService } from '../services/authService'
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
  
  const verifyingRef = useRef(false)
  const verifiedRef = useRef(false)

  // Debug function
  const debugState = () => {
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
  }

  // ✅ CRITICAL: Clear ALL session data and reset ALL state
  const clearSession = () => {
    console.log('🧹 Clearing ALL session data...')
    
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginType')
    localStorage.removeItem('tokenType')
    
    // Reset ALL state values
    setToken(null)
    setUser(null)
    setIsAdmin(false)
    setLoginType(null)
    setTokenType(null)
    
    // Reset verification flags
    verifiedRef.current = false
    verifyingRef.current = false
    
    console.log('✅ Session cleared successfully')
  }

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
        
        // Only set admin if ALL conditions match
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
  }, [])

  // Verify session once when token and user are set
  useEffect(() => {
    if (token && user && !verifiedRef.current && !verifyingRef.current) {
      verifySession()
    }
  }, [token, user])

  const verifySession = async () => {
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
          // If not admin, ensure loginType and tokenType are 'user'
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
  }

  // ✅ USER LOGIN - Only for regular users
  const login = async (email, password) => {
    try {
      console.log('🔐 User login attempt with:', email)
      
      const response = await authService.login(email, password)
      console.log('📥 Login response:', response.data)
      
      const data = response.data?.data || response.data
      const { token: newToken, user: userData } = data || {}
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server')
      }
      
      // ✅ If this is an admin, prevent regular login
      if (userData.role === 'admin') {
        toast.error('Please use the admin login page')
        return { 
          success: false, 
          error: 'Please use admin login',
          isAdmin: true 
        }
      }
      
      console.log('👤 User logged in:', userData.email, 'Role:', userData.role)
      
      // ✅ CRITICAL: Force clear ALL session data first
      clearSession()
      
      // ✅ IMPORTANT: Set state after clearing
      // Use setTimeout to ensure state updates happen after clear
      setTimeout(() => {
        setToken(newToken)
        setUser(userData)
        setIsAdmin(false)        // ✅ Explicitly set to false
        setLoginType('user')     // ✅ Explicitly set to 'user'
        setTokenType('user')     // ✅ Explicitly set to 'user'
        
        localStorage.setItem('token', newToken)
        localStorage.setItem('userData', JSON.stringify(userData))
        localStorage.setItem('loginType', 'user')
        localStorage.setItem('tokenType', 'user')
        localStorage.removeItem('userRole')  // ✅ Remove admin role
        
        verifiedRef.current = false
        verifyingRef.current = false
        
        console.log('✅ User state set successfully:', {
          email: userData.email,
          role: userData.role,
          isAdmin: false,
          loginType: 'user',
          tokenType: 'user'
        })
      }, 10)
      
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
  }

  // ✅ ADMIN LOGIN - Only for admin users
  const adminLogin = async (email, password) => {
    try {
      console.log('🔐 Admin login attempt with:', email)
      
      const response = await authService.login(email, password)
      console.log('📥 Admin login response:', response.data)
      
      const data = response.data?.data || response.data
      const { token: newToken, user: userData } = data || {}
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server')
      }
      
      // ✅ CRITICAL: Verify this is actually an admin
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
      
      // ✅ Force clear ALL session data first
      clearSession()
      
      // ✅ IMPORTANT: Set state after clearing
      setTimeout(() => {
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
      }, 10)
      
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
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      toast.success('Registration successful! Please login.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    clearSession()
    toast.success('Logged out successfully')
  }

  const value = {
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
    // ✅ isAdmin should check BOTH user role AND token type
    isAdmin: (user?.role === 'admin') && isAdmin && loginType === 'admin' && tokenType === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}