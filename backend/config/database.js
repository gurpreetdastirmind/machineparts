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

pool.on('connect', () => console.log('✅ Connected to PostgreSQL database'));
pool.on('error', (err) => console.error('PostgreSQL pool error:', err.message));

// ---------- SQL keywords to skip when quoting ----------
const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'AS', 'ON', 'JOIN',
  'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ORDER', 'BY', 'GROUP', 'HAVING',
  'LIMIT', 'OFFSET', 'ASC', 'DESC', 'LIKE', 'ILIKE', 'BETWEEN', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN',
  'MAX', 'COALESCE', 'LOWER', 'UPPER', 'NOW', 'CURRENT_TIMESTAMP', 'TRUE',
  'FALSE', 'RETURNING', 'PRIMARY', 'KEY', 'REFERENCES', 'DEFAULT', 'UNIQUE',
  'CREATE', 'TABLE', 'IF', 'EXISTS', 'SERIAL', 'INTEGER', 'TEXT', 'REAL',
  'BIGINT', 'BOOLEAN', 'PRIMARY', 'NULL', 'CONSTRAINT', 'CASCADE', 'CHECK',
  'FOREIGN', 'AUTOINCREMENT', 'BEGIN', 'COMMIT', 'ROLLBACK',
]);

// ---------- Convert ? to $1, $2 and quote camelCase identifiers ----------
const convertSql = (sql) => {
  // Step 1: Replace ? with $1, $2, ... (only outside of quotes)
  let i = 0;
  let pgSql = sql.replace(/\?/g, () => `$${++i}`);

  // Step 2: Auto-quote camelCase identifiers (only those outside strings)
  // We do this by walking the string and rebuilding it.
  const result = [];
  let buffer = '';
  let inString = false;
  let stringChar = '';
  let inLineComment = false;

  const flush = () => {
    if (buffer.length === 0) return;
    const token = buffer;
    // Already quoted? Leave as-is
    if (/^"[^"]*"$/.test(token)) {
      result.push(token);
    }
    // CamelCase identifier? Quote it.
    else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
      // Skip pure lowercase (no camelCase) unless it's a keyword
      const hasUpper = /[A-Z]/.test(token);
      if (hasUpper && !SQL_KEYWORDS.has(token.toUpperCase())) {
        result.push(`"${token}"`);
      } else {
        result.push(token);
      }
    } else {
      result.push(token);
    }
    buffer = '';
  };

  for (let k = 0; k < pgSql.length; k++) {
    const ch = pgSql[k];
    const next = pgSql[k + 1];

    if (inLineComment) {
      buffer += ch;
      if (ch === '\n') inLineComment = false;
      flush();
      continue;
    }

    if (!inString && ch === '-' && next === '-') {
      inLineComment = true;
      buffer += ch;
      continue;
    }

    if (!inString && (ch === '"' || ch === "'")) {
      flush();
      inString = true;
      stringChar = ch;
      buffer += ch;
      continue;
    }

    if (inString) {
      buffer += ch;
      if (ch === stringChar) {
        // escaped quote? '' inside '...'
        if (pgSql[k + 1] === stringChar) {
          buffer += pgSql[k + 1];
          k++;
        } else {
          inString = false;
          flush();
        }
      }
      continue;
    }

    if (/[A-Za-z0-9_]/.test(ch)) {
      buffer += ch;
    } else {
      flush();
      result.push(ch);
    }
  }
  flush();

  return result.join('');
};

const db = {
  get: (sql, params, callback) => {
    if (typeof params === 'function') { callback = params; params = []; }
    const pgSql = convertSql(sql);
    pool.query(pgSql, params || [])
      .then((res) => callback(null, res.rows[0]))
      .catch((err) => callback(err));
  },

  all: (sql, params, callback) => {
    if (typeof params === 'function') { callback = params; params = []; }
    const pgSql = convertSql(sql);
    pool.query(pgSql, params || [])
      .then((res) => callback(null, res.rows))
      .catch((err) => callback(err));
  },

  run: function (sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }

    let pgSql = convertSql(sql);
    const isInsert = /^\s*INSERT\s+/i.test(sql);
    if (isInsert && !/RETURNING/i.test(pgSql)) {
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

  serialize: (fn) => { if (fn) fn(); },

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
const findUserByEmail = (email) => new Promise((resolve, reject) => {
  db.get('SELECT * FROM users WHERE email = $1', [email], (err, row) => err ? reject(err) : resolve(row));
});

const findUserById = (id) => new Promise((resolve, reject) => {
  db.get('SELECT * FROM users WHERE id = $1', [id], (err, row) => err ? reject(err) : resolve(row));
});

const findProductById = (id) => new Promise((resolve, reject) => {
  db.get('SELECT * FROM products WHERE id = $1', [id], (err, row) => {
    if (err) return reject(err);
    if (!row) return resolve(row);
    db.all('SELECT "imageUrl" FROM product_images WHERE "productId" = $1 ORDER BY "sortOrder" ASC, id ASC', [id], (imgErr, imgRows) => {
      if (imgErr) {
        row.images = row.imageUrl ? [row.imageUrl] : [];
      } else {
        const fromTable = (imgRows || []).map((r) => r.imageUrl);
        row.images = fromTable.length > 0 ? fromTable : (row.imageUrl ? [row.imageUrl] : []);
      }
      resolve(row);
    });
  });
});

const findCategoryById = (id) => new Promise((resolve, reject) => {
  db.get('SELECT * FROM categories WHERE id = $1', [id], (err, row) => err ? reject(err) : resolve(row));
});

const getCartItems = (userId) => new Promise((resolve, reject) => {
  db.all('SELECT * FROM carts WHERE "userId" = $1', [userId], (err, rows) => err ? reject(err) : resolve(rows));
});

const getOrders = (userId) => new Promise((resolve, reject) => {
  db.all('SELECT * FROM orders WHERE "userId" = $1', [userId], (err, rows) => err ? reject(err) : resolve(rows));
});

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (plainPassword, hashedPassword) => bcrypt.compare(plainPassword, hashedPassword);

// ============================================================
// TABLE CREATION
// ============================================================
const initDB = async () => {
  try {
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, email TEXT UNIQUE,
        phone TEXT, role TEXT DEFAULT 'user', password TEXT, "resetToken" TEXT,
        "resetTokenExpiry" BIGINT, "createdAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY, name TEXT, slug TEXT,
        "productCount" INTEGER DEFAULT 0, "createdAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name TEXT, sku TEXT, description TEXT, price REAL,
        "discountedPrice" REAL, stock INTEGER, category TEXT, "categoryId" INTEGER,
        brand TEXT, "imageUrl" TEXT, images TEXT DEFAULT '[]', specifications TEXT,
        rating REAL DEFAULT 0, "reviewCount" INTEGER DEFAULT 0,
        "isBestSeller" INTEGER DEFAULT 0, "isNewArrival" INTEGER DEFAULT 0,
        "isHotDeal" INTEGER DEFAULT 0, "isFeatured" INTEGER DEFAULT 0,
        "isBundle" INTEGER DEFAULT 0, "isMostPopular" INTEGER DEFAULT 0,
        "createdAt" TEXT, "updatedAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY, "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        "imageUrl" TEXT NOT NULL, "sortOrder" INTEGER DEFAULT 0, "createdAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY, "userId" INTEGER, "productId" INTEGER, quantity INTEGER,
        price REAL, "createdAt" TEXT, "updatedAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY, "userId" INTEGER, "orderNumber" TEXT, "totalAmount" REAL,
        status TEXT DEFAULT 'Pending', "paymentMethod" TEXT, "shippingAddress" TEXT,
        "createdAt" TEXT, "updatedAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY, "orderId" INTEGER REFERENCES orders(id), "productId" INTEGER,
        "productName" TEXT, quantity INTEGER, price REAL, total REAL,
        "imageUrl" TEXT, "createdAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY, "productId" INTEGER REFERENCES products(id),
        "userId" INTEGER REFERENCES users(id), "userName" TEXT, rating INTEGER,
        title TEXT, comment TEXT, "helpfulCount" INTEGER DEFAULT 0, "createdAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, description TEXT,
        "discountType" TEXT DEFAULT 'percentage', "discountValue" REAL DEFAULT 0,
        "minOrderAmount" REAL DEFAULT 0, "maxDiscount" REAL DEFAULT 0,
        "usageLimit" INTEGER DEFAULT 0, "usedCount" INTEGER DEFAULT 0,
        "validFrom" TEXT, "validUntil" TEXT, "isActive" INTEGER DEFAULT 1,
        "showOnHome" INTEGER DEFAULT 0, "createdAt" TEXT, "updatedAt" TEXT)`,
      `CREATE TABLE IF NOT EXISTS coupon_usage (
        id SERIAL PRIMARY KEY, "couponId" INTEGER NOT NULL REFERENCES coupons(id),
        "userId" INTEGER NOT NULL REFERENCES users(id), "orderId" INTEGER, code TEXT,
        "usedAt" TEXT, UNIQUE("couponId", "userId"))`,
    ];

    for (const stmt of createStatements) {
      await pool.query(stmt);
    }

    // Seed admin
    const hashedPassword = await hashPassword('admin123');
    const adminRes = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    if (adminRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, phone, role, password, "createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        ['Admin', 'User', 'admin@example.com', '9876543211', 'admin', hashedPassword, new Date().toISOString()]
      );
      console.log('✅ Admin user created');
    } else {
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@example.com']);
      console.log('✅ Admin password updated');
    }

    // Seed categories
    const catCount = await pool.query('SELECT COUNT(*)::int as count FROM categories');
    if (catCount.rows[0].count === 0) {
      const cats = [
        ['Sewing Parts', 'sewing-parts'], ['Cutting', 'cutting'], ['Fusing', 'fusing'],
        ['Steam Iron', 'steam-iron'], ['Household', 'household'], ['Needles', 'needles'],
      ];
      for (const [name, slug] of cats) {
        await pool.query(
          `INSERT INTO categories (name, slug, "productCount", "createdAt") VALUES ($1,$2,0,$3)`,
          [name, slug, new Date().toISOString()]
        );
      }
      console.log('✅ Categories seeded');
    }

    // Seed coupons
    const couponCount = await pool.query('SELECT COUNT(*)::int as count FROM coupons');
    if (couponCount.rows[0].count === 0) {
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
  db, pool, findUserByEmail, findUserById, findProductById,
  findCategoryById, getCartItems, getOrders, hashPassword, comparePassword,
};