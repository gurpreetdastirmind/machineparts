const { db } = require('../config/database');

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // FIX: Query SQLite database for cart items
    const cartItems = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM carts WHERE userId = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Fetch product details for each cart item
    const items = await Promise.all(cartItems.map(async (item) => {
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [item.productId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name || 'Unknown',
        productImage: product?.imageUrl || '',
        quantity: item.quantity,
        price: item.price || product?.discountedPrice || 0,
        total: (item.price || product?.discountedPrice || 0) * item.quantity
      };
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = 0;
    const shipping = subtotal > 1000 ? 0 : 200;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax - discount;

    res.json({
      success: true,
      data: {
        items,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1, variantId } = req.body;

    // Check if product exists
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already in cart
    const existingItem = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM carts WHERE userId = ? AND productId = ?', [userId, productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingItem) {
      // Update quantity
      await new Promise((resolve, reject) => {
        db.run('UPDATE carts SET quantity = ?, updatedAt = ? WHERE id = ?', 
          [existingItem.quantity + quantity, new Date().toISOString(), existingItem.id], 
          (err) => err ? reject(err) : resolve()
        );
      });
    } else {
      // Add new item
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO carts (userId, productId, quantity, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, productId, quantity, product.discountedPrice || product.price, new Date().toISOString(), new Date().toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
      error: error.message
    });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    // Check if item belongs to user
    const cartItem = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM carts WHERE id = ? AND userId = ?', [itemId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await new Promise((resolve, reject) => {
      db.run('UPDATE carts SET quantity = ?, updatedAt = ? WHERE id = ?',
        [quantity, new Date().toISOString(), itemId],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = parseInt(req.params.itemId);

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM carts WHERE id = ? AND userId = ?', [itemId, userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from cart',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM carts WHERE userId = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Apply promo code
exports.applyPromo = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Mock promo codes
    const promos = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'SAVE50': { discount: 50, type: 'fixed' }
    };

    if (!promos[code]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    res.json({
      success: true,
      message: 'Promo code applied',
      data: {
        discount: promos[code].discount,
        type: promos[code].type
      }
    });
  } catch (error) {
    console.error('Apply promo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promo',
      error: error.message
    });
  }
};