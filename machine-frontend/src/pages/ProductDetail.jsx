// frontend/src/pages/ProductDetail.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiStar, FiHeart, FiShare2, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw, FiChevronRight } from 'react-icons/fi'
import { FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ProductCard from '../components/Product/ProductCard'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [inWishlist, setInWishlist] = useState(false)
  const [error, setError] = useState(null)
  
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const imageRef = useRef()

  useEffect(() => {
    if (id) {
      fetchProductDetails()
    }
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching product with ID:', id)
      
      const response = await productService.getProductById(id)
      console.log('📦 Product API Response:', response.data)
      
      let productData = null
      if (response.data?.data) {
        productData = response.data.data
      } else if (response.data) {
        productData = response.data
      }
      
      if (!productData) {
        throw new Error('No product data received')
      }
      
      console.log('✅ Product loaded:', productData)
      
      setProduct(productData)
      
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0])
      }
      
      setQuantity(Math.min(1, productData.stock || 1))
      
      try {
        const reviewsRes = await productService.getProductReviews(id)
        if (reviewsRes.data?.data) {
          setReviews(reviewsRes.data.data)
        } else if (Array.isArray(reviewsRes.data)) {
          setReviews(reviewsRes.data)
        } else {
          setReviews([])
        }
      } catch (err) {
        setReviews([])
      }
      
      try {
        const relatedRes = await productService.getRelatedProducts(id)
        if (relatedRes.data?.data) {
          setRelatedProducts(relatedRes.data.data)
        } else if (Array.isArray(relatedRes.data)) {
          setRelatedProducts(relatedRes.data)
        } else {
          setRelatedProducts([])
        }
      } catch (err) {
        setRelatedProducts([])
      }
      
    } catch (error) {
      console.error('❌ Error fetching product:', error)
      setError(error.message || 'Failed to load product details')
      toast.error('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    const maxStock = product?.stock || 10
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }
    addToCart(product, quantity)
}

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    setInWishlist(!inWishlist)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {error || 'Product not found'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Products
        </Link>
      </div>
    )
  }

  const images = []
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images.push(...product.images)
  }
  if (product.imageUrl) {
    images.push(product.imageUrl)
  }
  if (images.length === 0) {
    images.push('https://via.placeholder.com/800x800/cccccc/ffffff?text=No+Image')
  }

  const price = product.discountedPrice || product.price || 0
  const originalPrice = product.price || 0
  const discountPercentage = originalPrice > price && price > 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  const stock = product.stock || 0
  const inStock = stock > 0

  const rating = product.rating || 0
  const reviewCount = product.reviewCount || 0
  const productName = product.name || 'Product'

  return (
    <div className="container-custom py-8 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Home / <Link to="/products" className="hover:text-blue-600">Products</Link> / 
        <span className="text-gray-800 dark:text-white"> {productName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Product Images - FULL WIDTH */}
        <div className="lg:col-span-1">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              ref={imageRef}
              src={images[selectedImage] || images[0]}
              alt={productName}
              className="w-full h-auto max-h-[500px] p-4"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x800/cccccc/ffffff?text=No+Image'
              }}
            />
            {discountPercentage > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {discountPercentage}% OFF
              </span>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-2xl bg-red-600 px-6 py-3 rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery - Full width */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === index ? 'border-blue-600 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${productName} ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80/cccccc/ffffff?text=No+Image'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right - Product Info */}
        <div className="lg:col-span-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {productName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            SKU: {product.sku || 'N/A'}
          </p>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {rating > 0 ? rating.toFixed(1) : 'No'} ({reviewCount || 0} reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-blue-600">₹{price.toFixed(2)}</span>
              {originalPrice > price && price > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{originalPrice.toFixed(2)}</span>
                  <span className="text-sm text-green-600 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    Save ₹{(originalPrice - price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4">
            {inStock ? (
              <>
                <FaCheckCircle className="text-green-500" size={16} />
                <span className="text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Description Preview */}
          {product.description && (
            <div className="mb-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              <p>{product.description.length > 200 ? product.description.substring(0, 200) + '...' : product.description}</p>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Quality Variants</h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-sm font-medium">{variant.type || 'Variant'}</span>
                    <span className="text-sm text-gray-500 ml-2">₹{variant.price || variant.discountedPrice || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiMinus size={18} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setQuantity(Math.min(Math.max(val, 1), stock || 10))
                }}
                className="w-12 text-center border-x border-gray-300 dark:border-gray-600 py-2 bg-transparent text-gray-800 dark:text-white"
                min="1"
                max={stock || 10}
                disabled={!inStock}
              />
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleWishlist}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                  inWishlist
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiHeart className={`inline mr-2 ${inWishlist ? 'fill-red-500' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiShare2 size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FiTruck className="text-blue-600" size={20} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-blue-600" size={20} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <FiRefreshCw className="text-blue-600" size={20} />
              <span className="text-sm text-gray-600 dark:text-gray-300">7 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 overflow-x-auto">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'description' ? 'Description' : 
                 tab === 'specifications' ? 'Specifications' : 
                 'Reviews'}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {product.description || 'No description available.'}
              </p>
              {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                <ul className="mt-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="overflow-x-auto">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 px-4 font-medium text-gray-600 dark:text-gray-400">{key}</td>
                        <td className="py-2 px-4 text-gray-800 dark:text-white">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No specifications available.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {reviews.length} Reviews
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar key={star} className={`w-5 h-5 ${
                          star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {rating > 0 ? rating.toFixed(1) : 'No'} average
                    </span>
                  </div>
                </div>
                {isAuthenticated && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Write a Review
                  </button>
                )}
              </div>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400">
                        {review.userName?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800 dark:text-white">{review.userName || 'Anonymous'}</h4>
                          <span className="text-sm text-gray-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{(review.rating || 0)}/5</span>
                        </div>
                        {review.title && (
                          <h5 className="font-medium text-gray-800 dark:text-white mt-1">{review.title}</h5>
                        )}
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{review.comment || review.content || ''}</p>
                        <button className="text-sm text-blue-600 hover:underline mt-2">
                          Helpful ({review.helpfulCount || 0})
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Customers Also Viewed</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail