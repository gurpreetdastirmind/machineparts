// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { cartService } from '../services/cartService'
import { couponService } from '../services/couponService'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, setCartMergeCallback } = useAuth()

  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)

  useEffect(() => {
    if (setCartMergeCallback) {
      setCartMergeCallback(fetchCart)
    }
  }, [setCartMergeCallback])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      const savedCart = localStorage.getItem('guestCart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart)
          }
        } catch (e) {
          console.error('Failed to parse saved cart:', e)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (cartItems.length === 0 && appliedCoupon) {
      setAppliedCoupon(null)
      setCouponDiscount(0)
    }
  }, [cartItems, appliedCoupon])

  useEffect(() => {
    if (appliedCoupon && cartTotal > 0) {
      recalcCouponDiscount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal])

  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems))
    } else if (!isAuthenticated && cartItems.length === 0) {
      const savedCart = localStorage.getItem('guestCart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.removeItem('guestCart')
          }
        } catch (e) {
          localStorage.removeItem('guestCart')
        }
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + ((item.price || item.discountedPrice || 0) * (item.quantity || 1)),
      0
    )
    setCartTotal(total)
  }, [cartItems, isAuthenticated])

  const recalcCouponDiscount = async () => {
    try {
      const response = await couponService.validateCoupon(
        appliedCoupon.code,
        cartTotal
      )
      const data = response.data?.data

      if (data?.valid) {
        setCouponDiscount(data.discount || 0)
      } else {
        setAppliedCoupon(null)
        setCouponDiscount(0)
      }
    } catch (error) {
      console.error('Coupon recalc error:', error)
    }
  }

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getCart()

      const items = response.data?.data?.items || response.data?.items || []
      setCartItems(items)

      const total = items.reduce(
        (sum, item) => sum + ((item.price || item.discountedPrice || 0) * (item.quantity || 1)),
        0
      )
      setCartTotal(total)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        await cartService.addToCart(product.id, quantity)
        await fetchCart()
      } else {
        const existingItem = cartItems.find(item => item.productId === product.id)

        if (existingItem) {
          setCartItems(prev => prev.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity, price: product.discountedPrice || product.price }
              : item
          ))
        } else {
          setCartItems(prev => [...prev, {
            id: `guest-${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            productName: product.name,
            imageUrl: product.imageUrl || product.image,
            price: product.discountedPrice || product.price,
            sku: product.sku,
            quantity
          }])
        }
      }
      toast.success('Added to cart!')
    } catch (error) {
      toast.error('Failed to add to cart')
      console.error('Add to cart error:', error)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return

    try {
      if (isAuthenticated) {
        const item = cartItems.find(i => i.productId === productId || i.id === productId)
        if (item) {
          await cartService.updateCartItem(item.id, quantity)
          await fetchCart()
        }
      } else {
        setCartItems(prevItems => prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        ))
      }
    } catch (error) {
      toast.error('Failed to update quantity')
      console.error('Update quantity error:', error)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        const item = cartItems.find(i => i.productId === productId || i.id === productId)
        if (item) {
          await cartService.removeFromCart(item.id)
          await fetchCart()
        }
      } else {
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId))
      }
      toast.success('Removed from cart')
    } catch (error) {
      toast.error('Failed to remove from cart')
      console.error('Remove from cart error:', error)
    }
  }

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartService.clearCart()
        await fetchCart()
      } else {
        setCartItems([])
        localStorage.removeItem('guestCart')
      }
      setAppliedCoupon(null)
      setCouponDiscount(0)
      toast.success('Cart cleared')
    } catch (error) {
      toast.error('Failed to clear cart')
      console.error('Clear cart error:', error)
    }
  }

  // ✅ UPDATED: Better messaging for "already used"
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      toast.error('Please enter a coupon code')
      return { success: false }
    }

    if (cartTotal <= 0) {
      toast.error('Your cart is empty')
      return { success: false }
    }

    try {
      const response = await couponService.validateCoupon(code.trim().toUpperCase(), cartTotal)
      const data = response.data?.data

      if (!data?.valid) {
        let msg = data?.message || 'Invalid coupon code'
        if (data?.code === 'ALREADY_USED') {
          msg = '🎫 You have already used this coupon on a previous order'
        }
        toast.error(msg)
        return { success: false, error: msg }
      }

      setAppliedCoupon({
        code: data.coupon.code,
        coupon: data.coupon,
        discount: data.discount
      })
      setCouponDiscount(data.discount)
      toast.success(data.message || 'Coupon applied successfully!')
      return { success: true, discount: data.discount }
    } catch (error) {
      console.error('Apply coupon error:', error)
      const msg = error.response?.data?.message || 'Failed to apply coupon'
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    toast.success('Coupon removed')
  }

  const value = {
    cartItems,
    setCartItems,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    itemCount: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}