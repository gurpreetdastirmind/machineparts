import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Product/ProductCard'
import { FiHeart, FiShare2, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    try {
      const response = await userService.getWishlist()
      setWishlistItems(response.data || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await userService.removeFromWishlist(productId)
      setWishlistItems(wishlistItems.filter(item => item.id !== productId))
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleAddAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Please login to view wishlist</h2>
        <Link to="/auth/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Login Now
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start adding items you love</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explore Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">My Wishlist</h1>
          <p className="text-gray-500 dark:text-gray-400">{wishlistItems.length} items</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiShoppingBag size={18} />
            Add All to Cart
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <FiShare2 size={18} />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => handleRemoveFromWishlist(product.id)}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-lg transition-shadow"
            >
              <FiHeart className="w-5 h-5 text-red-500 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist