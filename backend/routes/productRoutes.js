const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/hot-deals', productController.getHotDeals);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;