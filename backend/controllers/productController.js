// backend/controllers/productController.js
const { db, findProductById } = require('../config/database');

// ✅ Helper: fetch images for a list of product IDs in one query
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

// ✅ Helper: attach images to a product object
const attachImages = (product, imagesMap) => {
  const fromTable = imagesMap[product.id];
  const imgs = (fromTable && fromTable.length > 0)
    ? fromTable
    : (product.imageUrl ? [product.imageUrl] : []);
  return { ...product, images: imgs };
};

// ✅ Known part types — used to prevent overlap (e.g. Bobbin vs Bobbin Case)
const KNOWN_PART_TYPES = [
  'needle bar',
  'feed dog',
  'bobbin case',
  'bobbin',
  'hook set',
  'rotary hook',
  'presser foot',
  'pressure foot',
  'needle plate',
  'take-up lever',
  'thread tension',
  'feed regulator',
  'looper',
  'loopers',
  'cutter',
  'gauge set',
  'face plate',
  'throat plate',
  'feed reverse',
  'feed drive',
  'feed eccentric',
  'finger guard',
  'thread guide',
  'thread take-up',
  'tension disc',
  'oiler',
  'wick',
  'bushing',
  'bearing',
  'gear',
  'cam',
  'lever',
  'spring',
  'screw',
  'belt',
  'clutch',
  'knee lifter',
  'oil pump',
  'motor',
];

