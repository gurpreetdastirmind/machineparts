// frontend/src/components/Product/FilterSidebar.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import {
  FiChevronDown, FiChevronUp, FiTag, FiHash, FiBox, FiLoader,
} from 'react-icons/fi'

const FilterSidebar = ({ onFilterChange, initialCategory = '' }) => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [dynamicFilters, setDynamicFilters] = useState({
    partTypes: [],
    models: [],
    partNumbers: [],
    totalProducts: 0,
  })
  const [loadingFilters, setLoadingFilters] = useState(false)

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    partTypes: true,
    models: true,
    partNumbers: true,
    price: true,
    brands: true,
    rating: true,
    stock: true,
    quality: true,
  })

  const urlCategory = initialCategory || searchParams.get('category') || ''

  const [filters, setFilters] = useState({
    categories: urlCategory ? [urlCategory] : [],
    partTypes: [],
    models: [],
    partNumbers: [],
    priceRange: { min: 0, max: 10000 },
    brands: [],
    rating: 0,
    stockStatus: [],
    qualityType: [],
  })

  // ✅ Fetch static categories once
  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Sync local state when URL category changes (e.g., navigating from home)
  useEffect(() => {
    if (urlCategory) {
      setFilters((prev) => {
        // Only update if we're switching to a different category
        if (
          prev.categories.length === 1 &&
          prev.categories[0] === urlCategory
        ) {
          return prev  // already synced
        }
        const newFilters = {
          ...prev,
          categories: [urlCategory],
          // Keep part-level filters empty when switching category
          partTypes: [],
          models: [],
          partNumbers: [],
        }
        onFilterChange(newFilters)
        return newFilters
      })

      // Fetch dynamic filters for this category
      fetchDynamicFilters(urlCategory)
    } else {
      // No category → clear dynamic filters
      setDynamicFilters({
        partTypes: [],
        models: [],
        partNumbers: [],
        totalProducts: 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory])

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories()
      let categoriesData = []
      if (Array.isArray(response.data)) {
        categoriesData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories
      }
      if (Array.isArray(categoriesData)) setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // ✅ Fetch DYNAMIC filters from backend
  const fetchDynamicFilters = async (category) => {
    try {
      setLoadingFilters(true)
      const response = await productService.getDynamicFilters(category)

      if (response.data?.success && response.data.data) {
        setDynamicFilters({
          partTypes: response.data.data.partTypes || [],
          models: response.data.data.models || [],
          partNumbers: response.data.data.partNumbers || [],
          totalProducts: response.data.data.totalProducts || 0,
        })
      } else {
        setDynamicFilters({
          partTypes: [],
          models: [],
          partNumbers: [],
          totalProducts: 0,
        })
      }
    } catch (error) {
      console.error('Error fetching dynamic filters:', error)
      setDynamicFilters({
        partTypes: [],
        models: [],
        partNumbers: [],
        totalProducts: 0,
      })
    } finally {
      setLoadingFilters(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters }
    if (key === 'priceRange') {
      newFilters.priceRange = value
    } else if (Array.isArray(newFilters[key])) {
      if (newFilters[key].includes(value)) {
        newFilters[key] = newFilters[key].filter((item) => item !== value)
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
      categories: urlCategory ? [urlCategory] : [],
      partTypes: [],
      models: [],
      partNumbers: [],
      priceRange: { min: 0, max: 10000 },
      brands: [],
      rating: 0,
      stockStatus: [],
      qualityType: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasBrandFilters =
    dynamicFilters.partTypes.length > 0 ||
    dynamicFilters.models.length > 0 ||
    dynamicFilters.partNumbers.length > 0

  const brands = ['StrongH', 'Jack Original', 'Kansai', 'Juki', 'Brother', 'Singer']

  const qualityTypes = [
    { value: 'Generic', label: 'Generic' },
    { value: 'Original', label: 'Original' },
    { value: 'Premium', label: 'Premium' },
  ]

  const stockStatuses = [
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
          {urlCategory && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium uppercase">
              {urlCategory}
            </span>
          )}
        </div>
        <button onClick={handleClearAll} className="text-sm text-blue-600 hover:underline">
          Clear All
        </button>
      </div>

      {/* Loading state */}
      {loadingFilters && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
          <FiLoader className="animate-spin" size={12} />
          Loading filters...
        </div>
      )}

      {/* ============================================================ */}
      {/* DYNAMIC BRAND-SPECIFIC FILTERS */}
      {/* ============================================================ */}
      {hasBrandFilters && (
        <>
          {/* Part Types */}
          {dynamicFilters.partTypes.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 py-3">
              <button
                onClick={() => toggleSection('partTypes')}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiTag size={14} className="text-blue-500" />
                  Part Type
                  <span className="text-xs text-gray-400 font-normal">
                    ({dynamicFilters.partTypes.length})
                  </span>
                </span>
                {expandedSections.partTypes ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {expandedSections.partTypes && (
                <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                  {dynamicFilters.partTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="checkbox"
                        checked={filters.partTypes.includes(type)}
                        onChange={() => handleFilterChange('partTypes', type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Models */}
          {dynamicFilters.models.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 py-3">
              <button
                onClick={() => toggleSection('models')}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiBox size={14} className="text-purple-500" />
                  Machine Model
                  <span className="text-xs text-gray-400 font-normal">
                    ({dynamicFilters.models.length})
                  </span>
                </span>
                {expandedSections.models ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {expandedSections.models && (
                <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                  {dynamicFilters.models.map((model) => (
                    <label
                      key={model}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="checkbox"
                        checked={filters.models.includes(model)}
                        onChange={() => handleFilterChange('models', model)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono text-xs">{model}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Part Numbers */}
          {dynamicFilters.partNumbers.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 py-3">
              <button
                onClick={() => toggleSection('partNumbers')}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiHash size={14} className="text-emerald-500" />
                  Part Number
                  <span className="text-xs text-gray-400 font-normal">
                    ({dynamicFilters.partNumbers.length})
                  </span>
                </span>
                {expandedSections.partNumbers ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {expandedSections.partNumbers && (
                <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                  {dynamicFilters.partNumbers.map((num) => (
                    <label
                      key={num}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="checkbox"
                        checked={filters.partNumbers.includes(num)}
                        onChange={() => handleFilterChange('partNumbers', num)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono text-xs">{num}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* GENERIC FILTERS */}
      {/* ============================================================ */}

      {/* Categories */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Categories
          </span>
          {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.categories && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => handleFilterChange('categories', category.slug)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {category.name} ({category.productCount || 0})
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-gray-400">No categories</p>
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
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Price Range
          </span>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) =>
                  handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: Number(e.target.value),
                  })
                }
                className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent text-gray-800 dark:text-white"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) =>
                  handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: Number(e.target.value),
                  })
                }
                className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent text-gray-800 dark:text-white"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              value={filters.priceRange.max}
              onChange={(e) =>
                handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: Number(e.target.value),
                })
              }
              className="w-full mt-2"
            />
          </div>
        )}
      </div>

      {/* Brands — only when not in a specific brand */}
      {!urlCategory && (
        <div className="border-b border-gray-200 dark:border-gray-700 py-3">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Brands
            </span>
            {expandedSections.brands ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.brands && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                >
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
      )}

      {/* Rating */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Rating
          </span>
          {expandedSections.rating ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.rating && (
          <div className="mt-2 space-y-1">
            {[4, 3, 2].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => handleFilterChange('rating', rating)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                {rating}+ ★
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Stock */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Stock Status
          </span>
          {expandedSections.stock ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.stock && (
          <div className="mt-2 space-y-1">
            {stockStatuses.map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.stockStatus.includes(status.value)}
                  onChange={() => handleFilterChange('stockStatus', status.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {status.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Quality */}
      <div className="py-3">
        <button
          onClick={() => toggleSection('quality')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Quality Type
          </span>
          {expandedSections.quality ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.quality && (
          <div className="mt-2 space-y-1">
            {qualityTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.qualityType.includes(type.value)}
                  onChange={() => handleFilterChange('qualityType', type.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {type.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterSidebar