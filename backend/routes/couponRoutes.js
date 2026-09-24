// backend/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { adminAuth, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth so we can detect logged-in users)
router.get('/home', optionalAuth, couponController.getHomeCoupons);
router.post('/validate', optionalAuth, couponController.validateCoupon);

// Admin routes
router.get('/', adminAuth, couponController.getAllCoupons);
router.get('/:id', adminAuth, couponController.getCouponById);
router.post('/', adminAuth, couponController.createCoupon);
router.put('/:id', adminAuth, couponController.updateCoupon);
router.delete('/:id', adminAuth, couponController.deleteCoupon);

module.exports = router;