// ============================================================
// GET ALL PRODUCTS
// ============================================================
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 20,
      sort,
      minPrice,
      maxPrice,
      rating,
      brands,
      stockStatus,
      qualityType,
      partTypes,
      models,
      partNumbers,
    } = req.query;

    const products = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, sku, description, price, discountedPrice, stock, category, categoryId, brand, imageUrl, images, specifications, rating, reviewCount, isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, isMostPopular, createdAt, updatedAt FROM products`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const productIds = products.map((p) => p.id);
    const imagesMap = await fetchImagesForProducts(productIds);
    const parsedProducts = products.map((p) => attachImages(p, imagesMap));

    let filteredProducts = [...parsedProducts];

    const normalize = (s) => (s || '').toLowerCase().replace(/[\s\-_]+/g, '');

    // ============================================================
    // ✅ FIXED: Category filter — no empty-string matching
    // ============================================================
    if (category && category !== 'undefined' && category !== '' && category !== null) {
      const categoryList = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categoryList.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const pCat = normalize(p.category);
          const pBrand = normalize(p.brand);
          const pCatId = p.categoryId;

          return categoryList.some((cat) => {
            const c = normalize(cat);
            if (!c) return false;

            // ✅ Guard against empty strings
            if (pCat && pCat.includes(c)) return true;
            if (pBrand && pBrand.includes(c)) return true;
            if (pCat && c.includes(pCat)) return true;
            if (String(pCatId) === String(cat)) return true;

            return false;
          });
        });
      }
    }

    // Search filter
    if (search && search !== 'undefined' && search !== '') {
      const s = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s))
      );
    }

    // Price range
    if (minPrice && minPrice !== '0' && minPrice !== '') {
      filteredProducts = filteredProducts.filter(
        (p) => (p.discountedPrice || p.price) >= parseFloat(minPrice)
      );
    }
    if (maxPrice && maxPrice !== '10000' && maxPrice !== '') {
      filteredProducts = filteredProducts.filter(
        (p) => (p.discountedPrice || p.price) <= parseFloat(maxPrice)
      );
    }

    // Rating
    if (rating && rating !== '0' && rating !== 0 && rating !== '') {
      const ratingNum = parseInt(rating);
      filteredProducts = filteredProducts.filter((p) => (p.rating || 0) >= ratingNum);
    }

    // Brands
    if (brands && brands !== '' && brands !== 'undefined') {
      const brandList = brands.split(',').map((b) => b.trim().toLowerCase()).filter(Boolean);
      if (brandList.length > 0) {
        filteredProducts = filteredProducts.filter(
          (p) => p.brand && brandList.includes(p.brand.toLowerCase())
        );
      }
    }

    // Stock status
    if (stockStatus && stockStatus !== '' && stockStatus !== 'undefined') {
      const stockList = stockStatus.split(',').map((s) => s.trim().toLowerCase());
      if (stockList.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const inStock = (p.stock || 0) > 0;
          if (stockList.includes('in stock') && stockList.includes('out of stock')) return true;
          if (stockList.includes('in stock')) return inStock;
          if (stockList.includes('out of stock')) return !inStock;
          return true;
        });
      }
    }

    // Quality type
    if (qualityType && qualityType !== '' && qualityType !== 'undefined') {
      const qualityList = qualityType.split(',').map((q) => q.trim().toLowerCase());
      if (qualityList.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const q = (p.qualityType || p.brand || '').toLowerCase();
          return qualityList.some((item) => q.includes(item));
        });
      }
    }

    // ============================================================
    // Part Type filter
    // ============================================================
    if (partTypes && partTypes !== '' && partTypes !== 'undefined') {
      const typeList = partTypes
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (typeList.length > 0) {
        const sortedTypes = [...typeList].sort((a, b) => b.length - a.length);

        filteredProducts = filteredProducts.filter((p) => {
          const name = (p.name || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const haystack = `${name} ${desc}`;

          return sortedTypes.some((selectedType) => {
            const escaped = selectedType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const selectedRegex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (!selectedRegex.test(haystack)) return false;

            const moreSpecificTypes = KNOWN_PART_TYPES.filter((t) => {
              if (t === selectedType) return false;
              if (t.length <= selectedType.length) return false;
              return t.includes(selectedType);
            });

            const hasUnselectedMoreSpecific = moreSpecificTypes.some((more) => {
              if (typeList.includes(more)) return false;
              const moreEscaped = more.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const moreRegex = new RegExp(`\\b${moreEscaped}\\b`, 'i');
              return moreRegex.test(haystack);
            });

            if (hasUnselectedMoreSpecific) return false;
            return true;
          });
        });
      }
    }

    // Model filter
    if (models && models !== '' && models !== 'undefined') {
      const modelList = models.split(',').map((m) => m.trim()).filter(Boolean);
      if (modelList.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const haystack = `${p.name || ''} ${p.description || ''} ${p.sku || ''}`.toLowerCase();
          return modelList.some((model) => haystack.includes(model.toLowerCase()));
        });
      }
    }

    // Part Number filter
    if (partNumbers && partNumbers !== '' && partNumbers !== 'undefined') {
      const numList = partNumbers.split(',').map((n) => n.trim()).filter(Boolean);
      if (numList.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const haystack = `${p.name || ''} ${p.sku || ''} ${p.description || ''}`.toLowerCase();
          return numList.some((num) => haystack.includes(num.toLowerCase()));
        });
      }
    }

    // Sort
    if (sort) {
      switch (sort) {
        case 'price-low':
          filteredProducts.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
          break;
        case 'best-sellers':
        case 'most-reviewed':
          filteredProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        case 'newest':
        default:
          filteredProducts.sort((a, b) => b.id - a.id);
      }
    }

    const total = filteredProducts.length;
    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    const start = (pageNum - 1) * limitNum;
    const paginatedProducts =
      limitNum > 0 ? filteredProducts.slice(start, start + limitNum) : filteredProducts;

    console.log('🔍 Product filter:', {
      incomingCategory: category,
      partTypes,
      models,
      partNumbers,
      totalProducts: products.length,
      afterFilter: filteredProducts.length,
    });

    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products: paginatedProducts,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// ============================================================
// GET FEATURED PRODUCTS
// ============================================================
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const featuredRaw = products
      .filter((p) => p.isFeatured === 1 || p.isFeatured === true)
      .slice(0, 6);

    const ids = featuredRaw.map((p) => p.id);
    const imagesMap = await fetchImagesForProducts(ids);

    const featured = featuredRaw.map((p) => attachImages(p, imagesMap));

    res.json({ success: true, data: featured });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message,
    });
  }
};

// ============================================================
// GET HOT DEALS
// ============================================================
exports.getHotDeals = async (req, res) => {
  try {
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const dealsRaw = products
      .filter((p) => p.isHotDeal === 1 || p.isHotDeal === true)
      .slice(0, 4);

    const ids = dealsRaw.map((p) => p.id);
    const imagesMap = await fetchImagesForProducts(ids);

    const deals = dealsRaw.map((p) => attachImages(p, imagesMap));

    res.json({ success: true, data: deals });
  } catch (error) {
    console.error('Get hot deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hot deals',
      error: error.message,
    });
  }
};

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC`,
        [parseInt(productId)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ============================================================
// CREATE PRODUCT (with images)
// ============================================================
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

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
// UPDATE PRODUCT (with images)
// ============================================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;

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
// DELETE PRODUCT
// ============================================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

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
// GET RELATED PRODUCTS
// ============================================================
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let related = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM products 
         WHERE id != ? 
           AND (
             (categoryId IS NOT NULL AND categoryId = ?)
             OR (category IS NOT NULL AND category != '' AND category = ?)
             OR (brand IS NOT NULL AND brand != '' AND brand = ?)
           )
         ORDER BY 
           CASE 
             WHEN categoryId = ? THEN 1
             WHEN category = ? THEN 2
             WHEN brand = ? THEN 3
             ELSE 4
           END
         LIMIT 8`,
        [
          productId,
          product.categoryId || -1,
          product.category || '__none__',
          product.brand || '__none__',
          product.categoryId || -1,
          product.category || '__none__',
          product.brand || '__none__',
        ],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    if (related.length === 0) {
      related = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM products WHERE id != ? ORDER BY id DESC LIMIT 4`,
          [productId],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });
    }

    const ids = related.map((p) => p.id);
    const imagesMap = await fetchImagesForProducts(ids);
    const parsedRelated = related.slice(0, 4).map((p) => attachImages(p, imagesMap));

    res.json({ success: true, data: parsedRelated });
  } catch (error) {
    console.error('Get related error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products',
      error: error.message,
    });
  }
};

