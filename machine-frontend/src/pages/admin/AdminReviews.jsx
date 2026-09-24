// frontend/src/pages/admin/AdminReviews.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiSearch, FiTrash2, FiStar, FiUser, FiPackage,
  FiRefreshCw, FiCalendar, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'
import { productService } from '../../services/productService'
import toast from 'react-hot-toast'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState('All')

  const location = useLocation()

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await productService.getAllReviews()

      let data = []
      if (response.data?.data) {
        data = response.data.data
      } else if (Array.isArray(response.data)) {
        data = response.data
      }

      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      await productService.deleteReviewAdmin(id)
      toast.success('Review deleted successfully')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={14}
            className={
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter((r) => {
    const term = search.toLowerCase()
    const matchesSearch =
      String(r.userName || '').toLowerCase().includes(term) ||
      String(r.comment || '').toLowerCase().includes(term) ||
      String(r.title || '').toLowerCase().includes(term) ||
      String(r.productName || '').toLowerCase().includes(term)

    const matchesRating =
      filterRating === 'All' || Number(r.rating) === Number(filterRating)

    return matchesSearch && matchesRating
  })

  // Stats
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
      : '0.0'
  const fiveStars = reviews.filter((r) => r.rating === 5).length
  const lowRatings = reviews.filter((r) => r.rating <= 2).length

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate customer reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            {filteredReviews.length} reviews
          </span>
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalReviews}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{avgRating} ★</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">5 Star</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fiveStars}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Low (≤2★)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{lowRatings}</p>
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
            placeholder="Search reviews..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars ★★★★★</option>
          <option value="4">4 Stars ★★★★</option>
          <option value="3">3 Stars ★★★</option>
          <option value="2">2 Stars ★★</option>
          <option value="1">1 Star ★</option>
        </select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No reviews found</h3>
          <p className="text-sm text-gray-500">
            {search ? 'No reviews match your search' : 'Customer reviews will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Info */}
                <div className="flex items-center gap-3 md:w-64 flex-shrink-0">
                  {review.productImage ? (
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/48x48/cccccc/ffffff?text=N/A'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <FiPackage size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/products/${review.productId}`}
                      target="_blank"
                      className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block"
                    >
                      {review.productName || 'Unknown Product'}
                    </Link>
                    <p className="text-xs text-gray-500">
                      SKU: {review.productSku || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Review Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {review.userName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {review.userName || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {renderStars(review.rating || 0)}
                          <span className="text-xs text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Review"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-800 mb-1">
                      {review.title}
                    </h4>
                  )}

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={12} />
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReviews