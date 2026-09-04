import React, { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const FilterSidebar = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brand: true,
    rating: true,
    stock: true,
    quality: true,
  })
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 10000 },
    brands: [],
    rating: 0,
    stockStatus: [],
    qualityType: [],
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories()
      
      // ✅ FIX: Extract the array safely from the API response
      let categoriesData = []
      if (Array.isArray(response.data)) {
        categoriesData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories
      } else {
        console.warn('Unexpected categories response structure:', response.data)
      }
      
      // Only set if we have an array
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    })
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters }
    if (key === 'priceRange') {
      newFilters.priceRange = value
    } else if (Array.isArray(newFilters[key])) {
      if (newFilters[key].includes(value)) {
        newFilters[key] = newFilters[key].filter(item => item !== value)
      } else {
        newFilters[key] = [...newFilters[key], value]
      }
    } else {
      newFilters[key] = value
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearAll = () => {
    const resetFilters = {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      brands: [],
      rating: 0,
      stockStatus: [],
      qualityType: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const brands = ['StrongH', 'Jack Original', 'Kansai', 'Juki', 'Brother', 'Singer']
  const qualityTypes = ['Generic', 'Original', 'Premium']
  const stockStatuses = ['In Stock', 'Out of Stock']

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Categories</span>
          {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.categories && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => handleFilterChange('categories', category.slug)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {category.name} ({category.productCount || 0})
              </label>
            ))}
            {/* ✅ Fallback if API returns empty */}
            {categories.length === 0 && (
              <p className="text-xs text-gray-400">No categories available</p>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Price Range</span>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent text-gray-800 dark:text-white"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent text-gray-800 dark:text-white"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              value={filters.priceRange.max}
              onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
              className="w-full mt-2"
            />
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Brands</span>
          {expandedSections.brand ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.brand && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleFilterChange('brands', brand)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {brand}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Ratings */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Rating</span>
          {expandedSections.rating ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.rating && (
          <div className="mt-2 space-y-1">
            {[4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => handleFilterChange('rating', rating)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                {rating}+ Stars
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Stock Status */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Stock Status</span>
          {expandedSections.stock ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.stock && (
          <div className="mt-2 space-y-1">
            {stockStatuses.map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.stockStatus.includes(status)}
                  onChange={() => handleFilterChange('stockStatus', status)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {status}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Quality Type */}
      <div className="py-3">
        <button
          onClick={() => toggleSection('quality')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">Quality Type</span>
          {expandedSections.quality ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.quality && (
          <div className="mt-2 space-y-1">
            {qualityTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.qualityType.includes(type)}
                  onChange={() => handleFilterChange('qualityType', type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {type}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterSidebar  