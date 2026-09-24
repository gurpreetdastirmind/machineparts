// frontend/src/pages/Search.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '../services/productService'
import ProductCard from '../components/Product/ProductCard'
import { FiSearch, FiX } from 'react-icons/fi'

const Search = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [inputValue, setInputValue] = useState(query)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  // Sync input when URL changes
  useEffect(() => {
    setInputValue(query)
  }, [query])

  useEffect(() => {
    if (query && query.trim()) {
      performSearch()
    } else {
      setProducts([])
      setTotalResults(0)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await productService.getProducts({ search: query, limit: 100 })

      let productsData = []
      let total = 0

      if (response.data?.data?.products) {
        productsData = response.data.data.products
        total = response.data.data.total || productsData.length
      } else if (response.data?.products) {
        productsData = response.data.products
        total = response.data.total || productsData.length
      } else if (Array.isArray(response.data?.data)) {
        productsData = response.data.data
        total = productsData.length
      }

      setProducts(productsData)
      setTotalResults(total)
    } catch (error) {
      console.error('Search error:', error)
      setProducts([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  // ✅ X button — ONLY clears and stays on /search
  const handleClear = () => {
    setInputValue('')
    setProducts([])
    setTotalResults(0)
    setLoading(false)
    navigate('/search', { replace: true })
  }

  if (loading && query) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('search.placeholder') || 'Search for products...'}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
          >
            <FiSearch size={20} />
          </button>
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <FiX size={20} />
            </button>
          )}
        </form>
      </div>

      {!query && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Start typing to search
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try searching for "presser foot", "needle", or "sewing machine"
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Popular:</span>
            {['presser foot', 'needle', 'sewing machine', 'bobbin'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                className="text-sm text-blue-600 hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('search.resultsFor') || 'Results for'}: "{query}"
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {totalResults} {t('search.resultsFound') || 'results found'}
          </p>
        </div>
      )}

      {query && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {query && !loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {t('search.noProducts') || 'No products found for'} "{query}"
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('search.tryDifferent') || 'Try a different search term'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('search.popularSearches') || 'Popular:'}
            </span>
            {['presser foot', 'needle', 'sewing machine', 'bobbin'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                className="text-sm text-blue-600 hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Search