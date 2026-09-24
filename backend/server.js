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
  origin: ['http://localhost:5173', 'http://localhost:3000','https://machineparts.vercel.app'],
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
const contactRoutes = require('./routes/contactRoutes');
const couponRoutes = require('./routes/couponRoutes');

// Import auth middleware and controllers
const { auth, adminAuth } = require('./middleware/auth');
const authController = require('./controllers/authController');
const { db } = require('./config/database');

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/coupons', couponRoutes);

// Protected Routes (require auth)
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// User profile route
app.get('/api/user/profile', auth, authController.getProfile);

// Admin Routes (require auth + admin role)
app.use('/api/admin', adminRoutes);

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