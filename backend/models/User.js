const db = require('../config/database');

class User {
  static findAll() {
    return db.users;
  }

  static findById(id) {
    return db.users.find(u => u.id === parseInt(id));
  }

  static findByEmail(email) {
    return db.users.find(u => u.email === email);
  }

  static create(userData) {
    const newUser = {
      id: db.users.length + 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    return newUser;
  }

  static update(id, userData) {
    const index = db.users.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...userData, updatedAt: new Date().toISOString() };
      return db.users[index];
    }
    return null;
  }

  static delete(id) {
    const index = db.users.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
      db.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = User;