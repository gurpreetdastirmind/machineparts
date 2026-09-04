const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import auth middleware and controllers
const { auth, adminAuth } = require('./middleware/auth');
const authController = require('./controllers/authController');
const { db } = require('./config/database');

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Protected Routes (require auth)
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// User profile route
app.get('/api/user/profile', auth, authController.getProfile);

// Admin Routes (require auth + admin role)
app.use('/api/admin', adminRoutes);

// NEW ROUTE: Add New Category API Endpoint (also accessible via adminRoutes)
app.post('/api/admin/categories', adminAuth, (req, res) => {
  const { name, slug } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const newCat = {
    id: Date.now(),
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    productCount: 0,
    createdAt: new Date().toISOString()
  };
  
  // Insert into SQLite
  db.run(
    'INSERT INTO categories (name, slug, productCount, createdAt) VALUES (?, ?, ?, ?)',
    [newCat.name, newCat.slug, newCat.productCount, newCat.createdAt],
    function(err) {
      if (err) {
        console.error('Error creating category:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create category',
          error: err.message 
        });
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Category created successfully',
        data: { ...newCat, id: this.lastID }
      });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// In server.js, ensure this endpoint exists and returns proper data
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: err.message 
      })
    }
    res.json({ 
      success: true, 
      data: rows || [] 
    })
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔐 Admin API at http://localhost:${PORT}/api/admin`);
  console.log(`\n🔑 Demo Admin: admin@example.com / admin123`);
});