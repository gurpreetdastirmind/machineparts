const { db, findCategoryById } = require('../config/database');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    // FIX: Use db.all with a Promise to fetch all categories
    const categories = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // FIX: Use db.get with a Promise and parameterized query
    const category = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [categoryId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // FIX: Use db.get with a Promise and parameterized query
    const category = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE slug = ?', [slug], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};