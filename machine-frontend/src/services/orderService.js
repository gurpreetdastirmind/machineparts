// frontend/src/services/orderService.js
import api from './api'

export const orderService = {
  // Create a new order
  createOrder: (orderData) => {
    return api.post('/orders', orderData)
  },

  // Get user's orders
  getOrders: () => {
    return api.get('/orders')
  },

  // Get order by ID
  getOrderById: (orderId) => {
    return api.get(`/orders/${orderId}`)
  },

  // Admin: Get all orders
  getAllOrders: () => {
    return api.get('/admin/orders')
  },

  // Admin: Update order status
  updateOrderStatus: (orderId, status) => {
    return api.put(`/admin/orders/${orderId}/status`, { status })
  },

  getAnalytics: () => {
    return api.get('/admin/analytics')
  },

  // Cancel order (user)
  cancelOrder: (orderId) => {
    return api.post(`/orders/${orderId}/cancel`)
  },

  // Get order status
  getOrderStatus: (orderId) => {
    return api.get(`/orders/${orderId}/status`)
  },

  // Track order by tracking number
  trackOrder: (trackingNumber) => {
    return api.get(`/orders/track/${trackingNumber}`)
  },

  // Generate invoice
  generateInvoice: (orderId) => {
    return api.get(`/orders/${orderId}/invoice`)
  }
}