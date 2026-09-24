// frontend/src/pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag,
  FiActivity, FiBarChart2, FiUsers, FiPackage, FiRefreshCw,
  FiCalendar
} from 'react-icons/fi'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts'
import { orderService } from '../../services/orderService'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Pending: '#9CA3AF',
  Processing: '#F59E0B',
  Shipped: '#3B82F6',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
}

const BAR_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4']

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const location = useLocation()

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await orderService.getAnalytics()
      if (response.data?.success) {
        setAnalytics(response.data.data)
      } else {
        toast.error('No analytics data received')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
  const fmtShort = (n) => {
    const v = Number(n || 0)
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
    return `₹${v}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No analytics data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Start receiving orders to see analytics
        </p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <FiRefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  // ============================================================
  // ✅ DEFENSIVE DEFAULTS — prevents "undefined" crashes
  // ============================================================
  const s = analytics.summary || {}
  const revenueTrend = analytics.revenueTrend || []
  const monthlyTrend = analytics.monthlyTrend || []
  const topProducts = analytics.topProducts || []
  const statusBreakdown = analytics.statusBreakdown || []
  const categoryStats = analytics.categoryStats || []
  const topCustomers = analytics.topCustomers || []

  // Safe weekly total
  const weeklyTotal = revenueTrend.reduce((sum, d) => sum + (d.revenue || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your store's performance with live charts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPI CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {fmtShort(s.totalRevenue)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 flex-shrink-0">
              <FiDollarSign className="text-amber-600" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {s.monthChange >= 0 ? (
              <FiTrendingUp className="text-emerald-500" size={14} />
            ) : (
              <FiTrendingDown className="text-red-500" size={14} />
            )}
            <span
              className={`text-xs font-medium ${
                s.monthChange >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {s.monthChange >= 0 ? '+' : ''}{s.monthChange || 0}%
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {s.totalOrders || 0}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 flex-shrink-0">
              <FiShoppingBag className="text-emerald-600" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <FiActivity className="text-blue-500" size={14} />
            <span className="text-xs text-gray-500">
              {fmtShort(s.thisMonthRevenue)} this month
            </span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Avg Order Value
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {fmtShort(s.avgOrderValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 flex-shrink-0">
              <FiBarChart2 className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <FiActivity className="text-gray-400" size={14} />
            <span className="text-xs text-gray-400">per order</span>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Today's Revenue
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                {fmtShort(s.todayRevenue)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 flex-shrink-0">
              <FiCalendar className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {s.revenueChange >= 0 ? (
              <FiTrendingUp className="text-emerald-500" size={14} />
            ) : (
              <FiTrendingDown className="text-red-500" size={14} />
            )}
            <span
              className={`text-xs font-medium ${
                s.revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {s.revenueChange >= 0 ? '+' : ''}{s.revenueChange || 0}%
            </span>
            <span className="text-xs text-gray-400">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* REVENUE TREND + ORDER STATUS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue trend (7 days) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiActivity className="text-blue-500" size={18} />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800">
                  Revenue Trend
                </h3>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Weekly Total</p>
              <p className="font-bold text-gray-800">{fmt(weeklyTotal)}</p>
            </div>
          </div>

          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [fmt(value), 'Revenue']
                    if (name === 'orders') return [value, 'Orders']
                    return [value, name]
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#revGrad)"
                  dot={{ r: 4, fill: '#3B82F6' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Order status donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-purple-500" size={18} />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Order Status
              </h3>
              <p className="text-xs text-gray-500">Current distribution</p>
            </div>
          </div>

          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MONTHLY TREND */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-emerald-500" size={18} />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              Monthly Revenue
            </h3>
            <p className="text-xs text-gray-500">Last 6 months performance</p>
          </div>
        </div>

        {monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value) => [fmt(value), 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No monthly data yet
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TOP PRODUCTS + CATEGORY STATS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top selling */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-emerald-500" size={18} />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Top Selling Products
              </h3>
              <p className="text-xs text-gray-500">By quantity sold</p>
            </div>
          </div>

          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#374151' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'qty') return [value, 'Qty Sold']
                    return [value, name]
                  }}
                />
                <Bar dataKey="qty" radius={[0, 6, 6, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No sales yet
            </div>
          )}
        </div>

        {/* Category stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="text-blue-500" size={18} />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Products by Category
              </h3>
              <p className="text-xs text-gray-500">Inventory breakdown</p>
            </div>
          </div>

          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value) => [value, 'Products']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryStats.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No categories yet
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP CUSTOMERS */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="text-purple-500" size={18} />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              Top Customers
            </h3>
            <p className="text-xs text-gray-500">Highest spenders</p>
          </div>
        </div>

        {topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? 'bg-amber-100 text-amber-700'
                            : i === 1
                            ? 'bg-gray-200 text-gray-700'
                            : i === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {c.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500 hidden sm:table-cell">{c.email}</td>
                    <td className="py-3 text-sm text-gray-700 text-right">{c.orders}</td>
                    <td className="py-3 text-sm font-semibold text-gray-800 text-right">
                      {fmt(c.spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No customers with orders yet
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAnalytics