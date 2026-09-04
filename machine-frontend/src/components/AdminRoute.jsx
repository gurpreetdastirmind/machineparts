// frontend/src/components/AdminRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user, loginType, tokenType } = useAuth()
  
  // ✅ STRICT CHECK - ALL must be true
  const isAdminUser = isAdmin === true
  const isAdminLogin = loginType === 'admin'
  const isAdminToken = tokenType === 'admin'
  const hasAdminRole = user?.role === 'admin'
  
  const isAdminAccess = isAuthenticated && isAdminUser && isAdminLogin && isAdminToken && hasAdminRole

  console.log('🔐 AdminRoute check:', { 
    isAuthenticated, 
    isAdmin: isAdminUser, 
    loginType,
    tokenType,
    userRole: user?.role,
    isAdminAccess,
    loading, 
    userEmail: user?.email,
    conditions: {
      auth: isAuthenticated,
      adminState: isAdminUser,
      loginTypeCheck: isAdminLogin,
      tokenTypeCheck: isAdminToken,
      roleCheck: hasAdminRole
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  // ✅ Check if user is authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to admin login')
    return <Navigate to="/admin/login" replace />
  }

  // ✅ Check ALL conditions for admin access
  if (!isAdminAccess) {
    console.log('❌ Admin access denied - conditions not met')
    toast.error('Access denied. Admin privileges required.')
    return <Navigate to="/" replace />
  }

  console.log('✅ Admin access granted for:', user?.email)
  return children
}

export default AdminRoute