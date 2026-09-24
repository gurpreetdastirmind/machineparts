// frontend/src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '../services/productService'
import ProductCard from '../components/Product/ProductCard'
import FilterSidebar from '../components/Product/FilterSidebar'
import Pagination from '../components/Common/Pagination'
import { FiGrid, FiList } from 'react-icons/fi'

const Products = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')

  const [filters, setFilters] = useState({
    categories: [],
    partTypes: [],      
    models: [],         
    partNumbers: [],    
    priceRange: { min: 0, max: 10000 },
    brands: [],
    rating: 0,
    stockStatus: [],
    qualityType: [],
  })

  const limit = 20
  const urlCategory = searchParams.get('category') || ''

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    sortBy,
    urlCategory,
    filters.categories.join(','),
    filters.brands.join(','),
    filters.rating,
    filters.stockStatus.join(','),
    filters.qualityType.join(','),
    filters.priceRange.min,
    filters.priceRange.max,
    (filters.partTypes || []).join(','),
  (filters.models || []).join(','),
  (filters.partNumbers || []).join(','),
  ])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const allCategories = [
        ...(urlCategory ? [urlCategory] : []),
        ...filters.categories.filter((c) => c !== urlCategory),
      ]

      const params = {
        page: currentPage,
        limit,
        sort: sortBy,
        category: allCategories.join(','),
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
        brands: filters.brands.join(','),
        rating: filters.rating,
        stockStatus: filters.stockStatus.join(','),
        qualityType: filters.qualityType.join(','),
        partTypes: (filters.partTypes || []).join(','),
        models: (filters.models || []).join(','),
        partNumbers: (filters.partNumbers || []).join(','),
      }

      console.log('🔍 Fetching products with params:', params)

      const response = await productService.getProducts(params)

      let productsData = []
      let total = 0

      if (response.data?.data) {
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

      setProducts(productsData)
      setTotalProducts(total)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setTotalProducts(0)
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

  // ✅ NOTE: NO early return for `loading` — the FilterSidebar must stay
  //    mounted so its checkbox/radio state survives product re-fetches.

  return (
    <div className="container-custom py-8">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('nav.home')} /{' '}
        <span className="text-gray-800 dark:text-white">{t('products.products')}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — always mounted */}
        <div className="lg:w-1/4">
          <FilterSidebar onFilterChange={handleFilterChange} initialCategory={urlCategory} />
        </div>

        <div className="lg:w-3/4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('products.showing')}{' '}
                {totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1} -{' '}
                {Math.min(currentPage * limit, totalProducts)} {t('products.of')} {totalProducts}{' '}
                {t('products.products')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiList size={18} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">{t('products.newest')}</option>
                <option value="price-low">{t('products.priceLow')}</option>
                <option value="price-high">{t('products.priceHigh')}</option>
                <option value="best-sellers">{t('products.bestSellers')}</option>
                <option value="most-reviewed">{t('products.mostReviewed')}</option>
              </select>
            </div>
          </div>

          {/* Products Grid (loading spinner only replaces this part) */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div
                className={`grid ${
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                } gap-4`}
              >
                {products.map((product) => (
                  <div key={product.id} className={viewMode === 'list' ? 'col-span-1' : ''}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {t('products.noProducts')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('products.adjustFilters')}</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products