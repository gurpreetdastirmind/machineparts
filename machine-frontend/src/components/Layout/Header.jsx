// frontend/src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { 
  FiSearch, 
  FiShoppingCart, 
  FiUser, 
  FiHeart, 
  FiMenu,
  FiX,
  FiShield
} from 'react-icons/fi'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const { cartItems } = useCart()
  const { user, isAuthenticated, isAdmin, loginType, tokenType, logout, debugState } = useAuth()
  const navigate = useNavigate()

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  // ✅ Debug state on every render
  useEffect(() => {
    console.log('🔍 Header mounted - checking auth state')
    if (debugState) debugState()
  }, [isAuthenticated, isAdmin, loginType, tokenType, user])

  // ✅ STRICT CHECK - Only show admin UI if ALL conditions are met
  const isAuth = isAuthenticated
  const isAdminUser = isAdmin === true
  const isAdminLogin = loginType === 'admin'
  const isAdminToken = tokenType === 'admin'
  const hasAdminRole = user?.role === 'admin'
  
  // ✅ Final check - ALL must be true for admin UI
  const showAdminUI = isAuth && isAdminUser && isAdminLogin && isAdminToken && hasAdminRole

  // Log for debugging
  console.log('🔍 Header render:', { 
    isAuthenticated: isAuth,
    isAdmin: isAdminUser,
    loginType,
    tokenType,
    userEmail: user?.email,
    userRole: user?.role,
    showAdminUI,
    conditions: {
      auth: isAuth,
      adminState: isAdminUser,
      loginTypeCheck: isAdminLogin,
      tokenTypeCheck: isAdminToken,
      roleCheck: hasAdminRole
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setShowAccountMenu(false)
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">MP</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              MachineParts
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-12 pr-4 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                <FiSearch size={20} />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <FiHeart size={22} className="text-gray-600" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <FiShoppingCart size={22} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowAccountMenu(!showAccountMenu)
                  } else {
                    navigate('/auth/login')
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {/* ✅ Show shield ONLY if admin, otherwise show user icon */}
                {showAdminUI ? (
                  <FiShield size={22} className="text-blue-600" />
                ) : (
                  <FiUser size={22} className="text-gray-600" />
                )}
              </button>

              {/* ✅ Only show menu if authenticated */}
              {showAccountMenu && isAuthenticated && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">
                  {showAdminUI ? (
                    // Admin dropdown header
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex items-center gap-2">
                        <FiShield className="text-blue-600" size={18} />
                        <p className="font-semibold text-blue-700">Admin</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                  ) : (
                    // Regular user dropdown header
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  )}
                  
                  {/* ✅ Only show Admin Panel link if actually admin */}
                  {showAdminUI && (
                    <Link 
                      to="/admin/dashboard" 
                      className="block px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium border-b border-gray-100"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      ⚡ Go to Admin Panel
                    </Link>
                  )}
                  
                  <Link to="/account" className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700">
                    My Account
                  </Link>
                  <Link to="/account/orders" className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700">
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700">
                    Wishlist
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <FiX size={24} className="text-gray-600" />
              ) : (
                <FiMenu size={24} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header