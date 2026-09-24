// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/hot-deals', productController.getHotDeals);

// ✅ NEW: Dynamic filters endpoint — MUST be before /:id
router.get('/filters', productController.getDynamicFilters);

router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);
router.get('/:id/related', productController.getRelatedProducts);

// Protected route - Submit review
router.post('/:id/reviews', auth, productController.submitReview);

module.exports = router;