const db = require('../config/database');

class Category {
  static findAll() {
    return db.categories;
  }

  static findById(id) {
    return db.categories.find(c => c.id === parseInt(id));
  }

  static findBySlug(slug) {
    return db.categories.find(c => c.slug === slug);
  }

  static create(categoryData) {
    const newCategory = {
      id: db.categories.length + 1,
      ...categoryData,
      productCount: 0,
      createdAt: new Date().toISOString()
    };
    db.categories.push(newCategory);
    return newCategory;
  }

  static update(id, categoryData) {
    const index = db.categories.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...categoryData };
      return db.categories[index];
    }
    return null;
  }

  static delete(id) {
    const index = db.categories.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      db.categories.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Category;