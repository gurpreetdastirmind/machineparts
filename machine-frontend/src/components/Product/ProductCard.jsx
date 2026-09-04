// frontend/src/components/Product/ProductCard.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { FiHeart, FiShoppingCart, FiStar, FiGift } from 'react-icons/fi'

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { addNotification } = useNotification()

  const discountedPrice = product.discountedPrice || product.price
  const originalPrice = product.price
  // ✅ No longer calculating or showing discount percentage

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      addNotification('Please login to add to wishlist', 'error')
      return
    }
    setInWishlist(!inWishlist)
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <Link to={`/products/${product.id}`} className="sm:w-48 h-48 flex-shrink-0 relative">
            <img
              src={product.imageUrl || 'https://via.placeholder.com/200'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <Link to={`/products/${product.id}`}>
                <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-xl font-bold text-blue-600">₹{discountedPrice}</span>
                {originalPrice > discountedPrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">₹{originalPrice}</span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=Product'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          
          {/* ✅ REMOVED: Bundle & Save badge */}
          {/* ✅ REMOVED: Discount % badge */}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded">Out of Stock</span>
            </div>
          )}
          
          {/* Quick actions on hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-2 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-blue-600">₹{discountedPrice}</span>
            {originalPrice > discountedPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleWishlist}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium ${
            product.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-yellow-600">(Only {product.stock} left)</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard