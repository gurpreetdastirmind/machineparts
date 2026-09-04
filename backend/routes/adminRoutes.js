// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers
} = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getAllUsers);

module.exports = router;