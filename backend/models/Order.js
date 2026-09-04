const db = require('../config/database');

class Order {
  static findAll(userId = null) {
    if (userId) {
      return db.orders.filter(o => o.userId === parseInt(userId));
    }
    return db.orders;
  }

  static findById(id, userId = null) {
    const order = db.orders.find(o => o.id === parseInt(id));
    if (!order) return null;
    if (userId && order.userId !== parseInt(userId)) return null;
    return order;
  }

  static create(orderData) {
    const newOrder = {
      id: db.orders.length + 1,
      orderNumber: `ORD-${Date.now()}`,
      status: 'Pending',
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    
    // Create order items
    if (orderData.items) {
      orderData.items.forEach(item => {
        db.orderItems.push({
          id: db.orderItems.length + 1,
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          createdAt: new Date().toISOString()
        });
      });
    }
    
    return newOrder;
  }

  static updateStatus(id, status) {
    const order = this.findById(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return null;
  }

  static delete(id) {
    const index = db.orders.findIndex(o => o.id === parseInt(id));
    if (index !== -1) {
      db.orders.splice(index, 1);
      db.orderItems = db.orderItems.filter(oi => oi.orderId !== parseInt(id));
      return true;
    }
    return false;
  }
}

module.exports = Order;