// frontend/src/components/Layout/MobileMenu.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FiHome, 
  FiShoppingBag, 
  FiHeart, 
  FiUser, 
  FiLogOut,
  FiSettings,
  FiPackage,
  FiX,
  FiChevronRight,
  FiShield
} from 'react-icons/fi'

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isAdmin, loginType, tokenType, logout, user } = useAuth()
  
  // ✅ STRICT CHECK - Only show admin UI if ALL conditions are met
  const isAdminUser = isAdmin === true
  const isAdminLogin = loginType === 'admin'
  const isAdminToken = tokenType === 'admin'
  const hasAdminRole = user?.role === 'admin'
  
  const showAdminUI = isAuthenticated && isAdminUser && isAdminLogin && isAdminToken && hasAdminRole

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiShoppingBag, label: 'Products', path: '/products' },
    { icon: FiHeart, label: 'Wishlist', path: '/wishlist' },
    ...(isAuthenticated ? [
      { icon: FiUser, label: 'My Account', path: '/account' },
      { icon: FiPackage, label: 'My Orders', path: '/account/orders' },
      { icon: FiSettings, label: 'Settings', path: '/account/settings' },
      // ✅ Only show Admin Panel link if actually admin
      ...(showAdminUI ? [
        { icon: FiShield, label: '⚡ Admin Panel', path: '/admin/dashboard' },
      ] : []),
    ] : [])
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FiHome size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-gray-800 dark:text-white">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                item.label.includes('Admin') ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              <FiChevronRight className="ml-auto text-gray-400" size={16} />
            </Link>
          ))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full transition-colors"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/auth/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <FiUser size={20} />
              <span>Login / Register</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}

export default MobileMenu