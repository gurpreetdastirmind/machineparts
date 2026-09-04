// frontend/src/pages/Cart.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiTrash2, FiHeart, FiShoppingBag, FiMinus, FiPlus, FiGift } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, itemCount } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const subtotal = cartTotal
  const shipping = subtotal > 1000 ? 0 : 200
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + shipping + tax - discount

  const handleApplyPromo = async () => {
    if (!promoCode) {
      toast.error('Please enter a promo code')
      return
    }
    setLoading(true)
    try {
      // API call to apply promo code
      // const response = await cartService.applyPromoCode(promoCode)
      // setDiscount(response.data.discount)
      toast.success('Promo code applied!')
    } catch (error) {
      toast.error('Invalid promo code')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout')
      navigate('/auth/login')
      return
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added any items yet</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="col-span-2">Product</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
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
                      <Link to={`/products/${item.productId || item.id}`} className="font-medium text-gray-800 dark:text-white hover:text-blue-600">
                        {item.name || item.productName}
                      </Link>
                      {item.variantType && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Variant: {item.variantType}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku || 'N/A'}</p>
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
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="w-8 text-center text-gray-800 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
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
                      onClick={() => removeFromCart(item.productId)}
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
                Clear Cart
              </button>
              <Link to="/products" className="text-blue-600 hover:underline text-sm font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">You might also like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Recommended products would be rendered here */}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white py-4">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleApplyPromo}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Secure checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart