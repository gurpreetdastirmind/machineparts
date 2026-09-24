// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import Contact from './pages/Contact'
import About from './pages/About'
import AdminLogin from './pages/admin/AdminLogin'
import AdminCoupons from './pages/admin/AdminCoupons'

// Admin Layout and Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProductDetail from './pages/admin/AdminProductDetail'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminReviews from './pages/admin/AdminReviews'

// Import for toast
import { Toaster } from 'react-hot-toast'

function AppRoutes() {
  const location = useLocation()

  return (
    <Routes location={location}>
      {/* Public Routes - with Layout */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
      <Route path="/account/*" element={<Layout><Account /></Layout>} />
      <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />

      {/* ✅ FIXED: Search route now renders the Search page */}
      <Route path="/search" element={<Layout><Search /></Layout>} />

      <Route path="/auth/login" element={<Layout><Login /></Layout>} />
      <Route path="/auth/register" element={<Layout><Register /></Layout>} />
      <Route path="/auth/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
      <Route path="/auth/reset-password" element={<Layout><ResetPassword /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />

      {/* Admin Login - No Layout */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products/add" element={<AdminProductDetail />} />
        <Route path="products/:id/edit" element={<AdminProductDetail />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App