import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../services/productService'
import ProductCard from '../components/Product/ProductCard'
import FilterSidebar from '../components/Product/FilterSidebar'
import Pagination from '../components/Common/Pagination'
import { FiGrid, FiList, FiChevronDown } from 'react-icons/fi'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: { min: 0, max: 10000 },
    brands: [],
    ratings: 0,
    stockStatus: [],
    qualityType: [],
  })

  const limit = 20

  useEffect(() => {
    fetchProducts()
  }, [currentPage, sortBy, filters, searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        sort: sortBy,
        category: filters.category ? filters.category : '', 
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
        brands: filters.brands.join(','),
        rating: filters.ratings,
        stockStatus: filters.stockStatus.join(','),
        qualityType: filters.qualityType.join(','),
      }
      const response = await productService.getProducts(params)
      
      // ✅ FIX: Exact extraction based on YOUR backend response
      let productsData = []
      let total = 0

      if (response.data?.data) {
        // Your backend wraps it in response.data.data
        if (Array.isArray(response.data.data.products)) {
          productsData = response.data.data.products
          total = response.data.data.total || productsData.length
        } else if (Array.isArray(response.data.data)) {
          productsData = response.data.data
          total = productsData.length
        }
      } else if (Array.isArray(response.data)) {
        productsData = response.data
        total = productsData.length
      }
      
      // ✅ SAFETY NET: Always set total to the actual number of products we received
      // This prevents the page from saying "0 products" when the backend returned data
      if (productsData.length > 0) {
        total = productsData.length;
      }

      setProducts(productsData)
      setTotalProducts(total)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(totalProducts / limit)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Home / <span className="text-gray-800 dark:text-white">Products</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalProducts)} of {totalProducts} products
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600 dark:text-gray-300'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600 dark:text-gray-300'}`}
                >
                  <FiList size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="most-reviewed">Most Reviewed</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {products.map((product) => (
              <div key={product.id} className={viewMode === 'list' ? 'col-span-1' : ''}>
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products