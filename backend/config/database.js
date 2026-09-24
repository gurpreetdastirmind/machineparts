// backend/config/database.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// ---------- PostgreSQL Connection ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// ---------- Compatibility wrapper (mimics sqlite3 API) ----------
// SQLite uses ? placeholders; Postgres uses $1, $2...
// This converts ? to $1, $2 automatically.
const convertPlaceholders = (sql) => {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
};

const db = {
  // db.get(sql, params, callback)
  get: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const pgSql = convertPlaceholders(sql);
    pool.query(pgSql, params || [])
      .then((res) => callback(null, res.rows[0]))
      .catch((err) => callback(err));
  },

  // db.all(sql, params, callback)
  all: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const pgSql = convertPlaceholders(sql);
    pool.query(pgSql, params || [])
      .then((res) => callback(null, res.rows))
      .catch((err) => callback(err));
  },

  // db.run(sql, params, callback)
  run: function (sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    // Handle INSERT: append RETURNING id so we can mimic lastID
    let pgSql = convertPlaceholders(sql);
    const isInsert = /^\s*INSERT\s+/i.test(sql);
    if (isInsert && !/RETURNING/i.test(sql)) {
      pgSql += ' RETURNING id';
    }

    const ctx = this;
    pool.query(pgSql, params || [])
      .then((res) => {
        ctx.lastID = res.rows[0]?.id || null;
        ctx.changes = res.rowCount;
        if (callback) callback.call(ctx, null);
      })
      .catch((err) => {
        if (callback) callback.call(ctx, err);
      });
  },

  // db.serialize (no-op for Postgres — used to queue operations in sqlite)
  serialize: (fn) => {
    if (fn) fn();
  },

  // db.prepare — minimal shim
  prepare: (sql) => ({
    run: (params, cb) => db.run(sql, params, cb),
    finalize: () => {},
  }),

  lastID: null,
  changes: 0,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = $1', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = $1', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const findProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = $1', [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(row);

      db.all(
        'SELECT "imageUrl" FROM product_images WHERE "productId" = $1 ORDER BY "sortOrder" ASC, id ASC',
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
    db.get('SELECT * FROM categories WHERE id = $1', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getCartItems = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM carts WHERE "userId" = $1', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getOrders = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders WHERE "userId" = $1', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// ============================================================
// TABLE CREATION (Postgres-compatible schema)
// ============================================================
const initDB = async () => {
  try {
    // USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "firstName" TEXT,
        "lastName" TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'user',
        password TEXT,
        "resetToken" TEXT,
        "resetTokenExpiry" BIGINT,
        "createdAt" TEXT
      )
    `);

    // CATEGORIES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT,
        slug TEXT,
        "productCount" INTEGER DEFAULT 0,
        "createdAt" TEXT
      )
    `);

    // PRODUCTS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT,
        sku TEXT,
        description TEXT,
        price REAL,
        "discountedPrice" REAL,
        stock INTEGER,
        category TEXT,
        "categoryId" INTEGER,
        brand TEXT,
        "imageUrl" TEXT,
        images TEXT DEFAULT '[]',
        specifications TEXT,
        rating REAL DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "isBestSeller" INTEGER DEFAULT 0,
        "isNewArrival" INTEGER DEFAULT 0,
        "isHotDeal" INTEGER DEFAULT 0,
        "isFeatured" INTEGER DEFAULT 0,
        "isBundle" INTEGER DEFAULT 0,
        "isMostPopular" INTEGER DEFAULT 0,
        "createdAt" TEXT,
        "updatedAt" TEXT
      )
    `);

    // PRODUCT IMAGES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        "imageUrl" TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TEXT
      )
    `);

    // CARTS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER,
        "productId" INTEGER,
        quantity INTEGER,
        price REAL,
        "createdAt" TEXT,
        "updatedAt" TEXT
      )
    `);

    // ORDERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER,
        "orderNumber" TEXT,
        "totalAmount" REAL,
        status TEXT DEFAULT 'Pending',
        "paymentMethod" TEXT,
        "shippingAddress" TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT
      )
    `);

    // ORDER ITEMS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER REFERENCES orders(id),
        "productId" INTEGER,
        "productName" TEXT,
        quantity INTEGER,
        price REAL,
        total REAL,
        "imageUrl" TEXT,
        "createdAt" TEXT
      )
    `);

    // REVIEWS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        "productId" INTEGER REFERENCES products(id),
        "userId" INTEGER REFERENCES users(id),
        "userName" TEXT,
        rating INTEGER,
        title TEXT,
        comment TEXT,
        "helpfulCount" INTEGER DEFAULT 0,
        "createdAt" TEXT
      )
    `);

    // COUPONS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        "discountType" TEXT DEFAULT 'percentage',
        "discountValue" REAL DEFAULT 0,
        "minOrderAmount" REAL DEFAULT 0,
        "maxDiscount" REAL DEFAULT 0,
        "usageLimit" INTEGER DEFAULT 0,
        "usedCount" INTEGER DEFAULT 0,
        "validFrom" TEXT,
        "validUntil" TEXT,
        "isActive" INTEGER DEFAULT 1,
        "showOnHome" INTEGER DEFAULT 0,
        "createdAt" TEXT,
        "updatedAt" TEXT
      )
    `);

    // COUPON USAGE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id SERIAL PRIMARY KEY,
        "couponId" INTEGER NOT NULL REFERENCES coupons(id),
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "orderId" INTEGER,
        code TEXT,
        "usedAt" TEXT,
        UNIQUE("couponId", "userId")
      )
    `);

    // ---------- SEED ADMIN ----------
    const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    const hashedPassword = await hashPassword('admin123');

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, phone, role, password, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Admin', 'User', 'admin@example.com', '9876543211', 'admin', hashedPassword, new Date().toISOString()]
      );
      console.log('✅ Admin user created');
    } else {
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@example.com']);
      console.log('✅ Admin password updated');
    }

    // ---------- SEED CATEGORIES ----------
    const catCheck = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      const cats = [
        ['Sewing Parts', 'sewing-parts'],
        ['Cutting', 'cutting'],
        ['Fusing', 'fusing'],
        ['Steam Iron', 'steam-iron'],
        ['Household', 'household'],
        ['Needles', 'needles'],
      ];
      for (const [name, slug] of cats) {
        await pool.query(
          `INSERT INTO categories (name, slug, "productCount", "createdAt") VALUES ($1, $2, 0, $3)`,
          [name, slug, new Date().toISOString()]
        );
      }
      console.log('✅ Categories seeded');
    }

    // ---------- SEED COUPONS ----------
    const couponCheck = await pool.query('SELECT COUNT(*) as count FROM coupons');
    if (parseInt(couponCheck.rows[0].count) === 0) {
      const coupons = [
        ['WELCOME10', 'Get 10% off on your first order', 'percentage', 10, 500, 200, 100, 1, 1],
        ['SAVE20', 'Save 20% on orders above ₹1000', 'percentage', 20, 1000, 500, 50, 1, 1],
        ['FLAT100', 'Flat ₹100 off on orders above ₹500', 'fixed', 100, 500, 0, 200, 1, 1],
        ['MEGA50', 'Mega Sale - 50% off!', 'percentage', 50, 2000, 1000, 20, 1, 1],
        ['FIRSTBUY', 'Special discount for new customers', 'percentage', 15, 300, 300, 500, 1, 1],
        ['FESTIVE25', 'Festive season special offer', 'percentage', 25, 1500, 750, 100, 1, 1],
      ];
      for (const c of coupons) {
        await pool.query(
          `INSERT INTO coupons (code, description, "discountType", "discountValue", "minOrderAmount", "maxDiscount", "usageLimit", "usedCount", "validFrom", "validUntil", "isActive", "showOnHome", "createdAt", "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13)`,
          [
            c[0], c[1], c[2], c[3], c[4], c[5], c[6],
            new Date().toISOString(),
            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            c[7], c[8],
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }
      console.log('✅ Coupons seeded');
    }

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
};

initDB();

module.exports = {
  db,
  pool,
  findUserByEmail,
  findUserById,
  findProductById,
  findCategoryById,
  getCartItems,
  getOrders,
  hashPassword,
  comparePassword,
};