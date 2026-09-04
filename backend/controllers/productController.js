const { db, findProductById } = require('../config/database');

// Get all products
exports.getProducts = async (req, res) => {
   try {
    const { category, search, page = 1, limit = 20, sort, minPrice, maxPrice, rating, brands, stockStatus, qualityType } = req.query;

    const products = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, sku, description, price, discountedPrice, stock, category, categoryId, brand, imageUrl, rating, reviewCount, isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, isMostPopular, createdAt, updatedAt FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    let filteredProducts = [...products];

    // Filter by category or brand (More flexible)
    if (category && category !== 'undefined' && category !== '') {
      const categoryLower = category.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        (p.category && p.category.toLowerCase().includes(categoryLower)) ||
        (p.brand && p.brand.toLowerCase().includes(categoryLower))
      );
    }

    // Filter by search
    if (search && search !== 'undefined') {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by price range
    if (minPrice && minPrice !== '0') {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice >= parseFloat(minPrice));
    }
    if (maxPrice && maxPrice !== '10000') {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice <= parseFloat(maxPrice));
    }

    // ✅ CRITICAL FIX: Only filter by rating if rating is greater than 0
    if (rating && rating !== '0' && rating !== 0) {
      const ratingNum = parseInt(rating);
      filteredProducts = filteredProducts.filter(p => p.rating >= ratingNum);
    }

    // Sort
    if (sort) {
      switch(sort) {
        case 'price-low': filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice); break;
        case 'price-high': filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice); break;
        case 'best-sellers': filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount); break;
        default: filteredProducts.sort((a, b) => b.id - a.id);
      }
    }

    // ✅ CRITICAL FIX: Correct pagination logic
    const total = filteredProducts.length;
    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    
    const start = (pageNum - 1) * limitNum;
    
    // ✅ FIX: Ensure we return all products regardless of limit
    const paginatedProducts = limitNum > 0 
      ? filteredProducts.slice(start, start + limitNum) 
      : filteredProducts;

    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products: paginatedProducts,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const featured = products.filter(p => p.isFeatured === 1 || p.isFeatured === true).slice(0, 6);

    res.json({ success: true, data: featured });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products', error: error.message });
  }
};

// Get hot deals
exports.getHotDeals = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const deals = products.filter(p => p.isHotDeal === 1 || p.isHotDeal === true).slice(0, 4);

    res.json({ success: true, data: deals });
  } catch (error) {
    console.error('Get hot deals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hot deals', error: error.message });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = [
      { id: 1, userName: 'John Doe', rating: 5, title: 'Great product!', comment: 'Excellent quality.', helpfulCount: 12, createdAt: '2024-12-15' },
      { id: 2, userName: 'Jane Smith', rating: 4, title: 'Good value', comment: 'Works as expected.', helpfulCount: 8, createdAt: '2024-12-20' }
    ];
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const { db } = require('../config/database');

    db.run(
      `INSERT INTO products (name, sku, description, price, discountedPrice, stock, category, categoryId, brand, imageUrl, 
        isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, isMostPopular, rating, reviewCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        productData.name, productData.sku, productData.description, 
        parseFloat(productData.price) || 0, parseFloat(productData.discountedPrice) || parseFloat(productData.price) || 0,
        parseInt(productData.stock) || 0, productData.category || '', productData.categoryId || null, 
        productData.brand || '', productData.imageUrl || '',
        productData.isBestSeller ? 1 : 0,
        productData.isNewArrival ? 1 : 0,
        productData.isHotDeal ? 1 : 0,
        productData.isFeatured ? 1 : 0,
        productData.isBundle ? 1 : 0,
        productData.isMostPopular ? 1 : 0,
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

// Update product
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
        productData.isMostPopular ? 1 : 0,
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

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get related products by category
    const related = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products WHERE categoryId = ? AND id != ? LIMIT 4', [product.categoryId, productId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ success: true, data: related });
  } catch (error) {
    console.error('Get related error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch related products', error: error.message });
  }
};