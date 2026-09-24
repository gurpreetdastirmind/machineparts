// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiPackage, FiUsers, FiShoppingBag, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiArrowRight,
  FiClock, FiAlertCircle, FiSettings
} from 'react-icons/fi'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { userService } from '../../services/userService'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  })
  const [loading, setLoading] = useState(true)

  const location = useLocation()

  // ✅ Re-fetch dashboard data whenever we navigate to this page
  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      try {
        // 1. Get total products count
        const productsRes = await productService.getProducts({ limit: 100 })
        let productsData = []
        if (productsRes.data?.data?.products) {
          productsData = productsRes.data.data.products
        } else if (productsRes.data?.products) {
          productsData = productsRes.data.products
        } else if (Array.isArray(productsRes.data?.data)) {
          productsData = productsRes.data.data
        } else if (Array.isArray(productsRes.data)) {
          productsData = productsRes.data
        }

        // Get low stock products (stock < 10)
        const lowStock = productsData.filter(p => (p.stock || 0) < 10)

        // 2. Get all orders
        let allOrders = []
        let recentOrders = []
        let totalRevenue = 0
        let totalOrders = 0

        try {
          const ordersRes = await orderService.getAllOrders()
          console.log('Orders Response:', ordersRes.data)

          if (ordersRes.data?.data) {
            if (Array.isArray(ordersRes.data.data)) {
              allOrders = ordersRes.data.data
            } else if (ordersRes.data.data.orders && Array.isArray(ordersRes.data.data.orders)) {
              allOrders = ordersRes.data.data.orders
            }
          } else if (Array.isArray(ordersRes.data)) {
            allOrders = ordersRes.data
          } else if (ordersRes.data?.orders && Array.isArray(ordersRes.data.orders)) {
            allOrders = ordersRes.data.orders
          }

          // Calculate total orders and revenue
          totalOrders = allOrders.length

          // Calculate total revenue
          allOrders.forEach(order => {
            totalRevenue += (order.totalAmount || order.total || 0)
          })

          // Get recent orders (last 5)
          recentOrders = allOrders.slice(0, 5)

        } catch (orderError) {
          console.error('Error fetching orders:', orderError)
        }

        // 3. Get total users
        let totalUsers = 0
        try {
          const usersRes = await userService.getAllUsers()
          console.log('Users Response:', usersRes.data)

          let usersData = []
          if (usersRes.data?.data?.users) {
            usersData = usersRes.data.data.users
          } else if (usersRes.data?.users) {
            usersData = usersRes.data.users
          } else if (Array.isArray(usersRes.data?.data)) {
            usersData = usersRes.data.data
          } else if (Array.isArray(usersRes.data)) {
            usersData = usersRes.data
          }

          totalUsers = usersData.length

        } catch (userError) {
          console.error('Error fetching users:', userError)
        }

        setStats({
          totalProducts: productsData.length,
          totalOrders: totalOrders,
          totalUsers: totalUsers,
          totalRevenue: totalRevenue,
          recentOrders: recentOrders,
          lowStockProducts: lowStock.slice(0, 5)
        })

      } catch (error) {
        console.error('Error fetching data:', error)
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          recentOrders: [],
          lowStockProducts: []
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    Delivered: 'bg-emerald-100 text-emerald-700',
    Processing: 'bg-amber-100 text-amber-700',
    Shipped: 'bg-blue-100 text-blue-700',
    Pending: 'bg-gray-100 text-gray-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    Delivered: '✅',
    Processing: '⏳',
    Shipped: '📦',
    Pending: '⏰',
    Cancelled: '❌',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      change: '0%',
      trend: 'up'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      change: '0%',
      trend: 'up'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      change: '0%',
      trend: 'up'
    },
    {
      label: 'Revenue',
      value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`,
      icon: FiDollarSign,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      change: '0%',
      trend: 'up'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} flex-shrink-0`}>
                <stat.icon className={`${stat.text}`} size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {stat.trend === 'up' ? (
                <FiTrendingUp className="text-emerald-500" size={14} />
              ) : (
                <FiTrendingDown className="text-red-500" size={14} />
              )}
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-500" size={18} />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Recent Orders
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {order.orderNumber || order.id || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.customer || 'Guest'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-semibold text-sm text-gray-800">
                      ₹{order.totalAmount || order.total || 0}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-lg ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusIcons[order.status]} {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No recent orders</p>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-amber-500" size={18} />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Low Stock Products
              </h3>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Manage <FiArrowRight size={14} />
            </Link>
          </div>
          {stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700 truncate flex-1 min-w-0 mr-2">
                    {product.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${((product.stock || 0) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-red-600 w-8 text-right">
                      {product.stock || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">All products are well stocked ✅</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Add Product', icon: FiPackage, path: '/admin/products/add', color: 'from-blue-500 to-blue-600' },
          { label: 'Manage Orders', icon: FiShoppingBag, path: '/admin/orders', color: 'from-emerald-500 to-emerald-600' },
          { label: 'View Users', icon: FiUsers, path: '/admin/users', color: 'from-purple-500 to-purple-600' },
          { label: 'Settings', icon: FiSettings, path: '/admin/settings', color: 'from-amber-500 to-amber-600' },
        ].map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`bg-gradient-to-r ${action.color} rounded-2xl p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-center group`}
          >
            <action.icon
              className="mx-auto mb-2 group-hover:rotate-6 transition-transform"
              size={22}
            />
            <span className="text-xs font-medium block">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard