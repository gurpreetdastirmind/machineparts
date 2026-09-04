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

// Helper functions (using Promises for easier async/await in controllers)
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

const findProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
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

// Hash password helper
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password helper
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Add missing columns
const addMissingColumns = () => {
  db.run(`ALTER TABLE products ADD COLUMN isBestSeller INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isBestSeller column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isBestSeller column added');
    }
  });
  
  db.run(`ALTER TABLE products ADD COLUMN isNewArrival INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isNewArrival column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isNewArrival column added');
    }
  });
  
  db.run(`ALTER TABLE products ADD COLUMN isHotDeal INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isHotDeal column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isHotDeal column added');
    }
  });
  
  db.run(`ALTER TABLE products ADD COLUMN isFeatured INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isFeatured column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isFeatured column added');
    }
  });

  db.run(`ALTER TABLE products ADD COLUMN isBundle INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isBundle column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isBundle column added');
    }
  });

  // ✅ NEW: Add isMostPopular column
  db.run(`ALTER TABLE products ADD COLUMN isMostPopular INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('⚠️ isMostPopular column already exists or error:', err.message);
    } else if (!err) {
      console.log('✅ isMostPopular column added');
    }
  });
};

// Initialize Tables and Seed Data
const initDB = async () => {
  db.serialize(() => {
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'user',
        password TEXT,
        createdAt TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        slug TEXT,
        productCount INTEGER DEFAULT 0,
        createdAt TEXT
      )
    `);

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
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        isBestSeller INTEGER DEFAULT 0,
        isNewArrival INTEGER DEFAULT 0,
        isHotDeal INTEGER DEFAULT 0,
        isFeatured INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

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

    // Seed Admin User with hashed password
    db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], async (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }
      
      const hashedPassword = await hashPassword('admin123');
      
      if (!row) {
        // Create new admin user with hashed password
        db.run(
          `INSERT INTO users (firstName, lastName, email, phone, role, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Admin', 'User', 'admin@example.com', '9876543211', 'admin', hashedPassword, new Date().toISOString()],
          (err) => {
            if (err) console.error('Error seeding admin:', err.message);
            else console.log('✅ Admin user created with hashed password');
          }
        );
      } else {
        // Update existing admin with hashed password
        db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@example.com'], (err) => {
          if (err) console.error('Error updating admin password:', err.message);
          else console.log('✅ Admin password updated with bcrypt');
        });
      }
    });

    // Seed Categories if table is empty
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (row && row.count === 0) {
        const cats = [
          ['Sewing Parts', 'sewing-parts'], ['Cutting', 'cutting'], 
          ['Fusing', 'fusing'], ['Steam Iron', 'steam-iron'],
          ['Household', 'household'], ['Needles', 'needles']
        ];
        cats.forEach(cat => {
          db.run(`INSERT INTO categories (name, slug, productCount, createdAt) VALUES (?, ?, 0, ?)`, 
            [cat[0], cat[1], new Date().toISOString()]);
        });
        console.log('✅ Categories seeded');
      }
    });

    // Check for missing columns
    console.log('🔍 Checking for missing columns...');
    addMissingColumns();
  });
};

// Initialize the database
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
  comparePassword
};