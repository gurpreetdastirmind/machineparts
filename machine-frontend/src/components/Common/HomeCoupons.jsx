// frontend/src/components/Common/HomeCoupons.jsx
import React, { useState, useEffect } from 'react'
import { couponService } from '../../services/couponService'
import { 
  FiTag, FiPercent, FiDollarSign, FiCalendar, 
  FiCopy, FiCheck, FiGift, FiClock
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const HomeCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await couponService.getHomeCoupons()
      let couponsData = []
      
      if (response.data?.data) {
        couponsData = response.data.data
      } else if (Array.isArray(response.data)) {
        couponsData = response.data
      }
      
      setCoupons(couponsData)
    } catch (error) {
      console.error('Error fetching home coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Coupon code copied!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading || coupons.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiGift className="text-purple-600 mr-2" size={28} />
          Available Coupons
          <span className="ml-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            {coupons.length} Offers
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code
          const daysLeft = coupon.validUntil 
            ? Math.ceil((new Date(coupon.validUntil) - new Date()) / (1000 * 60 * 60 * 24))
            : null

          return (
            <div
              key={coupon.id}
              className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-dashed border-purple-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Decorative circles */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-dashed border-purple-300"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-dashed border-purple-300"></div>

              <div className="p-5">
                {/* Discount Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                      {coupon.discountType === 'percentage' ? (
                        <FiPercent size={20} />
                      ) : (
                        <FiDollarSign size={20} />
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-purple-700">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `₹${coupon.discountValue}`}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">OFF</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {coupon.description || `Save ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} on your order`}
                </p>

                {/* Conditions */}
                <div className="space-y-1.5 mb-4">
                  {coupon.minOrderAmount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Min. Order: ₹{coupon.minOrderAmount}</span>
                    </div>
                  )}
                  
                  {coupon.maxDiscount > 0 && coupon.discountType === 'percentage' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Max Discount: ₹{coupon.maxDiscount}</span>
                    </div>
                  )}

                  {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                      <FiClock size={12} />
                      <span>Only {daysLeft} day{daysLeft > 1 ? 's' : ''} left!</span>
                    </div>
                  )}
                </div>

                {/* Coupon Code */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border-2 border-dashed border-purple-400 rounded-lg px-3 py-2 text-center">
                    <span className="font-mono font-bold text-purple-700 tracking-wider">
                      {coupon.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      isCopied 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    title="Copy code"
                  >
                    {isCopied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                  </button>
                </div>

                {/* Valid Until */}
                {coupon.validUntil && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <FiCalendar size={12} />
                    <span>Valid until {formatDate(coupon.validUntil)}</span>
                  </div>
                )}

                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HomeCoupons