// ============================================================
// SUBMIT REVIEW
// ============================================================
exports.submitReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userId;
    const { rating, title, comment, userName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is required',
      });
    }

    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reviews (productId, userId, userName, rating, title, comment, helpfulCount, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          parseInt(productId),
          userId,
          userName || 'Anonymous',
          rating,
          title || '',
          comment.trim(),
          new Date().toISOString(),
        ],
        function (err) {
          if (err) {
            console.error('❌ Insert review error:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });

    const reviews = await new Promise((resolve, reject) => {
      db.all(
        'SELECT rating FROM reviews WHERE productId = ?',
        [parseInt(productId)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET rating = ?, reviewCount = ? WHERE id = ?',
        [Math.round(avgRating * 10) / 10, totalReviews, parseInt(productId)],
        function (err) {
          if (err) {
            console.error('❌ Update product rating error:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    const newReview = {
      id: result,
      productId: parseInt(productId),
      userId: userId,
      userName: userName || 'Anonymous',
      rating: rating,
      title: title || '',
      comment: comment.trim(),
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    console.log('✅ New review submitted and saved:', newReview);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview,
    });
  } catch (error) {
    console.error('❌ Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

// ============================================================
// GET DYNAMIC FILTERS FOR A CATEGORY/BRAND
// ============================================================
exports.getDynamicFilters = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category || category === '' || category === 'undefined') {
      return res.json({
        success: true,
        data: { partTypes: [], models: [], partNumbers: [] },
      });
    }

    const products = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, sku, description, brand, category FROM products`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    const normalize = (s) =>
      (s || '').toLowerCase().replace(/[\s\-_]+/g, '');

    const targetCategory = normalize(category);

    const matching = products.filter((p) => {
      const pCat = normalize(p.category);
      const pBrand = normalize(p.brand);

      if (pCat && pCat.includes(targetCategory)) return true;
      if (pBrand && pBrand.includes(targetCategory)) return true;

      return false;
    });

    const MODEL_PATTERNS = [
      /\b[A-Z]{2,4}-?\d{3,6}[A-Z0-9\-]*\b/gi,
      /\b[A-Z]{1,2}\d{1,4}[A-Z]?\b/g,
      /\b\d{4,5}\b/g,
    ];

    const PART_NUMBER_PATTERNS = [
      /\b\d{3,5}-\d{3,6}\b/g,
      /\b[A-Z]\d{3,4}-\d{1,3}\b/g,
      /\b\d{5,7}[A-Z]\d{0,2}\b/g,
    ];

    const partTypesSet = new Set();
    const modelsSet = new Set();
    const partNumbersSet = new Set();

    matching.forEach((p) => {
      const name = p.name || '';
      const desc = p.description || '';
      const sku = p.sku || '';
      const haystack = `${name} ${desc}`;

      KNOWN_PART_TYPES.forEach((type) => {
        const regex = new RegExp(`\\b${type.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regex.test(haystack)) {
          const display = type
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          partTypesSet.add(display);
        }
      });

      MODEL_PATTERNS.forEach((pattern) => {
        const matches = haystack.match(pattern) || [];
        matches.forEach((m) => {
          const clean = m.trim();
          if (clean.length < 2) return;
          if (/^\d+$/.test(clean) && clean.length < 4) return;
          if (/^\d{3,5}-\d{3,6}$/.test(clean)) return;
          modelsSet.add(clean);
        });
      });

      PART_NUMBER_PATTERNS.forEach((pattern) => {
        const sources = [name, sku];
        sources.forEach((src) => {
          const matches = src.match(pattern) || [];
          matches.forEach((m) => {
            const clean = m.trim();
            if (clean.length >= 4) {
              partNumbersSet.add(clean);
            }
          });
        });
      });
    });

    partNumbersSet.forEach((num) => modelsSet.delete(num));

    const sortAlpha = (a, b) => a.localeCompare(b, undefined, { numeric: true });

    const partTypes = Array.from(partTypesSet).sort(sortAlpha).slice(0, 30);
    const models = Array.from(modelsSet).sort(sortAlpha).slice(0, 60);
    const partNumbers = Array.from(partNumbersSet).sort(sortAlpha).slice(0, 60);

    console.log(`🎯 Dynamic filters for "${category}":`, {
      matchedProducts: matching.length,
      partTypes: partTypes.length,
      models: models.length,
      partNumbers: partNumbers.length,
    });

    res.json({
      success: true,
      data: {
        partTypes,
        models,
        partNumbers,
        totalProducts: matching.length,
      },
    });
  } catch (error) {
    console.error('Get dynamic filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters',
      error: error.message,
    });
  }
};