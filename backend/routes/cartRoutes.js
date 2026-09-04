const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// All cart routes require authentication
router.use(auth);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.post('/promo', cartController.applyPromo);

module.exports = router;