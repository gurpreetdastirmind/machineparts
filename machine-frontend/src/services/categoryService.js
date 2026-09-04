import api from './api'

export const categoryService = {
  getCategories: (params = {}) => {
    return api.get('/categories', { params })
  },

  createCategory: (categoryData) => {
    return api.post('/admin/categories', categoryData)
  },

  getCategoryById: (id) => {
    return api.get(`/categories/${id}`)
  },

  getCategoryBySlug: (slug) => {
    return api.get(`/categories/slug/${slug}`)
  },

  updateCategory: (id, categoryData) => {
    return api.put(`/admin/categories/${id}`, categoryData)
  },

  deleteCategory: (id) => {
    return api.delete(`/admin/categories/${id}`)
  }
}