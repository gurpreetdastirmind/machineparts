// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'

// Layout
import Layout from './components/Layout/Layout'
import AdminRoute from './components/AdminRoute'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/AdminLogin'

// Admin Layout and Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProductDetail from './pages/admin/AdminProductDetail'

// Import for toast
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <Routes>
                {/* Public Routes - with Layout */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/products" element={<Layout><Products /></Layout>} />
                <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                <Route path="/cart" element={<Layout><Cart /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                <Route path="/account/*" element={<Layout><Account /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/search" element={<Layout><Search /></Layout>} />
                <Route path="/auth/login" element={<Layout><Login /></Layout>} />
                <Route path="/auth/register" element={<Layout><Register /></Layout>} />
                <Route path="/auth/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
                <Route path="/auth/reset-password" element={<Layout><ResetPassword /></Layout>} />
                
                {/* Admin Login - No Layout */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* ✅ FIXED: Admin Routes - These should NOT use Layout */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products/add" element={<AdminProductDetail />} />
                  <Route path="products/:id/edit" element={<AdminProductDetail />} />
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App