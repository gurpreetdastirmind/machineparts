import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import ProductCard from '../components/Product/ProductCard'
import { FiSearch, FiX } from 'react-icons/fi'

const Search = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await productService.getProducts({ search: query })
      setProducts(response.data.products || [])
      setTotalResults(response.data.total || 0)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <form className="relative">
          <input
            type="text"
            defaultValue={query}
            placeholder="Search for products..."
            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          {query && (
            <Link
              to="/search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </Link>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Search results for: "{query}"
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{totalResults} results found</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No products found for "{query}"
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try checking your spelling or using different keywords
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Popular searches:</span>
            <button className="text-sm text-blue-600 hover:underline">presser foot</button>
            <button className="text-sm text-blue-600 hover:underline">needle</button>
            <button className="text-sm text-blue-600 hover:underline">sewing machine</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search