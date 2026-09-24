// frontend/src/pages/admin/AdminCoupons.jsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiTag, FiX, 
  FiPercent, FiDollarSign, FiCalendar, FiToggleLeft, FiToggleRight,
  FiHome, FiEye
} from 'react-icons/fi'
import { couponService } from '../../services/couponService'
import toast from 'react-hot-toast'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
    showOnHome: false
  })

  const location = useLocation()

  useEffect(() => {
    fetchCoupons()
  }, [location.key])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await couponService.getAllCoupons()
      console.log('Coupons Response:', response.data)

      let couponsData = []
      if (response.data?.data) {
        couponsData = response.data.data
      } else if (Array.isArray(response.data)) {
        couponsData = response.data
      }

      setCoupons(couponsData)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscount: coupon.maxDiscount || '',
        usageLimit: coupon.usageLimit || '',
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        isActive: coupon.isActive === 1 || coupon.isActive === true,
        showOnHome: coupon.showOnHome === 1 || coupon.showOnHome === true
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
        showOnHome: false
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCoupon(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      toast.error('Coupon code is required')
      return
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0')
      return
    }

    setSaving(true)

    try {
      const couponData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscount: parseFloat(formData.maxDiscount) || 0,
        usageLimit: parseInt(formData.usageLimit) || 0,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        isActive: formData.isActive,
        showOnHome: formData.showOnHome
      }

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, couponData)
        toast.success('Coupon updated successfully')
      } else {
        await couponService.createCoupon(couponData)
        toast.success('Coupon created successfully')
      }

      handleCloseModal()
      fetchCoupons()
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return

    try {
      await couponService.deleteCoupon(id)
      toast.success('Coupon deleted successfully')
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await couponService.updateCoupon(coupon.id, {
        ...coupon,
        isActive: coupon.isActive === 1 ? 0 : 1
      })
      toast.success(`Coupon ${coupon.isActive === 1 ? 'deactivated' : 'activated'}`)
      fetchCoupons()
    } catch (error) {
      console.error('Error toggling coupon:', error)
      toast.error('Failed to update coupon')
    }
  }

  const toggleShowOnHome = async (coupon) => {
    try {
      await couponService.updateCoupon(coupon.id, {
        ...coupon,
        showOnHome: coupon.showOnHome === 1 ? 0 : 1
      })
      toast.success(`Coupon ${coupon.showOnHome === 1 ? 'hidden from' : 'shown on'} home page`)
      fetchCoupons()
    } catch (error) {
      console.error('Error toggling home display:', error)
      toast.error('Failed to update coupon')
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    String(coupon.code || '').toLowerCase().includes(search.toLowerCase()) ||
    String(coupon.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const isExpired = (validUntil) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons for your store</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 self-start sm:self-center"
        >
          <FiPlus size={18} />
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupons..."
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.validUntil)
            const isActive = coupon.isActive === 1

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow duration-200 ${
                  expired ? 'border-red-200 bg-red-50/50' : isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Coupon Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                      expired ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <FiTag size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg tracking-wide">{coupon.code}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{coupon.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(coupon)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Coupon"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Coupon"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Discount Info */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {coupon.discountType === 'percentage' ? (
                        <FiPercent className="text-blue-600" size={18} />
                      ) : (
                        <FiDollarSign className="text-blue-600" size={18} />
                      )}
                      <span className="text-2xl font-bold text-blue-700">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `₹${coupon.discountValue}`}
                      </span>
                      <span className="text-sm text-gray-600">OFF</span>
                    </div>
                    {coupon.maxDiscount > 0 && coupon.discountType === 'percentage' && (
                      <span className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-sm">
                  {coupon.minOrderAmount > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Min Order</span>
                      <span>₹{coupon.minOrderAmount}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiCalendar size={14} className="text-gray-400" />
                    <span className="text-xs">
                      {coupon.validUntil 
                        ? `Valid until ${new Date(coupon.validUntil).toLocaleDateString()}`
                        : 'No expiry date'}
                    </span>
                  </div>

                  {coupon.usageLimit > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Usage</span>
                      <span>{coupon.usedCount || 0} / {coupon.usageLimit}</span>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expired && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg">
                        Expired
                      </span>
                    )}
                    {!expired && isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                        Active
                      </span>
                    )}
                    {!expired && !isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                        Inactive
                      </span>
                    )}
                    {coupon.showOnHome === 1 && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1">
                        <FiHome size={10} /> Home
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={isActive ? 'Deactivate' : 'Activate'}
                    >
                      {isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => toggleShowOnHome(coupon)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        coupon.showOnHome === 1 ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={coupon.showOnHome === 1 ? 'Hide from Home' : 'Show on Home'}
                    >
                      <FiHome size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No coupons found</h3>
            <p className="text-sm text-gray-500">
              Create your first coupon to offer discounts
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create Coupon
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g. SAVE20"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Get 20% off on your first order"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Value *
                  </label>
                  <div className="relative">
                    {formData.discountType === 'percentage' ? (
                      <FiPercent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    ) : (
                      <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    )}
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 (no limit)"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Only for percentage type</p>
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 (unlimited)"
                  min="0"
                />
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Valid From
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <p className="text-xs text-gray-400">Enable this coupon for use</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showOnHome"
                    checked={formData.showOnHome}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Show on Home Page</span>
                    <p className="text-xs text-gray-400">Display this coupon in the home page offers section</p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons