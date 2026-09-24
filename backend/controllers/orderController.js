// backend/controllers/orderController.js
const { db } = require('../config/database');
const Coupon = require('../models/Coupon');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      items, 
      totalAmount, 
      paymentMethod, 
      shippingAddress,
      shippingCost,
      tax,
      discount,
      couponCode
    } = req.body;

    console.log('📦 Creating order for user:', userId);
    console.log('Order data:', { items, totalAmount, paymentMethod, shippingAddress });
    console.log('💰 Discount:', discount, '| Coupon:', couponCode);

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let finalTotal = totalAmount || 0;
    if (!totalAmount || totalAmount === 0) {
      finalTotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    }

    console.log('💰 Final total:', finalTotal);

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (
          userId, 
          orderNumber, 
          totalAmount, 
          status, 
          paymentMethod, 
          shippingAddress,
          createdAt, 
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          orderNumber,
          finalTotal,
          'Pending',
          paymentMethod || 'COD',
          typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
          new Date().toISOString(),
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            console.error('❌ Database insert error:', err);
            reject(err);
          } else {
            console.log('✅ Order inserted with ID:', this.lastID);
            resolve(this.lastID);
          }
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER,
          productId INTEGER,
          productName TEXT,
          quantity INTEGER,
          price REAL,
          total REAL,
          imageUrl TEXT,
          createdAt TEXT,
          FOREIGN KEY (orderId) REFERENCES orders(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Create order_items table error:', err);
          reject(err);
        } else {
          console.log('✅ order_items table ready');
          resolve();
        }
      });
    });

    for (const item of items) {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      console.log(`📦 Inserting item: ${item.name} x ${itemQuantity} = ₹${itemTotal}`);
      
      let imageUrl = item.imageUrl || '';
      if (!imageUrl && item.productId) {
        try {
          const product = await new Promise((resolve, reject) => {
            db.get('SELECT imageUrl FROM products WHERE id = ?', [item.productId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          if (product) {
            imageUrl = product.imageUrl || '';
          }
        } catch (err) {
          console.error('Error fetching product image:', err);
        }
      }
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (
            orderId, 
            productId, 
            productName, 
            quantity, 
            price, 
            total,
            imageUrl,
            createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            result,
            item.productId || item.id || 0,
            item.name || item.productName || 'Unknown Product',
            itemQuantity,
            itemPrice,
            itemTotal,
            imageUrl || '',
            new Date().toISOString()
          ],
          (err) => {
            if (err) {
              console.error('❌ Insert order item error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM carts WHERE userId = ?', [userId], (err) => {
        if (err) {
          console.error('❌ Clear cart error:', err);
          reject(err);
        } else {
          console.log('✅ Cart cleared');
          resolve();
        }
      });
    });

    // ✅ UPDATED: Enforce one coupon per user + record usage
    if (couponCode) {
      try {
        const coupon = await Coupon.findByCode(couponCode)

        if (!coupon) {
          console.warn(`⚠️ Coupon ${couponCode} not found — but order already placed`)
        } else {
          // Check per-user usage — reject if this user already used it
          const alreadyUsed = await Coupon.hasUserUsedCoupon(userId, coupon.id)
          if (alreadyUsed) {
            console.error(`❌ User ${userId} already used coupon ${couponCode}`)
          } else {
            // Record per-user usage (UNIQUE constraint protects against races)
            await Coupon.recordUsage(coupon.id, userId, result, couponCode)
            console.log(`✅ Recorded coupon ${couponCode} usage for user ${userId}`)

            // Increment global usage count
            await Coupon.incrementUsage(coupon.id)
            console.log(`✅ Coupon ${couponCode} global usage incremented`)
          }
        }
      } catch (err) {
        console.error('❌ Failed to record coupon usage:', err)
      }
    }

    console.log('🎉 Order created successfully!');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: result,
        orderNumber: orderNumber,
        total: finalTotal,
        discount: discount || 0,
        couponCode: couponCode || null
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM order_items WHERE orderId = ?`,
          [order.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      return {
        ...order,
        items: items || [],
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null
      };
    }));

    res.json({
      success: true,
      data: ordersWithItems
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
    const orderId = req.params.orderId;

    const order = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM orders WHERE id = ? AND userId = ?`,
        [orderId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const items = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM order_items WHERE orderId = ?`,
        [orderId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      data: {
        ...order,
        items: items || [],
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null
      }
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

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM orders ORDER BY createdAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM order_items WHERE orderId = ?`,
          [order.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      return {
        ...order,
        items: items || [],
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null
      };
    }));

    res.json({
      success: true,
      data: ordersWithItems
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?`,
        [status, new Date().toISOString(), orderId],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};