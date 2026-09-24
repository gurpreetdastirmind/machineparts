// backend/controllers/adminController.js
const { db } = require('../config/database');

// ============================================================
// HELPER: Fetch images for a list of product IDs
// ============================================================
const fetchImagesForProducts = (productIds) => {
  return new Promise((resolve, reject) => {
    if (!productIds || productIds.length === 0) return resolve({});
    const placeholders = productIds.map(() => '?').join(',');
    db.all(
      `SELECT productId, imageUrl FROM product_images 
       WHERE productId IN (${placeholders}) 
       ORDER BY productId, sortOrder ASC, id ASC`,
      productIds,
      (err, rows) => {
        if (err) return reject(err);
        const map = {};
        (rows || []).forEach((r) => {
          if (!map[r.productId]) map[r.productId] = [];
          map[r.productId].push(r.imageUrl);
        });
        resolve(map);
      }
    );
  });
};

// ============================================================
// GET DASHBOARD STATISTICS
// ============================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'user'", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalRevenue = await new Promise((resolve, reject) => {
      db.get('SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders: 0,
        totalUsers,
        totalRevenue,
        recentOrders: [],
        lowStockProducts: [],
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// ============================================================
// GET ALL PRODUCTS (ADMIN) — with images
// ============================================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const ids = products.map((p) => p.id);
    const imagesMap = await fetchImagesForProducts(ids);

    const parsed = products.map((p) => {
      const fromTable = imagesMap[p.id];
      const imgs = (fromTable && fromTable.length > 0)
        ? fromTable
        : (p.imageUrl ? [p.imageUrl] : []);
      return { ...p, images: imgs };
    });

    res.json({ success: true, data: { products: parsed } });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// ============================================================
// CREATE PRODUCT (ADMIN) — with images
// ============================================================
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Normalize images array
    let images = [];
    if (Array.isArray(productData.images) && productData.images.length > 0) {
      images = productData.images.filter(Boolean);
    } else if (productData.imageUrl) {
      images = [productData.imageUrl];
    }

    const mainImageUrl = images[0] || '';

    db.run(
      `INSERT INTO products (name, sku, description, price, discountedPrice, stock, category, categoryId, brand, imageUrl, images, specifications,
        isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, isMostPopular, rating, reviewCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        productData.name,
        productData.sku,
        productData.description,
        parseFloat(productData.price) || 0,
        parseFloat(productData.discountedPrice) || parseFloat(productData.price) || 0,
        parseInt(productData.stock) || 0,
        productData.category || '',
        productData.categoryId || null,
        productData.brand || '',
        mainImageUrl,
        '[]',
        productData.specifications || '',
        productData.isBestSeller ? 1 : 0,
        productData.isNewArrival ? 1 : 0,
        productData.isHotDeal ? 1 : 0,
        productData.isFeatured ? 1 : 0,
        productData.isBundle ? 1 : 0,
        productData.isMostPopular ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
      function (err) {
        if (err) {
          console.error('Insert product error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: err.message,
          });
        }

        const productId = this.lastID;

        if (images.length === 0) {
          return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { id: productId, ...productData, images },
          });
        }

        // Insert images into product_images table
        const placeholders = images.map(() => '(?, ?, ?, ?)').join(', ');
        const values = [];
        images.forEach((img, idx) => {
          values.push(productId, img, idx, new Date().toISOString());
        });

        db.run(
          `INSERT INTO product_images (productId, imageUrl, sortOrder, createdAt) VALUES ${placeholders}`,
          values,
          (imgErr) => {
            if (imgErr) {
              console.error('Insert product_images error:', imgErr);
              return res.status(500).json({
                success: false,
                message: 'Product created but images failed to save',
                error: imgErr.message,
              });
            }
            res.status(201).json({
              success: true,
              message: 'Product created successfully',
              data: { id: productId, ...productData, images },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE PRODUCT (ADMIN) — with images
// ============================================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;

    // Normalize images array
    let images = [];
    if (Array.isArray(productData.images) && productData.images.length > 0) {
      images = productData.images.filter(Boolean);
    } else if (productData.imageUrl) {
      images = [productData.imageUrl];
    }

    const mainImageUrl = images[0] || '';

    db.run(
      `UPDATE products SET 
        name = ?, sku = ?, description = ?, price = ?, discountedPrice = ?, 
        stock = ?, category = ?, brand = ?, imageUrl = ?, images = ?, specifications = ?,
        isBestSeller = ?, isNewArrival = ?, isHotDeal = ?, isFeatured = ?, isBundle = ?, isMostPopular = ?,
        updatedAt = ? 
        WHERE id = ?`,
      [
        productData.name,
        productData.sku,
        productData.description,
        parseFloat(productData.price) || 0,
        parseFloat(productData.discountedPrice) || 0,
        parseInt(productData.stock) || 0,
        productData.category || '',
        productData.brand || '',
        mainImageUrl,
        '[]',
        productData.specifications || '',
        productData.isBestSeller ? 1 : 0,
        productData.isNewArrival ? 1 : 0,
        productData.isHotDeal ? 1 : 0,
        productData.isFeatured ? 1 : 0,
        productData.isBundle ? 1 : 0,
        productData.isMostPopular ? 1 : 0,
        new Date().toISOString(),
        productId,
      ],
      function (err) {
        if (err) {
          console.error('Update product error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: err.message,
          });
        }
        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
          });
        }

        // Delete old images and insert new ones
        db.run('DELETE FROM product_images WHERE productId = ?', [productId], (delErr) => {
          if (delErr) console.error('Delete old images error:', delErr);

          if (images.length === 0) {
            return res.json({
              success: true,
              message: 'Product updated successfully',
              data: { id: productId, ...productData, images },
            });
          }

          const placeholders = images.map(() => '(?, ?, ?, ?)').join(', ');
          const values = [];
          images.forEach((img, idx) => {
            values.push(productId, img, idx, new Date().toISOString());
          });

          db.run(
            `INSERT INTO product_images (productId, imageUrl, sortOrder, createdAt) VALUES ${placeholders}`,
            values,
            (imgErr) => {
              if (imgErr) {
                console.error('Insert product_images error:', imgErr);
                return res.status(500).json({
                  success: false,
                  message: 'Product updated but images failed to save',
                  error: imgErr.message,
                });
              }
              res.json({
                success: true,
                message: 'Product updated successfully',
                data: { id: productId, ...productData, images },
              });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// ============================================================
// DELETE PRODUCT (ADMIN) — also deletes images
// ============================================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Delete images first (avoid orphan rows)
    db.run('DELETE FROM product_images WHERE productId = ?', [productId], (imgErr) => {
      if (imgErr) console.error('Delete product images error:', imgErr);

      db.run('DELETE FROM products WHERE id = ?', [productId], function (err) {
        if (err)
          return res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: err.message,
          });
        if (this.changes === 0)
          return res.status(404).json({
            success: false,
            message: 'Product not found',
          });
        res.json({ success: true, message: 'Product deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL ORDERS (ADMIN)
// ============================================================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT o.*, u.firstName, u.lastName, u.email 
         FROM orders o
         LEFT JOIN users u ON o.userId = u.id
         ORDER BY o.createdAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log('📋 Raw orders from DB:', orders.length);

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await new Promise((resolve, reject) => {
          db.all(
            `SELECT oi.*, p.imageUrl 
             FROM order_items oi
             LEFT JOIN products p ON oi.productId = p.id
             WHERE oi.orderId = ?`,
            [order.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });

        const formattedItems = items.map((item) => {
          let imageUrl =
            item.imageUrl || 'https://via.placeholder.com/80x80/cccccc/ffffff?text=No+Image';
          if (item.imageUrl) {
            imageUrl = item.imageUrl;
          }
          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            imageUrl: imageUrl,
          };
        });

        return {
          id: order.orderNumber || `ORD-${order.id}`,
          orderId: order.id,
          customer: order.firstName ? `${order.firstName} ${order.lastName}` : 'Guest',
          email: order.email || 'N/A',
          total: order.totalAmount || 0,
          totalAmount: order.totalAmount || 0,
          status: order.status || 'Pending',
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          createdAt: order.createdAt,
          items: formattedItems,
          itemCount: formattedItems.length,
          paymentMethod: order.paymentMethod || 'N/A',
          shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        };
      })
    );

    console.log('✅ Formatted orders with items:', formattedOrders.length);

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE ORDER STATUS (ADMIN)
// ============================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    console.log(`📝 Updating order ${orderId} status to: ${status}`);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    let result = 0;

    // Try by numeric id first
    if (!isNaN(orderId)) {
      result = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?`,
          [status, new Date().toISOString(), parseInt(orderId)],
          function (err) {
            if (err) {
              console.error('❌ Update by id error:', err);
              reject(err);
            } else {
              resolve(this.changes);
            }
          }
        );
      });
    }

    // Fall back to orderNumber
    if (result === 0) {
      result = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE orders SET status = ?, updatedAt = ? WHERE orderNumber = ?`,
          [status, new Date().toISOString(), orderId],
          function (err) {
            if (err) {
              console.error('❌ Update by orderNumber error:', err);
              reject(err);
            } else {
              resolve(this.changes);
            }
          }
        );
      });
    }

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    console.log('✅ Order status updated successfully');
    res.json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('❌ Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL USERS (ADMIN)
// ============================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, firstName, lastName, email, phone, role, createdAt FROM users ORDER BY createdAt DESC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// ============================================================
// GET ANALYTICS DATA (for Analytics page)
// ============================================================
exports.getAnalytics = async (req, res) => {
  try {
    // ---------- 1. Revenue trend (last 7 days) ----------
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, totalAmount, status, createdAt FROM orders 
         WHERE createdAt >= ? ORDER BY createdAt ASC`,
        [sevenDaysAgo.toISOString()],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // Build day buckets for last 7 days
    const dayBuckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      dayBuckets[key] = { date: key, revenue: 0, orders: 0 };
    }

    recentOrders.forEach((o) => {
      const key = (o.createdAt || '').split('T')[0];
      if (dayBuckets[key]) {
        dayBuckets[key].revenue += o.totalAmount || 0;
        dayBuckets[key].orders += 1;
      }
    });

    const revenueTrend = Object.values(dayBuckets).map((b) => ({
      date: b.date,
      label: new Date(b.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      revenue: Math.round(b.revenue),
      orders: b.orders,
    }));

    // ---------- 2. Monthly revenue (last 6 months) ----------
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT totalAmount, createdAt FROM orders 
         WHERE createdAt >= ? ORDER BY createdAt ASC`,
        [sixMonthsAgo.toISOString()],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    const monthBuckets = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthBuckets[key] = {
        month: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: 0,
        orders: 0,
      };
    }

    monthlyOrders.forEach((o) => {
      const d = new Date(o.createdAt || '');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthBuckets[key]) {
        monthBuckets[key].revenue += o.totalAmount || 0;
        monthBuckets[key].orders += 1;
      }
    });

    const monthlyTrend = Object.values(monthBuckets).map((b) => ({
      ...b,
      revenue: Math.round(b.revenue),
    }));

    // ---------- 3. Top 5 selling products ----------
    const topProducts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           oi.productId,
           oi.productName,
           SUM(oi.quantity) as totalQty,
           SUM(oi.total) as totalRevenue
         FROM order_items oi
         GROUP BY oi.productId, oi.productName
         ORDER BY totalQty DESC
         LIMIT 5`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // ---------- 4. Order status breakdown ----------
    const statusBreakdown = await new Promise((resolve, reject) => {
      db.all(
        `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // ---------- 5. Category-wise product count ----------
    const categoryStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT category, COUNT(*) as count FROM products 
         WHERE category IS NOT NULL AND category != ''
         GROUP BY category
         ORDER BY count DESC
         LIMIT 6`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // ---------- 6. Top customers (by spend) ----------
    // ✅ NEW — this was missing!
    const topCustomers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           u.id, u.firstName, u.lastName, u.email,
           COUNT(o.id) as orderCount,
           SUM(o.totalAmount) as totalSpent
         FROM users u
         INNER JOIN orders o ON o.userId = u.id
         GROUP BY u.id
         ORDER BY totalSpent DESC
         LIMIT 5`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // ---------- 7. Summary metrics ----------
    const allOrders = await new Promise((resolve, reject) => {
      db.all('SELECT totalAmount, createdAt FROM orders', (err, rows) =>
        err ? reject(err) : resolve(rows || [])
      );
    });

    const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today vs Yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let todayRevenue = 0;
    let yesterdayRevenue = 0;

    allOrders.forEach((o) => {
      const key = (o.createdAt || '').split('T')[0];
      if (key === today) todayRevenue += o.totalAmount || 0;
      if (key === yesterday) yesterdayRevenue += o.totalAmount || 0;
    });

    const revenueChange =
      yesterdayRevenue > 0
        ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
        : (todayRevenue > 0 ? 100 : 0);

    // This month vs last month
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    allOrders.forEach((o) => {
      const d = new Date(o.createdAt || '');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key === thisMonthKey) thisMonthRevenue += o.totalAmount || 0;
      if (key === lastMonthKey) lastMonthRevenue += o.totalAmount || 0;
    });

    const monthChange =
      lastMonthRevenue > 0
        ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : (thisMonthRevenue > 0 ? 100 : 0);

    res.json({
      success: true,
      data: {
        revenueTrend,
        monthlyTrend,
        topProducts: topProducts.map((p) => ({
          name: p.productName || 'Unknown',
          qty: p.totalQty || 0,
          revenue: Math.round(p.totalRevenue || 0),
        })),
        statusBreakdown: statusBreakdown.map((s) => ({
          name: s.status || 'Pending',
          value: s.count || 0,
        })),
        categoryStats: categoryStats.map((c) => ({
          name: c.category,
          count: c.count,
        })),
        // ✅ NEW: Send topCustomers
        topCustomers: topCustomers.map((c) => ({
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Guest',
          email: c.email || 'N/A',
          orders: c.orderCount || 0,
          spent: Math.round(c.totalSpent || 0),
        })),
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue),
          todayRevenue: Math.round(todayRevenue),
          yesterdayRevenue: Math.round(yesterdayRevenue),
          revenueChange: parseFloat(revenueChange),
          thisMonthRevenue: Math.round(thisMonthRevenue),
          lastMonthRevenue: Math.round(lastMonthRevenue),
          monthChange: parseFloat(monthChange),
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};


// ============================================================
// GET ALL REVIEWS (ADMIN) — with product info
// ============================================================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           r.*,
           p.name as productName,
           p.imageUrl as productImage,
           p.sku as productSku
         FROM reviews r
         LEFT JOIN products p ON r.productId = p.id
         ORDER BY r.createdAt DESC`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ============================================================
// DELETE REVIEW (ADMIN)
// ============================================================
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    // Get the review first to know the product ID
    const review = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM reviews WHERE id = ?', [reviewId], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Delete the review
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM reviews WHERE id = ?', [reviewId], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // Recalculate product rating & reviewCount
    const remaining = await new Promise((resolve, reject) => {
      db.all(
        'SELECT rating FROM reviews WHERE productId = ?',
        [review.productId],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    const totalReviews = remaining.length;
    const avgRating =
      totalReviews > 0
        ? remaining.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET rating = ?, reviewCount = ? WHERE id = ?',
        [Math.round(avgRating * 10) / 10, totalReviews, review.productId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// ============================================================
// CREATE CATEGORY (ADMIN)
// ============================================================
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    db.run(
      'INSERT INTO categories (name, slug, productCount, createdAt) VALUES (?, ?, 0, ?)',
      [name, finalSlug, new Date().toISOString()],
      function (err) {
        if (err) {
          console.error('Create category error:', err);
          return res.status(500).json({ success: false, message: 'Failed to create category', error: err.message });
        }
        res.status(201).json({
          success: true,
          message: 'Category created successfully',
          data: { id: this.lastID, name, slug: finalSlug, productCount: 0 },
        });
      }
    );
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// ============================================================
// UPDATE CATEGORY (ADMIN)
// ============================================================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    db.run(
      'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
      [name, finalSlug, id],
      function (err) {
        if (err) {
          console.error('Update category error:', err);
          return res.status(500).json({ success: false, message: 'Failed to update category', error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// ============================================================
// DELETE CATEGORY (ADMIN)
// ============================================================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Delete category error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete category', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.json({ success: true, message: 'Category deleted successfully' });
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

// ============================================================
// IMPORT PRODUCTS FROM CSV (ADMIN)
// ============================================================
exports.importProductsFromCSV = async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        message: 'CSV data is required',
      });
    }

    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV must have a header row and at least one data row',
      });
    }

    // Skip header
    const dataLines = lines.slice(1);
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    const importedProducts = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      try {
        // Parse CSV line (handle quotes)
        const fields = parseCSVLine(line);
        
        const collection = fields[0] || '';
        const productName = fields[1] || '';
        const priceStr = fields[2] || '0';
        // fields[3] is sku_collection - SKIP
        const rawDescription = fields[4] || '';
        const imagesStr = fields[6] || '';
        
        // Parse price
        const price = parseFloat(
          priceStr.replace(/Rs\.?\s*/gi, '').replace(/,/g, '').trim()
        ) || 0;
        
        // Clean description
        let description = rawDescription.trim();
        if (description.toLowerCase().startsWith('description')) {
          description = description.substring(11).trim();
        }
        if (description.startsWith(':')) {
          description = description.substring(1).trim();
        }
        
        // Parse images
        const images = imagesStr
          .split('|')
          .map(img => img.trim())
          .filter(Boolean);
        
        // Generate SKU
        const sku = `RK${String(Date.now()).slice(-5)}${i}`;
        
        // Determine category
        let category = 'Sewing Parts';
        if (productName.toLowerCase().includes('needle')) {
          category = 'Needles';
        }
        
        // Insert product
        const productId = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO products (
              name, sku, description, price, discountedPrice, stock, 
              category, brand, imageUrl, images, specifications,
              isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, 
              isMostPopular, rating, reviewCount, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
            [
              productName,
              sku,
              description,
              price,
              price,
              100,
              category,
              extractBrand(productName),
              images[0] || '',
              '[]',
              '',
              0, 0, 0, 0, 0, 0,
              new Date().toISOString(),
              new Date().toISOString()
            ],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        
        // Insert images
        for (let j = 0; j < images.length; j++) {
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO product_images (productId, imageUrl, sortOrder, createdAt) VALUES (?, ?, ?, ?)`,
              [productId, images[j], j, new Date().toISOString()],
              (err) => err ? reject(err) : resolve()
            );
          });
        }
        
        imported++;
        importedProducts.push({ id: productId, name: productName });
        
      } catch (error) {
        failed++;
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Imported ${imported} products, ${failed} failed`,
      data: {
        imported,
        failed,
        errors: errors.slice(0, 10), // Limit errors shown
        products: importedProducts,
      },
    });

  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import CSV',
      error: error.message,
    });
  }
};

// Helper: Parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Helper: Extract brand
function extractBrand(name) {
  if (!name) return '';
  const brands = ['Groz Beckert', 'Flying Tiger', 'Organ', 'JUKI', 'JACK', 'Brother'];
  const lowerName = name.toLowerCase();
  for (const brand of brands) {
    if (lowerName.includes(brand.toLowerCase())) return brand;
  }
  return '';
}