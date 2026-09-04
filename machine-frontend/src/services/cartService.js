import api from './api'

export const cartService = {
  // Get cart
  getCart: () => {
    return api.get('/cart')
  },

  // Add to cart
  addToCart: (productId, quantity = 1, variantId = null) => {
    return api.post('/cart', { productId, quantity, variantId })
  },

  // Update cart item
  updateCartItem: (itemId, quantity) => {
    return api.put(`/cart/${itemId}`, { quantity })
  },

  // Remove from cart
  removeFromCart: (itemId) => {
    return api.delete(`/cart/${itemId}`)
  },

  // Clear cart
  clearCart: () => {
    return api.delete('/cart')
  },

  // Apply promo code
  applyPromoCode: (code) => {
    return api.post('/cart/promo', { code })
  },

  // Remove promo code
  removePromoCode: () => {
    return api.delete('/cart/promo')
  }
}