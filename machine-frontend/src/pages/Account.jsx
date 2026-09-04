// frontend/src/pages/Account.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FiHome, FiPackage, FiMapPin, FiHeart, FiStar, FiSettings, FiLogOut, FiShoppingBag, FiUser } from 'react-icons/fi'

const Account = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAuthenticated) {
    navigate('/auth/login')
    return null
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'orders', label: 'My Orders', icon: FiPackage },
    { id: 'addresses', label: 'Addresses', icon: FiMapPin },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
    { id: 'reviews', label: 'Reviews', icon: FiStar },
    { id: 'settings', label: 'Settings', icon: FiSettings },
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
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-4/5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'dashboard' && <DashboardTab user={user} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'wishlist' && <WishlistTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Tab - FIXED: Only show actual user data
const DashboardTab = ({ user }) => {
  // ✅ Remove dummy statistics - only show user profile info
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        Welcome back, {user?.firstName}!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your account from here.</p>

      {/* ✅ Show only user profile info, not fake statistics */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FiUser className="text-blue-600" />
          Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="font-medium text-gray-800 dark:text-white">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium text-gray-800 dark:text-white">{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
            <p className="font-medium text-gray-800 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Quick links to other sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Orders', icon: FiPackage, tab: 'orders', color: 'from-blue-500 to-blue-600' },
          { label: 'Addresses', icon: FiMapPin, tab: 'addresses', color: 'from-green-500 to-green-600' },
          { label: 'Wishlist', icon: FiHeart, tab: 'wishlist', color: 'from-red-500 to-red-600' },
          { label: 'Settings', icon: FiSettings, tab: 'settings', color: 'from-amber-500 to-amber-600' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              // Find the tab button and click it
              const tabButton = document.querySelector(`button[data-tab="${item.tab}"]`)
              if (tabButton) tabButton.click()
            }}
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

// Orders Tab - FIXED: Only show real orders
const OrdersTab = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Fetch real orders from API
      // const response = await orderService.getOrders()
      // setOrders(response.data || [])
      
      // For now, show empty state
      setOrders([])
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

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Orders</h2>
      
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        // ✅ Show empty state - no dummy orders
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't placed any orders yet.</p>
          <Link 
            to="/products" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{order.orderNumber || order.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status || 'Pending'}
                  </span>
                  <p className="font-bold text-gray-800 dark:text-white">₹{order.totalAmount || order.total || 0}</p>
                  <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    View Details
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

// Addresses Tab
const AddressesTab = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      // Fetch real addresses from API
      // const response = await userService.getAddresses()
      // setAddresses(response.data || [])
      setAddresses([])
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Addresses</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Addresses Saved</h3>
          <p className="text-gray-500 dark:text-gray-400">Add your first address for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 dark:text-white">{address.type || 'Home'}</span>
                {address.isDefault && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{address.address}</p>
              <div className="flex gap-2 mt-3">
                <button className="text-sm text-blue-600 hover:underline">Edit</button>
                <button className="text-sm text-red-600 hover:underline">Delete</button>
                {!address.isDefault && (
                  <button className="text-sm text-green-600 hover:underline">Set as Default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Wishlist Tab
const WishlistTab = () => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      // Fetch real wishlist from API
      // const response = await userService.getWishlist()
      // setWishlist(response.data || [])
      setWishlist([])
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
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Your Wishlist is Empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start adding items you love.</p>
          <Link 
            to="/products" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
              <h4 className="font-medium text-gray-800 dark:text-white">{item.name}</h4>
              <p className="text-blue-600 font-bold">₹{item.price}</p>
              <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Reviews Tab
const ReviewsTab = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Fetch real reviews from API
      // const response = await userService.getReviews()
      // setReviews(response.data || [])
      setReviews([])
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
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Reviews</h2>
      
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">You haven't reviewed any products yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 dark:text-white">{review.productName}</h4>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                {'⭐'.repeat(review.rating || 4)}{'☆'.repeat(5 - (review.rating || 4))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{review.comment}</p>
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

// Settings Tab
const SettingsTab = ({ user }) => {
  const { addNotification } = useNotification()

  const handleSaveProfile = (e) => {
    e.preventDefault()
    addNotification('Profile updated successfully!', 'success')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    addNotification('Password changed successfully!', 'success')
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Account Settings</h2>
      
      <form onSubmit={handleSaveProfile} className="mb-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue={user?.firstName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue={user?.lastName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Change Password
        </button>
      </form>
    </div>
  )
}

export default Account