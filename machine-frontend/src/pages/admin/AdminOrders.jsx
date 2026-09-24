// frontend/src/pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck } from 'react-icons/fi'
import { orderService } from '../../services/orderService'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const location = useLocation()

  // ✅ Re-fetch orders whenever we navigate to this page
  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      try {
        const response = await orderService.getAllOrders()
        console.log('Orders Response:', response.data)

        let ordersData = []

        if (response.data?.data) {
          if (Array.isArray(response.data.data)) {
            ordersData = response.data.data
          } else if (response.data.data.orders && Array.isArray(response.data.data.orders)) {
            ordersData = response.data.data.orders
          }
        } else if (Array.isArray(response.data)) {
          ordersData = response.data
        } else if (response.data?.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders
        }

        console.log('📋 Extracted orders:', ordersData.length)
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

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true)

      const response = await orderService.updateOrderStatus(orderId, newStatus)
      console.log('Update status response:', response.data)

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`)

        // Update the order in the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            (order.id === orderId || order.orderId === orderId)
              ? { ...order, status: newStatus }
              : order
          )
        )

        // Also update selected order if modal is open
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }))
        }
      } else {
        toast.error(response.data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchTerm = search.toLowerCase()
    const matchesSearch =
      String(order.id || '').toLowerCase().includes(searchTerm) ||
      String(order.orderNumber || '').toLowerCase().includes(searchTerm) ||
      String(order.customer || '').toLowerCase().includes(searchTerm) ||
      String(order.email || '').toLowerCase().includes(searchTerm)

    const matchesStatus = filterStatus === 'All' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedOrder(null)
  }

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

      {/* Orders Table */}
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id || order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {order.orderNumber || order.id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.customer || 'Guest'}
                      <div className="text-xs text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {order.itemCount || order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      ₹{order.totalAmount || order.total || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Order Details"
                        >
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
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id || order.orderId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {order.orderNumber || order.id || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{order.customer || 'Guest'}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{order.itemCount || 0} items</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{order.date || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">₹{order.totalAmount || order.total || 0}</span>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500">#{selectedOrder.orderNumber || selectedOrder.id}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-gray-800">{selectedOrder.customer || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-lg text-gray-800">₹{selectedOrder.totalAmount || selectedOrder.total || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-800">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">Shipping Address</p>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress.fullName}<br />
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}<br />
                    {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}<br />
                    {selectedOrder.shippingAddress.country}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">📞 {selectedOrder.shippingAddress.phone}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      {/* Product Image */}
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/80x80/cccccc/ffffff?text=No+Image'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80x80/cccccc/ffffff?text=No+Image';
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{item.total || item.price * item.quantity || 0}</p>
                        <p className="text-xs text-gray-500">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700">₹{selectedOrder.totalAmount || selectedOrder.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-700">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">₹{selectedOrder.totalAmount || selectedOrder.total || 0}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Update Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId || selectedOrder.id, status)}
                      disabled={updatingStatus || status === selectedOrder.status}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        status === selectedOrder.status
                          ? 'bg-blue-600 text-white cursor-default'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {status === selectedOrder.status && <FiCheck className="inline mr-1" size={14} />}
                      {status}
                    </button>
                  ))}
                </div>
                {updatingStatus && (
                  <p className="text-xs text-blue-600 mt-2">Updating status...</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders