const { db } = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Use SQL queries to count
    const totalProducts = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err); else resolve(row.count);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'user'", (err, row) => {
        if (err) reject(err); else resolve(row.count);
      });
    });

    const totalRevenue = await new Promise((resolve, reject) => {
      db.get('SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders', (err, row) => {
        if (err) reject(err); else resolve(row.total);
      });
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders: 0, // Add real count later
        totalUsers,
        totalRevenue,
        recentOrders: [],
        lowStockProducts: []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// Get all products (admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    res.json({ success: true, data: { products } });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Create product
// backend/controllers/adminController.js

// Update createProduct to include isMostPopular
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    db.run(
      `INSERT INTO products (name, sku, description, price, discountedPrice, stock, category, categoryId, brand, imageUrl, 
        isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, isMostPopular, rating, reviewCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        productData.name, productData.sku, productData.description, 
        parseFloat(productData.price) || 0, parseFloat(productData.discountedPrice) || 0,
        parseInt(productData.stock) || 0, productData.category || '', productData.categoryId || null, 
        productData.brand || '', productData.imageUrl || '',
        productData.isBestSeller ? 1 : 0,
        productData.isNewArrival ? 1 : 0,
        productData.isHotDeal ? 1 : 0,
        productData.isFeatured ? 1 : 0,
        productData.isBundle ? 1 : 0,
        productData.isMostPopular ? 1 : 0, // ✅ NEW
        new Date().toISOString(), new Date().toISOString()
      ],
      function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
        
        res.status(201).json({ 
          success: true, 
          message: 'Product created successfully', 
          data: { id: this.lastID, ...productData }
        });
      }
    );
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// Update updateProduct to include isMostPopular
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;

    db.run(
      `UPDATE products SET 
        name = ?, sku = ?, description = ?, price = ?, discountedPrice = ?, 
        stock = ?, category = ?, brand = ?, imageUrl = ?,
        isBestSeller = ?, isNewArrival = ?, isHotDeal = ?, isFeatured = ?, isBundle = ?, isMostPopular = ?,
        updatedAt = ? 
        WHERE id = ?`,
      [
        productData.name, productData.sku, productData.description,
        parseFloat(productData.price) || 0, parseFloat(productData.discountedPrice) || 0,
        parseInt(productData.stock) || 0, productData.category || '', productData.brand || '', 
        productData.imageUrl || '',
        productData.isBestSeller ? 1 : 0,
        productData.isNewArrival ? 1 : 0,
        productData.isHotDeal ? 1 : 0,
        productData.isFeatured ? 1 : 0,
        productData.isBundle ? 1 : 0,
        productData.isMostPopular ? 1 : 0, // ✅ NEW
        new Date().toISOString(), productId
      ],
      function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product updated successfully', data: { id: productId, ...productData } });
      }
    );
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
      if (this.changes === 0) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, message: 'Product deleted successfully' });
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    db.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', [status, new Date().toISOString(), orderId], function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
      if (this.changes === 0) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, message: 'Order status updated successfully' });
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT id, firstName, lastName, email, phone, role, createdAt FROM users WHERE role = 'user'", (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};