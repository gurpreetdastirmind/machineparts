// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { cartService } from '../services/cartService'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      // ✅ FIX: Only load localStorage if it has items
      const savedCart = localStorage.getItem('guestCart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          // Only set it if it's an array AND has items
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart)
          }
        } catch (e) {
          console.error('Failed to parse saved cart:', e)
        }
      }
    }
  }, [isAuthenticated])

  // ✅ FIX: Do not overwrite localStorage with an empty array on page load
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems))
    } else if (!isAuthenticated && cartItems.length === 0) {
      // If items are empty, check if we had items before. If yes, clear them intentionally.
      const savedCart = localStorage.getItem('guestCart')
      if (savedCart && JSON.parse(savedCart).length > 0) {
        // This means user cleared cart intentionally (Clear Cart button)
        localStorage.removeItem('guestCart')
      }
      // If there was no saved cart, do nothing (don't save empty array)
    }
    calculateTotal()
  }, [cartItems, isAuthenticated])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getCart()
      
      const items = response.data?.data?.items || response.data?.items || []
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.price || item.discountedPrice || 0
      return sum + (price * (item.quantity || 1))
    }, 0)
    setCartTotal(total)
    return total
  }

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        await cartService.addToCart(product.id, quantity)
        await fetchCart()
      } else {
        // Guest cart
        const existingItem = cartItems.find(item => item.productId === product.id)
        
        if (existingItem) {
          setCartItems(cartItems.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity, price: product.discountedPrice || product.price }
              : item
          ))
        } else {
          setCartItems([...cartItems, { 
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
        // ✅ Explicitly clear localStorage when user clears cart
        localStorage.removeItem('guestCart')
      }
      toast.success('Cart cleared')
    } catch (error) {
      toast.error('Failed to clear cart')
      console.error('Clear cart error:', error)
    }
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
    itemCount: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}