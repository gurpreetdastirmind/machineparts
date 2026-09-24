// frontend/src/pages/admin/AdminProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import {
    FiArrowLeft, FiSave, FiImage, FiDollarSign,
    FiPercent, FiUploadCloud, FiPlus, FiPackage, FiTrendingUp,
    FiList, FiFileText, FiX, FiTrash2
} from 'react-icons/fi'
import toast from 'react-hot-toast'

// ✅ Define initial form state outside component so we can reset cleanly
const INITIAL_FORM_DATA = {
    name: '',
    sku: '',
    description: '',
    specifications: '',
    price: '',
    discountedPrice: '',
    stock: '',
    category: '',
    brand: '',
    images: [],
    isBestSeller: false,
    isNewArrival: false,
    isHotDeal: false,
    isFeatured: false,
    isBundle: false,
    isMostPopular: false,
}

const MAX_IMAGES = 20

const AdminProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [error, setError] = useState(null)

    const [formData, setFormData] = useState(INITIAL_FORM_DATA)

    const isEditMode = !!id && id !== 'add'

    useEffect(() => {
        console.log('AdminProductDetail mounted with id:', id, 'isEditMode:', isEditMode)
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch categories
            let cats = []
            try {
                const categoriesRes = await categoryService.getCategories()
                console.log('Categories API Response:', categoriesRes.data)

                if (categoriesRes.data?.data) {
                    cats = categoriesRes.data.data
                } else if (Array.isArray(categoriesRes.data)) {
                    cats = categoriesRes.data
                } else if (categoriesRes.data?.categories) {
                    cats = categoriesRes.data.categories
                } else {
                    cats = []
                }
                console.log('Categories loaded:', cats)
            } catch (error) {
                console.warn('API failed, using fallback categories:', error)
            }

            if (cats.length === 0) {
                cats = [
                    { id: 1, name: 'Sewing Parts', slug: 'sewing-parts' },
                    { id: 2, name: 'Cutting', slug: 'cutting' },
                    { id: 3, name: 'Fusing', slug: 'fusing' },
                    { id: 4, name: 'Steam Iron', slug: 'steam-iron' },
                    { id: 5, name: 'Household', slug: 'household' },
                    { id: 6, name: 'Needles', slug: 'needles' },
                    { id: 7, name: 'JUKI', slug: 'juki' },
                    { id: 8, name: 'JACK', slug: 'jack' },
                    { id: 9, name: 'PEGASUS', slug: 'pegasus' },
                    { id: 10, name: 'BROTHER', slug: 'brother' }
                ]
            }
            setCategories(cats)

            if (isEditMode) {
                try {
                    const productRes = await productService.getProductById(id)
                    console.log('Product API Response:', productRes.data)

                    let product = null
                    if (productRes.data?.data) {
                        product = productRes.data.data
                    } else if (productRes.data) {
                        product = productRes.data
                    }

                    if (!product) {
                        throw new Error('No product data received')
                    }

                    console.log('Product loaded:', product)

                    // ✅ Parse images - now comes as an array from the backend
                    let parsedImages = []
                    if (Array.isArray(product.images)) {
                        parsedImages = product.images
                    } else if (product.images && typeof product.images === 'string') {
                        try {
                            const parsed = JSON.parse(product.images)
                            if (Array.isArray(parsed)) {
                                parsedImages = parsed
                            } else {
                                parsedImages = [product.images]
                            }
                        } catch {
                            parsedImages = product.images.split(',').map(img => img.trim()).filter(Boolean)
                        }
                    } else if (product.imageUrl) {
                        parsedImages = [product.imageUrl]
                    }

                    setFormData({
                        name: product.name || '',
                        sku: product.sku || '',
                        description: product.description || '',
                        specifications: product.specifications || '',
                        price: product.price || '',
                        discountedPrice: product.discountedPrice || '',
                        stock: product.stock || '',
                        category: product.category || '',
                        brand: product.brand || '',
                        images: parsedImages.slice(0, MAX_IMAGES),
                        isBestSeller: product.isBestSeller === 1 || product.isBestSeller === true,
                        isNewArrival: product.isNewArrival === 1 || product.isNewArrival === true,
                        isHotDeal: product.isHotDeal === 1 || product.isHotDeal === true,
                        isFeatured: product.isFeatured === 1 || product.isFeatured === true,
                        isBundle: product.isBundle === 1 || product.isBundle === true,
                        isMostPopular: product.isMostPopular === 1 || product.isMostPopular === true,
                    })
                } catch (error) {
                    console.error('Error loading product:', error)
                    toast.error('Failed to load product data')
                    setError('Failed to load product')
                }
            } else {
                setFormData(INITIAL_FORM_DATA)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            setError('Failed to load data. Please try again.')
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // ✅ Handle multiple image uploads
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        
        if (files.length === 0) return

        if (formData.images.length + files.length > MAX_IMAGES) {
            toast.error(`You can only upload up to ${MAX_IMAGES} images. You have ${formData.images.length} already.`)
            return
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Image ${file.name} is larger than 5MB`)
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result]
                }))
            }
            reader.readAsDataURL(file)
        })

        e.target.value = ''
    }

    // ✅ Add image via URL
    const handleAddImageUrl = () => {
        const urlInput = document.getElementById('imageUrlInput')
        const url = urlInput?.value?.trim()
        
        if (!url) {
            toast.error('Please enter an image URL')
            return
        }

        if (formData.images.length >= MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, url]
        }))
        
        if (urlInput) urlInput.value = ''
    }

    // ✅ Remove an image
    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    // ✅ Move image up/down for reordering
    const handleMoveImage = (index, direction) => {
        const newImages = [...formData.images]
        const newIndex = direction === 'up' ? index - 1 : index + 1
        
        if (newIndex < 0 || newIndex >= newImages.length) return
        
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
        
        setFormData(prev => ({
            ...prev,
            images: newImages
        }))
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Please enter a category name')
            return
        }

        try {
            const res = await categoryService.createCategory({ name: newCategoryName.trim() })
            console.log('Add Category Response:', res.data)

            let newCat = null
            if (res.data?.data) {
                newCat = res.data.data
            } else if (res.data) {
                newCat = res.data
            }

            if (!newCat) {
                throw new Error('No category data returned')
            }

            setCategories([...categories, newCat])
            setFormData(prev => ({ ...prev, category: newCat.slug || newCat.name }))
            setShowAddCategory(false)
            setNewCategoryName('')
            toast.success('Category added successfully!')
        } catch (error) {
            console.error('Error adding category:', error)
            toast.error(error.response?.data?.message || 'Failed to add category')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (formData.images.length === 0) {
            toast.error('Please add at least one product image')
            return
        }

        setSaving(true)

        try {
            const productData = {
                name: formData.name,
                sku: formData.sku,
                description: formData.description,
                specifications: formData.specifications,
                price: parseFloat(formData.price) || 0,
                discountedPrice: parseFloat(formData.discountedPrice) || parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                category: formData.category,
                brand: formData.brand,
                images: formData.images, // ✅ Send array of images
                // ❌ REMOVED: imageUrl — backend now handles main image automatically
                isBestSeller: formData.isBestSeller ? 1 : 0,
                isNewArrival: formData.isNewArrival ? 1 : 0,
                isHotDeal: formData.isHotDeal ? 1 : 0,
                isFeatured: formData.isFeatured ? 1 : 0,
                isBundle: formData.isBundle ? 1 : 0,
                isMostPopular: formData.isMostPopular ? 1 : 0,
            }

            console.log('Saving product data:', productData)

            if (isEditMode) {
                await productService.updateProduct(id, productData)
                toast.success('Product updated successfully!')
            } else {
                await productService.createProduct(productData)
                toast.success('Product created successfully!')
            }
            navigate('/admin/products')
        } catch (error) {
            console.error('Save error:', error)
            toast.error(error.response?.data?.message || (isEditMode ? 'Failed to update product' : 'Failed to create product'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/products" className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                    <FiArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEditMode ? 'Update product information' : 'Create a new product for your store'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter product name..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                SKU <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter SKU..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Enter product description..."
                            />
                        </div>

                        {/* Specifications Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiList className="text-blue-500" size={18} />
                                Specifications
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Add product specifications in key-value format (one per line)
                            </p>
                            <textarea
                                name="specifications"
                                value={formData.specifications}
                                onChange={handleChange}
                                rows="6"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                placeholder="Example:
                                    Material: Stainless Steel
                                    Weight: 250g
                                    Dimensions: 10 x 5 x 2 cm
                                    Voltage: 220V
                                    Warranty: 1 Year
                                    Color: Silver"
                            />
                            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                                <FiFileText size={14} className="mt-0.5 flex-shrink-0" />
                                <span>
                                    Format: <strong>Key: Value</strong> (one specification per line)
                                </span>
                            </div>
                        </div>

                        {/* ✅ Multi-Image Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Images <span className="text-red-500">*</span>
                                </label>
                                <span className="text-xs text-gray-500">
                                    {formData.images.length} / {MAX_IMAGES} images
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* Upload from PC - Multiple */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Upload from PC (multiple allowed):</label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                                            <FiUploadCloud size={18} />
                                            <span className="text-sm font-medium">Choose Files</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={formData.images.length >= MAX_IMAGES}
                                            />
                                        </label>
                                        {formData.images.length >= MAX_IMAGES && (
                                            <span className="text-xs text-amber-600">Maximum reached</span>
                                        )}
                                    </div>
                                </div>

                                {/* Add via URL */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Or paste Image URL:</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="imageUrlInput"
                                                type="text"
                                                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="https://example.com/image.jpg"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        handleAddImageUrl()
                                                    }
                                                }}
                                                disabled={formData.images.length >= MAX_IMAGES}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddImageUrl}
                                            disabled={formData.images.length >= MAX_IMAGES}
                                            className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <FiPlus size={18} />
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Image Preview Grid */}
                                {formData.images.length > 0 && (
                                    <div className="mt-3">
                                        <label className="block text-xs text-gray-500 mb-2">Image Preview (use arrows to reorder):</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {formData.images.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group aspect-square rounded-xl border-2 border-gray-200 overflow-hidden bg-white"
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Invalid';
                                                        }}
                                                    />
                                                    
                                                    {/* Image number badge */}
                                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                                        {index + 1}
                                                    </div>

                                                    {/* First image badge */}
                                                    {index === 0 && (
                                                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                            Main
                                                        </div>
                                                    )}

                                                    {/* Action buttons */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMoveImage(index, 'up')}
                                                                className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                                                                title="Move left"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="15 18 9 12 15 6"></polyline>
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {index < formData.images.length - 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMoveImage(index, 'down')}
                                                                className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                                                                title="Move right"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            title="Remove"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.images.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl">
                                        <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-500">No images added yet</p>
                                        <p className="text-xs text-gray-400">Upload at least one image</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Discounted Price (₹)
                            </label>
                            <div className="relative">
                                <FiPercent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="discountedPrice"
                                    value={formData.discountedPrice}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                                required
                                min="0"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Category
                            </label>
                            <div className="flex gap-2">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug || cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategory(true)}
                                    className="px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1"
                                    title="Add New Category"
                                >
                                    <FiPlus size={18} />
                                </button>
                            </div>

                            {showAddCategory && (
                                <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Add New Category</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="e.g. Accessories"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. JUKI, JACK"
                            />
                        </div>

                        {/* Most Popular Checkbox */}
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isMostPopular"
                                    checked={formData.isMostPopular}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                                        <FiTrendingUp className="text-rose-600" size={18} />
                                        Most Popular
                                    </span>
                                    <p className="text-xs text-rose-600 mt-0.5">
                                        Show this product in the "Most Popular" section on the homepage
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Bundle & Save Checkbox */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isBundle"
                                    checked={formData.isBundle}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                        <FiPackage className="text-amber-600" size={18} />
                                        Bundle & Save
                                    </span>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        Show this product in the "Bundle & Save" section on the homepage
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        <FiSave size={18} />
                        {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                    </button>
                    <Link
                        to="/admin/products"
                        className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default AdminProductDetail