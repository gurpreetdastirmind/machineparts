import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      try {
        const response = await productService.getProducts({ limit: 100 })
        console.log('Products API Response:', response.data)
        
        let productsData = []
        
        // Check various response structures
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
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete product')
    }
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
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
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
                          <Link
                            to={`/products/${product.id}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View on site"
                          >
                            <FiEye size={17} />
                          </Link>
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
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminProducts