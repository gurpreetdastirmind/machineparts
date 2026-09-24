// frontend/src/pages/Account.jsx
import React, { useState, useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'  // ✅ ADD
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { orderService } from '../services/orderService'
import { userService } from '../services/userService'
import { FiHome, FiPackage, FiMapPin, FiHeart, FiStar, FiSettings, FiLogOut, FiShoppingBag, FiUser } from 'react-icons/fi'

const Account = () => {
  const { t } = useTranslation()  // ✅ ADD HOOK
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  const tabs = [
    { id: 'dashboard', label: t('account.dashboard'), icon: FiHome },     /* ✅ */
    { id: 'orders', label: t('account.orders'), icon: FiPackage },        /* ✅ */
    { id: 'addresses', label: t('account.addresses'), icon: FiMapPin },   /* ✅ */
    { id: 'wishlist', label: t('account.wishlist'), icon: FiHeart },      /* ✅ */
    { id: 'reviews', label: t('account.reviews'), icon: FiStar },         /* ✅ */
    { id: 'settings', label: t('account.settings'), icon: FiSettings },   /* ✅ */
  ]

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
            <div className="text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FiLogOut size={18} />
                <span className="text-sm font-medium">{t('nav.logout')}</span>  {/* ✅ */}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-4/5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'dashboard' && (
              <DashboardTab user={user} onTabChange={setActiveTab} />
            )}
            {activeTab === 'orders' && <OrdersTab locationKey={location.key} />}
            {activeTab === 'addresses' && <AddressesTab locationKey={location.key} />}
            {activeTab === 'wishlist' && <WishlistTab locationKey={location.key} />}
            {activeTab === 'reviews' && <ReviewsTab locationKey={location.key} />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// DashboardTab
const DashboardTab = ({ user, onTabChange }) => {
  const { t } = useTranslation()  // ✅

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        {t('account.welcomeBack')}, {user?.firstName}!  {/* ✅ */}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {t('account.manageAccount')}  {/* ✅ */}
      </p>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FiUser className="text-blue-600" />
          {t('account.profileInfo')}  {/* ✅ */}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('account.fullName')}</p>  {/* ✅ */}
            <p className="font-medium text-gray-800 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkout.email')}</p>  {/* ✅ */}
            <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkout.phone')}</p>  {/* ✅ */}
            <p className="font-medium text-gray-800 dark:text-white">
              {user?.phone || t('account.notProvided')}  {/* ✅ */}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('account.memberSince')}</p>  {/* ✅ */}
            <p className="font-medium text-gray-800 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('account.orders'), icon: FiPackage, tab: 'orders', color: 'from-blue-500 to-blue-600' },        /* ✅ */
          { label: t('account.addresses'), icon: FiMapPin, tab: 'addresses', color: 'from-green-500 to-green-600' }, /* ✅ */
          { label: t('account.wishlist'), icon: FiHeart, tab: 'wishlist', color: 'from-red-500 to-red-600' },        /* ✅ */
          { label: t('account.settings'), icon: FiSettings, tab: 'settings', color: 'from-amber-500 to-amber-600' }, /* ✅ */
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onTabChange(item.tab)}
            className={`bg-gradient-to-r ${item.color} rounded-xl p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-center`}
          >
            <item.icon className="mx-auto mb-2" size={22} />
            <span className="text-xs font-medium block">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// OrdersTab
const OrdersTab = ({ locationKey }) => {
  const { t } = useTranslation()  // ✅
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [locationKey])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrders()

      let ordersData = []
      if (Array.isArray(response.data?.data)) {
        ordersData = response.data.data
      } else if (Array.isArray(response.data?.data?.orders)) {
        ordersData = response.data.data.orders
      } else if (Array.isArray(response.data)) {
        ordersData = response.data
      } else if (Array.isArray(response.data?.orders)) {
        ordersData = response.data.orders
      }

      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    Delivered: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    Processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    Shipped: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    Pending: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  }

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // ✅ All filter labels are status keys that stay as-is (backend statuses)
  const filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {t('account.orders')}  {/* ✅ */}
      </h2>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filterOptions.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status === 'All' ? t('products.showing').split(' ')[0] === 'Showing' ? 'All' : t('common.all') : status}
            {/* ↑ Falls back to status name if `common.all` isn't translated yet */}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('account.noOrders')}  {/* ✅ */}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('account.noOrdersMessage')}  {/* ✅ */}
          </p>
          <Link
            to="/products"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('cart.startShopping')}  {/* ✅ */}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id || order.orderId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {order.orderNumber || order.id}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status || 'Pending'}
                  </span>
                  <p className="font-bold text-gray-800 dark:text-white">
                    ₹{order.totalAmount || order.total || 0}
                  </p>
                  <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    {t('account.viewDetails')}  {/* ✅ */}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// AddressesTab
const AddressesTab = ({ locationKey }) => {
  const { t } = useTranslation()  // ✅
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddresses()
  }, [locationKey])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await userService.getAddresses()

      let addressesData = []
      if (Array.isArray(response.data?.data)) {
        addressesData = response.data.data
      } else if (Array.isArray(response.data?.data?.addresses)) {
        addressesData = response.data.data.addresses
      } else if (Array.isArray(response.data)) {
        addressesData = response.data
      } else if (Array.isArray(response.data?.addresses)) {
        addressesData = response.data.addresses
      }

      setAddresses(addressesData)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {t('account.addresses')}  {/* ✅ */}
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          {t('account.addNewAddress')}  {/* ✅ */}
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('account.noAddresses')}  {/* ✅ */}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('account.noAddressesMessage')}  {/* ✅ */}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 dark:text-white">
                  {address.type || t('account.home')}  {/* ✅ */}
                </span>
                {address.isDefault && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">
                    {t('account.default')}  {/* ✅ */}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{address.address}</p>
              <div className="flex gap-2 mt-3">
                <button className="text-sm text-blue-600 hover:underline">{t('common.edit')}</button>  {/* ✅ */}
                <button className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>  {/* ✅ */}
                {!address.isDefault && (
                  <button className="text-sm text-green-600 hover:underline">
                    {t('account.setAsDefault')}  {/* ✅ */}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// WishlistTab
const WishlistTab = ({ locationKey }) => {
  const { t } = useTranslation()  // ✅
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [locationKey])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await userService.getWishlist()

      let items = []
      if (Array.isArray(response.data?.data)) {
        items = response.data.data
      } else if (Array.isArray(response.data?.data?.wishlist)) {
        items = response.data.data.wishlist
      } else if (Array.isArray(response.data)) {
        items = response.data
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist
      }

      setWishlist(items)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {t('account.wishlist')}  {/* ✅ */}
      </h2>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('wishlist.empty')}  {/* ✅ */}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('wishlist.emptyMessage')}  {/* ✅ */}
          </p>
          <Link
            to="/products"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('home.exploreProducts')}  {/* ✅ */}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id || item.productId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white">{item.name}</h4>
              <p className="text-blue-600 font-bold">₹{item.price}</p>
              <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                {t('product.addToCart')}  {/* ✅ */}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ReviewsTab
const ReviewsTab = ({ locationKey }) => {
  const { t } = useTranslation()  // ✅
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [locationKey])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await userService.getReviews()

      let reviewsData = []
      if (Array.isArray(response.data?.data)) {
        reviewsData = response.data.data
      } else if (Array.isArray(response.data?.data?.reviews)) {
        reviewsData = response.data.data.reviews
      } else if (Array.isArray(response.data)) {
        reviewsData = response.data
      } else if (Array.isArray(response.data?.reviews)) {
        reviewsData = response.data.reviews
      }

      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {t('account.reviews')}  {/* ✅ */}
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('account.noReviews')}  {/* ✅ */}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('account.noReviewsMessage')}  {/* ✅ */}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {review.productName}
                </h4>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:underline">{t('common.edit')}</button>  {/* ✅ */}
                  <button className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>  {/* ✅ */}
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                {'⭐'.repeat(review.rating || 4)}
                {'☆'.repeat(5 - (review.rating || 4))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {review.comment}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// SettingsTab
const SettingsTab = ({ user }) => {
  const { t } = useTranslation()  // ✅
  const { addNotification } = useNotification()

  const handleSaveProfile = (e) => {
    e.preventDefault()
    addNotification(t('account.profileUpdated'), 'success')  // ✅
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    addNotification(t('account.passwordChanged'), 'success')  // ✅
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {t('account.settings')}  {/* ✅ */}
      </h2>

      <form onSubmit={handleSaveProfile} className="mb-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('account.personalInfo')}  {/* ✅ */}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.firstName')}  {/* ✅ */}
            </label>
            <input
              type="text"
              defaultValue={user?.firstName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.lastName')}  {/* ✅ */}
            </label>
            <input
              type="text"
              defaultValue={user?.lastName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('checkout.email')}  {/* ✅ */}
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('checkout.phone')}  {/* ✅ */}
            </label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('account.saveChanges')}  {/* ✅ */}
        </button>
      </form>

      <form
        onSubmit={handleChangePassword}
        className="border-t border-gray-200 dark:border-gray-700 pt-6"
      >
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('account.changePassword')}  {/* ✅ */}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('account.currentPassword')}  {/* ✅ */}
            </label>
            <input              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.newPassword')}  {/* ✅ */}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.confirmPassword')}  {/* ✅ */}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('account.changePassword')}  {/* ✅ */}
        </button>
      </form>
    </div>
  )
}

export default Account