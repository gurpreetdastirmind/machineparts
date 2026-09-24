import api from './api'

export const userService = {
  getAddresses: () => {
    return api.get('/user/addresses')
  },

  addAddress: (address) => {
    return api.post('/user/addresses', address)
  },

  updateAddress: (id, address) => {
    return api.put(`/user/addresses/${id}`, address)
  },

  deleteAddress: (id) => {
    return api.delete(`/user/addresses/${id}`)
  },

  setDefaultAddress: (id) => {
    return api.put(`/user/addresses/${id}/default`)
  },

  getWishlist: () => {
    return api.get('/user/wishlist')
  },

  addToWishlist: (productId) => {
    return api.post('/user/wishlist', { productId })
  },

  removeFromWishlist: (productId) => {
    return api.delete(`/user/wishlist/${productId}`)
  },

  getReviews: () => {
    return api.get('/user/reviews')
  },

  deleteReview: (reviewId) => {
    return api.delete(`/user/reviews/${reviewId}`)
  },
    getAllUsers: () => {
    return api.get('/admin/users')
  }
}