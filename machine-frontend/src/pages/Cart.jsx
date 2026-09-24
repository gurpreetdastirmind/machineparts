// frontend/src/pages/Cart.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiHeart, FiShoppingBag, FiMinus, FiPlus, FiGift, FiX, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Cart = () => {
  const { t } = useTranslation()
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    fetchCart,
    // ✅ NEW coupon API
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon
  } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [promoCode, setPromoCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [location.key, isAuthenticated, fetchCart])

  const subtotal = cartTotal
  const shipping = subtotal > 1000 ? 0 : 200
  const tax = Math.round(subtotal * 0.1)
  // ✅ Use couponDiscount from context
  const discount = couponDiscount || 0
  const total = Math.max(0, subtotal + shipping + tax - discount)

  // ✅ Real coupon apply — calls API
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error(t('cart.enterPromoCode'))
      return
    }
    setApplyingCoupon(true)
    const result = await applyCoupon(promoCode)
    if (result.success) {
      setPromoCode('')   // clear input on success
    }
    setApplyingCoupon(false)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/checkout')
      toast.error(t('cart.loginToCheckout'))
      navigate('/auth/login')
      return
    }
    if (cartItems.length === 0) {
      toast.error(t('cart.empty'))
      return
    }
    // ✅ Persist coupon in session so Checkout can pick it up
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon))
    } else {
      sessionStorage.removeItem('appliedCoupon')
    }
    navigate('/checkout')
  }

  const getItemId = (item) => item.productId || item.id

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('cart.empty')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('cart.emptyMessage')}
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
        {t('cart.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="col-span-2">{t('cart.product')}</span>
              <span className="text-center">{t('cart.price')}</span>
              <span className="text-center">{t('cart.quantity')}</span>
              <span className="text-right">{t('cart.total')}</span>
            </div>

            {cartItems.map((item) => (
              <div key={item.id || item.productId} className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:grid md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-4 col-span-2">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <Link
                        to={`/products/${getItemId(item)}`}
                        className="font-medium text-gray-800 dark:text-white hover:text-blue-600"
                      >
                        {item.name || item.productName}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('product.sku')}: {item.sku || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="font-medium text-gray-800 dark:text-white">
                      ₹{(item.discountedPrice || item.price)?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => updateQuantity(getItemId(item), item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="w-8 text-center text-gray-800 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(getItemId(item), item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <span className="font-bold text-blue-600">
                      ₹{((item.discountedPrice || item.price) * item.quantity)?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(getItemId(item))}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                {t('cart.clearCart')}
              </button>
              <Link to="/products" className="text-blue-600 hover:underline text-sm font-medium">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {t('cart.orderSummary')}
            </h2>

            <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('cart.subtotal')} ({itemCount} {t('cart.items')})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('cart.shipping')}</span>
                <span>{shipping === 0 ? t('cart.free') : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('cart.tax')} (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {/* ✅ Show coupon discount when applied */}
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{t('cart.discount')} ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white py-4">
              <span>{t('cart.total')}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {/* ✅ Promo Code Section with REAL logic */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" size={18} />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        You save ₹{discount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1.5 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition-colors"
                    title="Remove coupon"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    placeholder={t('cart.promoCode')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 uppercase"
                    disabled={applyingCoupon}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {applyingCoupon ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        <span>{t('cart.apply')}</span>
                      </>
                    ) : (
                      <>
                        <FiGift size={14} />
                        <span>{t('cart.apply')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('cart.proceedToCheckout')}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {t('cart.secureCheckout')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart