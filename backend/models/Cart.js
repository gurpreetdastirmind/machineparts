const db = require('../config/database');

class Cart {
  static findUserCart(userId) {
    return db.carts.filter(c => c.userId === parseInt(userId));
  }

  static findItem(userId, productId) {
    return db.carts.find(c => c.userId === parseInt(userId) && c.productId === parseInt(productId));
  }

  static addItem(userId, productId, quantity = 1, variantId = null) {
    const existing = this.findItem(userId, productId);
    if (existing) {
      existing.quantity += quantity;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }
    
    const newItem = {
      id: db.carts.length + 1,
      userId: parseInt(userId),
      productId: parseInt(productId),
      variantId: variantId,
      quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.carts.push(newItem);
    return newItem;
  }

  static updateItem(id, userId, quantity) {
    const item = db.carts.find(c => c.id === parseInt(id) && c.userId === parseInt(userId));
    if (item) {
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
      return item;
    }
    return null;
  }

  static removeItem(id, userId) {
    const index = db.carts.findIndex(c => c.id === parseInt(id) && c.userId === parseInt(userId));
    if (index !== -1) {
      db.carts.splice(index, 1);
      return true;
    }
    return false;
  }

  static clearUserCart(userId) {
    db.carts = db.carts.filter(c => c.userId !== parseInt(userId));
    return true;
  }
}

module.exports = Cart;