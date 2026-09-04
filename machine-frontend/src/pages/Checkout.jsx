import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FiTruck, FiCreditCard, FiShield, FiCheckCircle } from 'react-icons/fi'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { addNotification } = useNotification()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Shipping form state
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

  // Payment state
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
  const total = subtotal + (shippingFree ? 0 : shippingCost) + tax

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    // Validate shipping data
    if (!shippingData.fullName || !shippingData.email || !shippingData.address || 
        !shippingData.city || !shippingData.state || !shippingData.postalCode) {
      addNotification('Please fill all required fields', 'error')
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Process payment
      // await paymentService.processPayment({ ...paymentData, amount: total })
      
      // Create order
      // await orderService.createOrder({ ...shippingData, items: cartItems, total })
      
      addNotification('Order placed successfully!', 'success')
      clearCart()
      setStep(3)
    } catch (error) {
      addNotification('Payment failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Please login to checkout</h2>
        <button 
          onClick={() => navigate('/auth/login')}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login Now
        </button>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/products')}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">Checkout</h1>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              1
            </div>
            <span className="font-medium">Shipping</span>
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
            <span className="font-medium">Payment</span>
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
            <span className="font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Shipping Address</h2>
              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
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
                      Email *
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
                      Phone Number *
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
                      Street Address *
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
                      City *
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
                      State *
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
                      Postal Code *
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
                      Country
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
                    Save as default address
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={shippingData.useDifferentBilling}
                      onChange={(e) => setShippingData({ ...shippingData, useDifferentBilling: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Use different billing address
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Payment Method</h2>
              
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
                      {method === 'card' && '💳 Card'}
                      {method === 'netbanking' && '🏦 Net Banking'}
                      {method === 'upi' && '📱 UPI'}
                      {method === 'cod' && '💵 Cash on Delivery'}
                    </button>
                  ))}
                </div>

                {paymentData.method === 'card' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
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
                          Expiry Date
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
                          CVV
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
                        Cardholder Name
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
                      UPI ID
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
                      Select Bank
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500">
                      <option value="">Select your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <FiShield className="text-green-500" />
                  <span>Your payment is secure with SSL encryption</span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Order #ORD-2024-001</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Thank you for your purchase. We'll send you a confirmation email shortly.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => navigate('/account/orders')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>
            
            {step === 1 && (
              <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span>{shippingFree ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping</span>
                    <span>{shippingFree ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Tax (10%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiTruck className="text-blue-600" />
                    <span>Shipping: {shippingFree ? 'Free' : 'Standard'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiCreditCard className="text-blue-600" />
                    <span>Payment: {paymentData.method.charAt(0).toUpperCase() + paymentData.method.slice(1)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white py-4">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout