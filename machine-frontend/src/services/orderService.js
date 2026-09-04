import api from './api'

export const orderService = {
  createOrder: (orderData) => {
    return api.post('/orders', orderData)
  },

  getOrders: (params = {}) => {
    return api.get('/user/orders', { params })
  },

  getOrderById: (orderId) => {
    return api.get(`/user/orders/${orderId}`)
  },

  cancelOrder: (orderId) => {
    return api.post(`/orders/${orderId}/cancel`)
  },

  getOrderStatus: (orderId) => {
    return api.get(`/orders/${orderId}/status`)
  },

  trackOrder: (trackingNumber) => {
    return api.get(`/orders/track/${trackingNumber}`)
  },

  generateInvoice: (orderId) => {
    return api.get(`/orders/${orderId}/invoice`)
  }
}