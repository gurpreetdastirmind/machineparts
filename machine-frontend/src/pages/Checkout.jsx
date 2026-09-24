// frontend/src/pages/Checkout.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FiTruck, FiCreditCard, FiShield, FiCheckCircle } from 'react-icons/fi'
import { orderService } from '../services/orderService'

const Checkout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    cartItems,
    cartTotal,
    clearCart,
    appliedCoupon,
    couponDiscount,
    removeCoupon
  } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { addNotification } = useNotification()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [shippingData, setShippingData] = useState({
    fullName: user?.firstName + ' ' + user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    saveAsDefault: false,
    useDifferentBilling: false,
  })

  const [paymentData, setPaymentData] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })

  const [shippingMethod, setShippingMethod] = useState('standard')

  const subtotal = cartTotal
  const shippingCost = shippingMethod === 'standard' ? 200 : shippingMethod === 'express' ? 500 : 1000
  const shippingFree = subtotal > 1000
  const tax = Math.round(subtotal * 0.1)
  const discount = couponDiscount || 0
  const total = Math.max(0, subtotal + (shippingFree ? 0 : shippingCost) + tax - discount)

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    if (!shippingData.fullName || !shippingData.email || !shippingData.address ||
        !shippingData.city || !shippingData.state || !shippingData.postalCode) {
      addNotification(t('checkout.fillAllFields'), 'error')
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          name: item.name || item.productName,
          quantity: item.quantity,
          price: item.discountedPrice || item.price || 0,
          imageUrl: item.imageUrl || item.image || ''
        })),
        totalAmount: total,
        paymentMethod: paymentData.method || 'COD',
        shippingAddress: {
          fullName: shippingData.fullName,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country || 'India'
        },
        shippingCost: shippingFree ? 0 : shippingCost,
        tax: tax,
        discount: discount,
        couponCode: appliedCoupon?.code || null
      }

      console.log('Placing order:', orderData)

      const response = await orderService.createOrder(orderData)
      console.log('Order response:', response.data)

      if (response.data.success) {
        addNotification(t('checkout.orderSuccess'), 'success')
        if (appliedCoupon) removeCoupon()
        sessionStorage.removeItem('appliedCoupon')
        clearCart()
        setStep(3)
      } else {
        throw new Error(response.data.message || t('checkout.orderFailed'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      addNotification(error.response?.data?.message || error.message || t('checkout.paymentFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('checkout.loginToCheckout')}
        </h2>
        <button
          onClick={() => navigate('/auth/login')}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('wishlist.loginNow')}
        </button>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('cart.empty')}
        </h2>
        <button
          onClick={() => navigate('/products')}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('cart.continueShopping')}
        </button>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
        {t('checkout.title')}
      </h1>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              1
            </div>
            <span className="font-medium">{t('checkout.shipping')}</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-700">
            <div className={`h-full bg-blue-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              2
            </div>
            <span className="font-medium">{t('checkout.payment')}</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-700">
            <div className={`h-full bg-blue-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              3
            </div>
            <span className="font-medium">{t('checkout.confirmation')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t('checkout.shippingAddress')}
              </h2>
              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.fullName')} *
                    </label>
                    <input
                      type="text"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.email')} *
                    </label>
                    <input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.streetAddress')} *
                    </label>
                    <input
                      type="text"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.city')} *
                    </label>
                    <input
                      type="text"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.state')} *
                    </label>
                    <input
                      type="text"
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.postalCode')} *
                    </label>
                    <input
                      type="text"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.country')}
                    </label>
                    <select
                      value={shippingData.country}
                      onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={shippingData.saveAsDefault}
                      onChange={(e) => setShippingData({ ...shippingData, saveAsDefault: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {t('checkout.saveAsDefault')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={shippingData.useDifferentBilling}
                      onChange={(e) => setShippingData({ ...shippingData, useDifferentBilling: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {t('checkout.useDifferentBilling')}
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('checkout.continueToPayment')}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t('checkout.paymentMethod')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['card', 'netbanking', 'upi', 'cod'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentData({ ...paymentData, method })}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        paymentData.method === method
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {method === 'card' && `💳 ${t('checkout.card')}`}
                      {method === 'netbanking' && `🏦 ${t('checkout.netBanking')}`}
                      {method === 'upi' && `📱 ${t('checkout.upi')}`}
                      {method === 'cod' && `💵 ${t('checkout.cod')}`}
                    </button>
                  ))}
                </div>

                {paymentData.method === 'card' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('checkout.cardNumber')}
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('checkout.expiryDate')}
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('checkout.cvv')}
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength="4"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('checkout.cardholderName')}
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentData.cardholderName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {paymentData.method === 'upi' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.upiId')}
                    </label>
                    <input
                      type="text"
                      placeholder="example@upi"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {paymentData.method === 'netbanking' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('checkout.selectBank')}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500">
                      <option value="">{t('checkout.selectBank')}</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <FiShield className="text-green-500" />
                  <span>{t('checkout.secureNote')}</span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {t('checkout.back')}
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t('checkout.processing')}
                      </>
                    ) : (
                      t('checkout.payNow')
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {t('checkout.orderPlaced')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Order #ORD-2024-001</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('checkout.thankYou')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/account/orders')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('checkout.trackOrder')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {t('checkout.continueShoppingBtn')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {t('cart.orderSummary')}
            </h2>

            {step === 1 && (
              <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t('cart.subtotal')} ({cartItems.length} {t('cart.items')})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t('cart.shipping')}</span>
                  <span>{shippingFree ? t('cart.free') : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t('cart.tax')} (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {/* ✅ NEW: Discount row for Step 1 */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{t('cart.subtotal')} ({cartItems.length} {t('cart.items')})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{t('cart.shipping')}</span>
                    <span>{shippingFree ? t('cart.free') : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{t('cart.tax')} (10%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {/* ✅ NEW: Discount row for Step 2 */}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiTruck className="text-blue-600" />
                    <span>{t('cart.shipping')}: {shippingFree ? t('cart.free') : t('checkout.standard')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiCreditCard className="text-blue-600" />
                    <span>{t('checkout.payment')}: {t(`checkout.${paymentData.method}`)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white py-4">
              <span>{t('cart.total')}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout