import api from './api'

export const paymentService = {
  processPayment: (paymentData) => {
    return api.post('/payment/process', paymentData)
  },

  verifyPayment: (paymentId, orderId) => {
    return api.post('/payment/verify', { paymentId, orderId })
  },

  getPaymentStatus: (orderId) => {
    return api.get(`/payment/${orderId}/status`)
  },

  createRazorpayOrder: (amount) => {
    return api.post('/payment/razorpay/order', { amount })
  },

  verifyRazorpayPayment: (data) => {
    return api.post('/payment/razorpay/verify', data)
  }
}