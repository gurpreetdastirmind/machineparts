// frontend/src/components/Layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiMenu,
  FiX,
  FiShield
} from 'react-icons/fi'
import machineLogo from '../../images/machine_logo1.png'
import LanguageSwitcher from './LanguageSwitcher'

const Header = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)

  const { cartItems } = useCart()
  const { user, isAuthenticated, isAdmin, loginType, tokenType, logout, debugState } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  useEffect(() => {
    if (debugState) debugState()
  }, [isAuthenticated, isAdmin, loginType, tokenType, user])

  // Sync header input with /search?q=...
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search)
      setSearchQuery(params.get('q') || '')
    } else {
      setSearchQuery('')
    }
  }, [location.pathname, location.search])

  // Debounced live suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await productService.getProducts({ search: searchQuery, limit: 5 })
          const items = res.data?.data?.products || res.data?.products || []
          setSuggestions(items)
          setShowSuggestions(items.length > 0)
        } catch (err) {
          console.warn('Suggestion fetch failed:', err)
          setSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAuth = isAuthenticated
  const isAdminUser = isAdmin === true
  const isAdminLogin = loginType === 'admin'
  const isAdminToken = tokenType === 'admin'
  const hasAdminRole = user?.role === 'admin'
  const showAdminUI = isAuth && isAdminUser && isAdminLogin && isAdminToken && hasAdminRole

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setShowSuggestions(false)
    }
  }

  // ✅ X button — clears input, stays on current page
  // If on /search, navigates to clean /search (empty state)
  const handleClearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)

    if (location.pathname === '/search') {
      navigate('/search', { replace: true })
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
            <img
              src={machineLogo}
              alt="SAINATH IMPEX"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                const parent = e.target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold text-2xl">SI</span>
                    </div>
                    <span class="text-xl font-bold text-gray-800 hidden sm:block">SAINATH IMPEX</span>
                  `
                }
              }}
            />
          </Link>

          {/* Search Bar with Live Suggestions */}
          <div className="flex-1 max-w-2xl relative" ref={suggestionsRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                placeholder={t('nav.searchPlaceholder') || 'Search for products...'}
                className="w-full px-4 py-2.5 pl-12 pr-12 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800"
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
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <FiX size={18} />
                </button>
              )}
            </form>

            {/* Live Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    onClick={() => {
                      setShowSuggestions(false)
                      setSearchQuery('')
                      setSuggestions([])
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <img
                      src={p.imageUrl || p.images?.[0] || 'https://via.placeholder.com/40'}
                      alt={p.name}
                      className="w-10 h-10 object-contain flex-shrink-0 bg-gray-50 rounded"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/40'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-1 font-medium">{p.name}</p>
                      {p.price && (
                        <p className="text-xs text-lime-600 font-semibold">
                          ₹{Number(p.discountedPrice || p.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full p-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t"
                >
                  View all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <Link
              to="/wishlist"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title={t('nav.wishlist')}
            >
              <FiHeart size={22} className="text-gray-600" />
            </Link>

            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title={t('nav.cart')}
            >
              <FiShoppingCart size={22} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

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
                {showAdminUI ? (
                  <FiShield size={22} className="text-blue-600" />
                ) : (
                  <FiUser size={22} className="text-gray-600" />
                )}
              </button>

              {showAccountMenu && isAuthenticated && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">
                  {showAdminUI ? (
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex items-center gap-2">
                        <FiShield className="text-blue-600" size={18} />
                        <p className="font-semibold text-blue-700">Admin</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  )}

                  {showAdminUI && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium border-b border-gray-100"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      ⚡ {t('nav.adminPanel')}
                    </Link>
                  )}

                  <Link
                    to="/account"
                    className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    {t('nav.account')}
                  </Link>
                  <Link
                    to="/account/orders"
                    className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    {t('nav.orders')}
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2.5 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    {t('nav.wishlist')}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>

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