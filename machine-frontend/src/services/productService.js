// frontend/src/services/productService.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productService = {
  // Get all products with filters
  getProducts: (params = {}) => {
    return api.get('/products', { params })
  },

  // Get single product - FIXED to handle response properly
  getProductById: (id) => {
    return api.get(`/products/${id}`)
  },

  // Admin: Create product
  createProduct: (data) => {
    return api.post('/admin/products', data)
  },

  // Admin: Update product
  updateProduct: (id, data) => {
    return api.put(`/admin/products/${id}`, data)
  },

  // Admin: Delete product
  deleteProduct: (id) => {
    return api.delete(`/admin/products/${id}`)
  },

  // Get featured products
  getFeaturedProducts: () => {
    return api.get('/products/featured')
  },

  // Get hot deals
  getHotDeals: () => {
    return api.get('/products/hot-deals')
  },

  // Get product reviews
  getProductReviews: (productId) => {
    return api.get(`/products/${productId}/reviews`)
  },

  // Get related products
  getRelatedProducts: (productId) => {
    return api.get(`/products/${productId}/related`)
  }
}