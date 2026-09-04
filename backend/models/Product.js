const db = require('../config/database');

class Product {
  static findAll(filters = {}) {
    let products = [...db.products];
    
    if (filters.category) {
      const category = db.categories.find(c => c.slug === filters.category);
      if (category) {
        products = products.filter(p => p.categoryId === category.id);
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.minPrice) {
      products = products.filter(p => p.discountedPrice >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.discountedPrice <= parseFloat(filters.maxPrice));
    }
    
    return products;
  }

  static findById(id) {
    return db.products.find(p => p.id === parseInt(id));
  }

  static getFeatured() {
    return db.products.filter(p => p.discountedPrice < p.price).slice(0, 6);
  }

  static getHotDeals() {
    return db.products.filter(p => p.discountedPrice < p.price * 0.8).slice(0, 4);
  }

  static getNewArrivals(limit = 8) {
    return [...db.products].sort((a, b) => b.id - a.id).slice(0, limit);
  }

  static getBestSellers(limit = 8) {
    return [...db.products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
  }

  static getRelated(productId) {
    const product = this.findById(productId);
    if (!product) return [];
    return db.products
      .filter(p => p.id !== parseInt(productId) && p.categoryId === product.categoryId)
      .slice(0, 4);
  }

  static create(productData) {
    const newProduct = {
      id: db.products.length + 1,
      ...productData,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    return newProduct;
  }

  static update(id, productData) {
    const index = db.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...productData, updatedAt: new Date().toISOString() };
      return db.products[index];
    }
    return null;
  }

  static delete(id) {
    const index = db.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      db.products.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Product;