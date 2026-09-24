import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'  // ✅ ADD
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Product/ProductCard'
import { FiHeart, FiShare2, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { t } = useTranslation()  // ✅ ADD HOOK
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) fetchWishlist()
  }, [isAuthenticated, location.key])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await userService.getWishlist()

      let items = []
      if (Array.isArray(response.data?.data)) {
        items = response.data.data
      } else if (Array.isArray(response.data?.data?.wishlist)) {
        items = response.data.data.wishlist
      } else if (Array.isArray(response.data)) {
        items = response.data
      } else if (Array.isArray(response.data?.wishlist)) {
        items = response.data.wishlist
      }

      setWishlistItems(items)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await userService.removeFromWishlist(productId)
      setWishlistItems(prev =>
        prev.filter(item => item.id !== productId && item.productId !== productId)
      )
      toast.success(t('wishlist.removed'))  // ✅ TRANSLATED
    } catch (error) {
      toast.error(t('wishlist.removeFailed'))  // ✅ TRANSLATED
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('wishlist.loginRequired')}  {/* ✅ TRANSLATED */}
        </h2>
        <Link
          to="/auth/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('wishlist.loginNow')}  {/* ✅ TRANSLATED */}
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('wishlist.empty')}  {/* ✅ TRANSLATED */}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('wishlist.emptyMessage')}  {/* ✅ TRANSLATED */}
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('home.exploreProducts')}  {/* ✅ TRANSLATED */}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {t('wishlist.title')}  {/* ✅ TRANSLATED */}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {wishlistItems.length} {t('cart.items')}  {/* ✅ TRANSLATED */}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiShoppingBag size={18} />
            {t('wishlist.addAllToCart')}  {/* ✅ TRANSLATED */}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <FiShare2 size={18} />
            {t('wishlist.share')}  {/* ✅ TRANSLATED */}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((product) => (
          <div key={product.id || product.productId} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => handleRemoveFromWishlist(product.id || product.productId)}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-lg transition-shadow"
              title={t('wishlist.removeFromWishlist')}  // ✅ TRANSLATED (tooltip)
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