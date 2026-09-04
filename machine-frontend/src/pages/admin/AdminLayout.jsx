// frontend/src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX,
  FiBarChart2, FiTag
} from 'react-icons/fi'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
    { label: 'Products', icon: FiPackage, path: '/admin/products' },
    { label: 'Orders', icon: FiShoppingBag, path: '/admin/orders' },
    { label: 'Users', icon: FiUsers, path: '/admin/users' },
    { label: 'Categories', icon: FiTag, path: '/admin/categories' },
    { label: 'Analytics', icon: FiBarChart2, path: '/admin/analytics' },
    { label: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // ✅ If no user, redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-64 flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">MP</span>
            </div>
            <div>
              <span className="font-bold text-lg block">Admin</span>
              <span className="text-xs text-gray-400">Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon size={20} className={active ? 'text-white' : ''} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <FiLogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMenu size={22} className="text-gray-600" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-medium text-gray-500 capitalize">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user?.firstName?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.firstName || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ✅ Page Content - This is where the admin content should render */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 max-w-7xl mx-auto">
            <span>© {new Date().getFullYear()} MachineParts Admin</span>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">v2.0</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Localhost:5173</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout