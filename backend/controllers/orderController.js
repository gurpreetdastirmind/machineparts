const { db, getCartItems } = require('../config/database');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress, paymentMethod, items, total } = req.body;

    const cartItems = getCartItems(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Create order
    const order = {
      id: db.orders.length + 1,
      userId,
      orderNumber: `ORD-${Date.now()}`,
      totalAmount: total || 0,
      discountAmount: 0,
      shippingCost: 0,
      tax: 0,
      status: 'Pending',
      paymentMethod: paymentMethod || 'COD',
      shippingAddress: shippingAddress || '123 Main St',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(order);

    // Create order items
    cartItems.forEach(item => {
      db.orderItems.push({
        id: db.orderItems.length + 1,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
        createdAt: new Date().toISOString()
      });
    });

    // Clear cart
    db.carts = db.carts.filter(c => c.userId !== userId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        shippingAddress: order.shippingAddress,
        estimatedDelivery: '2025-01-10',
        trackingNumber: `TRACK${Date.now()}`,
        items: cartItems
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = db.orders.filter(o => o.userId === userId);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = parseInt(req.params.orderId);

    const order = db.orders.find(o => o.id === orderId && o.userId === userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};