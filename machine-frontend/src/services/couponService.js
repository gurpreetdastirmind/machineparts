import api from './api'

export const couponService = {
  // Get home page coupons (public)
  getHomeCoupons: () => {
    return api.get('/coupons/home')
  },

  // Validate coupon (public)
  validateCoupon: (code, orderAmount) => {
    return api.post('/coupons/validate', { code, orderAmount })
  },

  // Admin: Get all coupons
  getAllCoupons: () => {
    return api.get('/coupons')
  },

  // Admin: Get coupon by ID
  getCouponById: (id) => {
    return api.get(`/coupons/${id}`)
  },

  // Admin: Create coupon
  createCoupon: (couponData) => {
    return api.post('/coupons', couponData)
  },

  // Admin: Update coupon
  updateCoupon: (id, couponData) => {
    return api.put(`/coupons/${id}`, couponData)
  },

  // Admin: Delete coupon
  deleteCoupon: (id) => {
    return api.delete(`/coupons/${id}`)
  }
}