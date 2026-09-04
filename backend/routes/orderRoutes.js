const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// All order routes require authentication
router.use(auth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);

module.exports = router;