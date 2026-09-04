import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { 
  FiArrowLeft, FiSave, FiImage, FiDollarSign, 
  FiPercent, FiUploadCloud, FiPlus, FiPackage, FiTrendingUp
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const templateData = location.state?.template
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [error, setError] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        discountedPrice: '',
        stock: '',
        category: '',
        brand: '',
        imageUrl: '',
        imageFile: null,
        isBestSeller: false,
        isNewArrival: false,
        isHotDeal: false,
        isFeatured: false,
        isBundle: false,
        isMostPopular: false, // ✅ NEW: Most Popular
    })

    const isEditMode = id && id !== 'add'

    useEffect(() => {
        console.log('AdminProductDetail mounted with id:', id)
        fetchData()
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
                    
                    setFormData({
                        name: product.name || '',
                        sku: product.sku || '',
                        description: product.description || '',
                        price: product.price || '',
                        discountedPrice: product.discountedPrice || '',
                        stock: product.stock || '',
                        category: product.category || '',
                        brand: product.brand || '',
                        imageUrl: product.imageUrl || '',
                        imageFile: null,
                        isBestSeller: product.isBestSeller === 1 || product.isBestSeller === true,
                        isNewArrival: product.isNewArrival === 1 || product.isNewArrival === true,
                        isHotDeal: product.isHotDeal === 1 || product.isHotDeal === true,
                        isFeatured: product.isFeatured === 1 || product.isFeatured === true,
                        isBundle: product.isBundle === 1 || product.isBundle === true,
                        isMostPopular: product.isMostPopular === 1 || product.isMostPopular === true, // ✅ NEW
                    })
                } catch (error) {
                    console.error('Error loading product:', error)
                    toast.error('Failed to load product data')
                    setError('Failed to load product')
                }
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
        console.log('Change event:', { name, value, type, checked })
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Please select an image smaller than 5MB')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    imageFile: reader.result,
                    imageUrl: ''
                }))
            }
            reader.readAsDataURL(file)
        }
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
        setSaving(true)

        try {
            const productData = {
                name: formData.name,
                sku: formData.sku,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                discountedPrice: parseFloat(formData.discountedPrice) || parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                category: formData.category,
                brand: formData.brand,
                imageUrl: formData.imageFile || formData.imageUrl || '',
                isBestSeller: formData.isBestSeller ? 1 : 0,
                isNewArrival: formData.isNewArrival ? 1 : 0,
                isHotDeal: formData.isHotDeal ? 1 : 0,
                isFeatured: formData.isFeatured ? 1 : 0,
                isBundle: formData.isBundle ? 1 : 0,
                isMostPopular: formData.isMostPopular ? 1 : 0, // ✅ NEW
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

                        {/* Image Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Product Image
                            </label>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Upload from PC:</label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                                            <FiUploadCloud size={18} />
                                            <span className="text-sm font-medium">Choose File</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        {formData.imageFile && <span className="text-xs text-emerald-600">Image Selected ✓</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Or paste Image URL:</label>
                                    <div className="relative">
                                        <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                {(formData.imageFile || formData.imageUrl) && (
                                    <div className="mt-2 w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-white">
                                        <img src={formData.imageFile || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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

                        {/* ✅ NEW: Most Popular Checkbox */}
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

                        {/* ✅ Bundle & Save Checkbox */}
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