import React, { useState, useEffect } from 'react'
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'
import { orderService } from '../../services/orderService'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      try {
        // Fetch real orders from API
        const response = await orderService.getOrders()
        console.log('Orders Response:', response.data)
        
        let ordersData = []
        if (response.data?.data?.orders) {
          ordersData = response.data.data.orders
        } else if (response.data?.orders) {
          ordersData = response.data.orders
        } else if (Array.isArray(response.data?.data)) {
          ordersData = response.data.data
        } else if (Array.isArray(response.data)) {
          ordersData = response.data
        }
        
        setOrders(ordersData)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Delivered: 'bg-emerald-100 text-emerald-700',
      Processing: 'bg-amber-100 text-amber-700',
      Shipped: 'bg-blue-100 text-blue-700',
      Pending: 'bg-gray-100 text-gray-700',
      Cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.id || '').toLowerCase().includes(search.toLowerCase()) ||
                         (order.customer || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            {filteredOrders.length} orders
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          >
            <option value="All">All Status</option>
            <option value="Pending">⏰ Pending</option>
            <option value="Processing">⏳ Processing</option>
            <option value="Shipped">📦 Shipped</option>
            <option value="Delivered">✅ Delivered</option>
            <option value="Cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table - Mobile Responsive */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items || 0}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{order.total || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date || order.createdAt || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEye size={17} />
                      </button>
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <FiEdit2 size={17} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer || 'N/A'}</p>
                </div>
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(order.status)}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{order.items || 0} items</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{order.date || order.createdAt || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">₹{order.total || 0}</span>
                  <div className="flex gap-0.5 ml-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FiEye size={15} />
                    </button>
                    <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FiEdit2 size={15} />
                    </button>
                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders