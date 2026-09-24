// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'machineparts.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ✅ findProductById fetches images from product_images table
const findProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);

      if (!row) return resolve(row);

      // Fetch images from product_images table
      db.all(
        'SELECT imageUrl FROM product_images WHERE productId = ? ORDER BY sortOrder ASC, id ASC',
        [id],
        (imgErr, imgRows) => {
          if (imgErr) {
            console.error('Error fetching product images:', imgErr);
            row.images = row.imageUrl ? [row.imageUrl] : [];
          } else {
            const fromTable = (imgRows || []).map((r) => r.imageUrl);
            row.images = fromTable.length > 0
              ? fromTable
              : (row.imageUrl ? [row.imageUrl] : []);
          }
          resolve(row);
        }
      );
    });
  });
};

const findCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getCartItems = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM carts WHERE userId = ?', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getOrders = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders WHERE userId = ?', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// ============================================================
// ADD MISSING COLUMNS (migrations)
// ============================================================
const addMissingColumns = () => {
  const columns = [
    ['isBestSeller', 'INTEGER DEFAULT 0'],
    ['isNewArrival', 'INTEGER DEFAULT 0'],
    ['isHotDeal', 'INTEGER DEFAULT 0'],
    ['isFeatured', 'INTEGER DEFAULT 0'],
    ['isBundle', 'INTEGER DEFAULT 0'],
    ['isMostPopular', 'INTEGER DEFAULT 0'],
    ['specifications', 'TEXT'],
    ['images', "TEXT DEFAULT '[]'"],
  ];

  columns.forEach(([name, type]) => {
    db.run(`ALTER TABLE products ADD COLUMN ${name} ${type}`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log(`⚠️ ${name} column error:`, err.message);
      } else if (!err) {
        console.log(`✅ ${name} column added`);
      }
    });
  });

  db.run(`ALTER TABLE order_items ADD COLUMN imageUrl TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ order_items.imageUrl error:', err.message);
    } else if (!err) {
      console.log('✅ order_items.imageUrl column added');
    }
  });
};

// ============================================================
// INITIALIZE TABLES AND SEED DATA
// ============================================================
const initDB = async () => {
  db.serialize(() => {
    // ---------- USERS ----------
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'user',
        password TEXT,
        resetToken TEXT,
        resetTokenExpiry INTEGER,
        createdAt TEXT
      )
    `);

    // ---------- CATEGORIES ----------
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        slug TEXT,
        productCount INTEGER DEFAULT 0,
        createdAt TEXT
      )
    `);

    // ---------- PRODUCTS ----------
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        sku TEXT,
        description TEXT,
        price REAL,
        discountedPrice REAL,
        stock INTEGER,
        category TEXT,
        categoryId INTEGER,
        brand TEXT,
        imageUrl TEXT,
        images TEXT DEFAULT '[]',
        specifications TEXT,
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        isBestSeller INTEGER DEFAULT 0,
        isNewArrival INTEGER DEFAULT 0,
        isHotDeal INTEGER DEFAULT 0,
        isFeatured INTEGER DEFAULT 0,
        isBundle INTEGER DEFAULT 0,
        isMostPopular INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // ---------- PRODUCT IMAGES (NEW) ----------
    db.run(
      `
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        imageUrl TEXT NOT NULL,
        sortOrder INTEGER DEFAULT 0,
        createdAt TEXT,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `,
      (err) => {
        if (err) console.error('Error creating product_images table:', err);
        else console.log('✅ product_images table ready');
      }
    );

    // ---------- CARTS ----------
    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // ---------- ORDERS ----------
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        orderNumber TEXT,
        totalAmount REAL,
        status TEXT DEFAULT 'Pending',
        paymentMethod TEXT,
        shippingAddress TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // ---------- ORDER ITEMS ----------
    db.run(
      `
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
    `,
      (err) => {
        if (err) console.error('Error creating order_items table:', err);
        else console.log('✅ order_items table ready');
      }
    );

    // ---------- REVIEWS ----------
    db.run(
      `
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER,
        userId INTEGER,
        userName TEXT,
        rating INTEGER,
        title TEXT,
        comment TEXT,
        helpfulCount INTEGER DEFAULT 0,
        createdAt TEXT,
        FOREIGN KEY (productId) REFERENCES products(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `,
      (err) => {
        if (err) console.error('Error creating reviews table:', err);
        else console.log('✅ reviews table ready');
      }
    );

    // ---------- COUPONS ----------
    db.run(
      `
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discountType TEXT DEFAULT 'percentage',
        discountValue REAL DEFAULT 0,
        minOrderAmount REAL DEFAULT 0,
        maxDiscount REAL DEFAULT 0,
        usageLimit INTEGER DEFAULT 0,
        usedCount INTEGER DEFAULT 0,
        validFrom TEXT,
        validUntil TEXT,
        isActive INTEGER DEFAULT 1,
        showOnHome INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
      )
    `,
      (err) => {
        if (err) console.error('Error creating coupons table:', err);
        else console.log('✅ coupons table ready');
      }
    );

    // ---------- COUPON USAGE ----------
    db.run(
      `
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couponId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        orderId INTEGER,
        code TEXT,
        usedAt TEXT,
        FOREIGN KEY (couponId) REFERENCES coupons(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(couponId, userId)
      )
    `,
      (err) => {
        if (err) console.error('Error creating coupon_usage table:', err);
        else console.log('✅ coupon_usage table ready');
      }
    );

    // ---------- ADD MISSING COLUMNS ----------
    console.log('🔍 Checking for missing columns...');
    addMissingColumns();

    // ============================================================
    // SEED ADMIN USER
    // ============================================================
    db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], async (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }

      const hashedPassword = await hashPassword('admin123');

      if (!row) {
        db.run(
          `INSERT INTO users (firstName, lastName, email, phone, role, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Admin', 'User', 'admin@example.com', '9876543211', 'admin', hashedPassword, new Date().toISOString()],
          (err) => {
            if (err) console.error('Error seeding admin:', err.message);
            else console.log('✅ Admin user created with hashed password');
          }
        );
      } else {
        db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@example.com'], (err) => {
          if (err) console.error('Error updating admin password:', err.message);
          else console.log('✅ Admin password updated with bcrypt');
        });
      }
    });

    // ============================================================
    // SEED CATEGORIES
    // ============================================================
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (row && row.count === 0) {
        const cats = [
          ['Sewing Parts', 'sewing-parts'],
          ['Cutting', 'cutting'],
          ['Fusing', 'fusing'],
          ['Steam Iron', 'steam-iron'],
          ['Household', 'household'],
          ['Needles', 'needles'],
        ];
        cats.forEach((cat) => {
          db.run(
            `INSERT INTO categories (name, slug, productCount, createdAt) VALUES (?, ?, 0, ?)`,
            [cat[0], cat[1], new Date().toISOString()]
          );
        });
        console.log('✅ Categories seeded');
      }
    });

    // ============================================================
    // SEED COUPONS
    // ============================================================
    db.get('SELECT COUNT(*) as count FROM coupons', (err, row) => {
      if (err) {
        console.error('Error checking coupons:', err.message);
        return;
      }

      if (row && row.count === 0) {
        const coupons = [
          ['WELCOME10', 'Get 10% off on your first order', 'percentage', 10, 500, 200, 100, 1, 1],
          ['SAVE20', 'Save 20% on orders above ₹1000', 'percentage', 20, 1000, 500, 50, 1, 1],
          ['FLAT100', 'Flat ₹100 off on orders above ₹500', 'fixed', 100, 500, 0, 200, 1, 1],
          ['MEGA50', 'Mega Sale - 50% off!', 'percentage', 50, 2000, 1000, 20, 1, 1],
          ['FIRSTBUY', 'Special discount for new customers', 'percentage', 15, 300, 300, 500, 1, 1],
          ['FESTIVE25', 'Festive season special offer', 'percentage', 25, 1500, 750, 100, 1, 1],
        ];

        coupons.forEach(
          ([code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, isActive, showOnHome]) => {
            db.run(
              `INSERT INTO coupons (code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, usedCount, validFrom, validUntil, isActive, showOnHome, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
              [
                code,
                description,
                discountType,
                discountValue,
                minOrderAmount,
                maxDiscount,
                usageLimit,
                new Date().toISOString(),
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                isActive,
                showOnHome,
                new Date().toISOString(),
                new Date().toISOString(),
              ],
              (err) => {
                if (err) console.error('Error seeding coupon:', err.message);
              }
            );
          }
        );
        console.log('✅ Coupons seeded');
      }
    });
  });
};

initDB();

module.exports = {
  db,
  findUserByEmail,
  findUserById,
  findProductById,
  findCategoryById,
  getCartItems,
  getOrders,
  hashPassword,
  comparePassword,
};