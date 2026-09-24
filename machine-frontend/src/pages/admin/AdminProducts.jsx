// frontend/src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { productService } from '../../services/productService'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiX,
  FiPackage, FiTag, FiDollarSign, FiBox, FiImage,
  FiList, FiCheckCircle, FiXCircle, FiTrendingUp,
  FiStar, FiCalendar, FiFileText
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // ✅ Product details modal state
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Re-fetch whenever we navigate to this page
  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      try {
        const response = await productService.getProducts({ limit: 100 })
        console.log('Products API Response:', response.data)

        let productsData = []

        if (response.data?.data?.products) {
          productsData = response.data.data.products
        } else if (response.data?.products) {
          productsData = response.data.products
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data
        } else if (Array.isArray(response.data)) {
          productsData = response.data
        } else {
          console.log('Unexpected response structure:', response.data)
          const dataObj = response.data || {}
          for (const key in dataObj) {
            if (Array.isArray(dataObj[key])) {
              productsData = dataObj[key]
              break
            }
          }
        }

        console.log('Extracted products:', productsData)

        if (productsData && productsData.length > 0) {
          setProducts(productsData)
        } else {
          setProducts([])
          setError('No products found in the database.')
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        setProducts([])
        setError('Failed to load products from server. Please check your backend connection.')
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products. Please try again.')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await productService.deleteProduct(id)
      toast.success('Product deleted successfully')
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete product')
    }
  }

  // ✅ Open product details modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
  }

  // ✅ Helper: get the main image (from images array or imageUrl)
  const getMainImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (product.imageUrl) return product.imageUrl
    return null
  }

  // ✅ Helper: parse specifications string
  const parseSpecifications = (specs) => {
    if (!specs) return []
    return specs
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes(':'))
      .map(line => {
        const idx = line.indexOf(':')
        return {
          key: line.substring(0, idx).trim(),
          value: line.substring(idx + 1).trim(),
        }
      })
      .filter(s => s.key && s.value)
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={fetchProducts}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <Link
            to="/admin/products/add"
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Add First Product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products in catalog</p>
        </div>
        <Link
          to="/admin/products/add"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 self-start sm:self-center"
        >
          <FiPlus size={18} />
          Add Product
        </Link>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No Products</h3>
          <p className="text-sm text-gray-500 mb-4">
            {search ? 'No products match your search' : 'Start by adding your first product'}
          </p>
          {!search && (
            <Link
              to="/admin/products/add"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getMainImage(product) ? (
                            <img
                              src={getMainImage(product)}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://via.placeholder.com/40x40/cccccc/ffffff?text=N/A'
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                              📷
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ₹{product.discountedPrice || product.price || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          (product.stock || 0) > 10 ? 'text-emerald-600' :
                          (product.stock || 0) > 0 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit2 size={17} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <FiTrash2 size={17} />
                          </button>
                          {/* ✅ FIXED: Now opens the details modal */}
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Product Details"
                          >
                            <FiEye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {getMainImage(product) ? (
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/56x56/cccccc/ffffff?text=N/A'
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xl flex-shrink-0">
                      📷
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-gray-800">₹{product.discountedPrice || product.price || 0}</span>
                      <span className={`text-xs font-medium ${
                        (product.stock || 0) > 10 ? 'text-emerald-600' :
                        (product.stock || 0) > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        Stock: {product.stock || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="min-w-0 pr-3">
                <h2 className="text-xl font-bold text-gray-800 truncate">Product Details</h2>
                <p className="text-sm text-gray-500 truncate">
                  {selectedProduct.name} • SKU: {selectedProduct.sku || 'N/A'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Top: Image + Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Gallery */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                    {getMainImage(selectedProduct) ? (
                      <img
                        src={getMainImage(selectedProduct)}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image'
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <FiImage className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-sm text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip if multiple images */}
                  {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {selectedProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`${selectedProduct.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://via.placeholder.com/56x56/cccccc/ffffff?text=N/A'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Panel */}
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-bold text-blue-600">
                        ₹{selectedProduct.discountedPrice || selectedProduct.price || 0}
                      </span>
                      {selectedProduct.price > selectedProduct.discountedPrice && selectedProduct.discountedPrice > 0 && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            ₹{selectedProduct.price}
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                            Save ₹{(selectedProduct.price - selectedProduct.discountedPrice).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stock Status</p>
                    <div className="flex items-center gap-2">
                      {selectedProduct.stock > 0 ? (
                        <>
                          <FiCheckCircle className="text-emerald-500" size={18} />
                          <span className="text-sm font-medium text-emerald-600">
                            In Stock ({selectedProduct.stock} units)
                          </span>
                        </>
                      ) : (
                        <>
                          <FiXCircle className="text-red-500" size={18} />
                          <span className="text-sm font-medium text-red-600">Out of Stock</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category & Brand */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        <FiTag className="text-purple-500" size={16} />
                        <span className="text-sm text-gray-800 font-medium">
                          {selectedProduct.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Brand</p>
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-blue-500" size={16} />
                        <span className="text-sm text-gray-800 font-medium">
                          {selectedProduct.brand || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(selectedProduct.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedProduct.rating > 0 ? selectedProduct.rating.toFixed(1) : 'No'} rating
                        {' • '}
                        {selectedProduct.reviewCount || 0} reviews
                      </span>
                    </div>
                  </div>

                  {/* Flags / Badges */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.isBestSeller === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg">
                          🏆 Best Seller
                        </span>
                      )}
                      {selectedProduct.isNewArrival === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                          ✨ New Arrival
                        </span>
                      )}
                      {selectedProduct.isHotDeal === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg">
                          🔥 Hot Deal
                        </span>
                      )}
                      {selectedProduct.isFeatured === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg">
                          ⭐ Featured
                        </span>
                      )}
                      {selectedProduct.isBundle === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg">
                          📦 Bundle
                        </span>
                      )}
                      {selectedProduct.isMostPopular === 1 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-lg">
                          📈 Most Popular
                        </span>
                      )}
                      {selectedProduct.isBestSeller !== 1 &&
                       selectedProduct.isNewArrival !== 1 &&
                       selectedProduct.isHotDeal !== 1 &&
                       selectedProduct.isFeatured !== 1 &&
                       selectedProduct.isBundle !== 1 &&
                       selectedProduct.isMostPopular !== 1 && (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FiFileText className="text-blue-500" size={16} />
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {selectedProduct.specifications && (() => {
                const specs = parseSpecifications(selectedProduct.specifications)
                if (specs.length === 0) return null
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FiList className="text-blue-500" size={16} />
                      Specifications
                    </h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {specs.map((spec, idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="py-2 px-4 text-sm font-medium text-gray-600 w-1/3 border-b border-gray-100">
                                {spec.key}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-800 border-b border-gray-100">
                                {spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })()}

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiCalendar size={14} className="text-gray-400" />
                    {selectedProduct.createdAt
                      ? new Date(selectedProduct.createdAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiCalendar size={14} className="text-gray-400" />
                    {selectedProduct.updatedAt
                      ? new Date(selectedProduct.updatedAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex flex-wrap justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Close
              </button>
              <Link
                to={`/admin/products/${selectedProduct.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiEdit2 size={16} />
                Edit Product
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts