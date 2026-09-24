// backend/models/Coupon.js
const { db } = require('../config/database');

class Coupon {
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM coupons ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM coupons WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByCode(code) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM coupons WHERE code = ? AND isActive = 1', [code.toUpperCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(couponData) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO coupons (code, description, discountType, discountValue, minOrderAmount, maxDiscount, 
          usageLimit, usedCount, validFrom, validUntil, isActive, showOnHome, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          couponData.code.toUpperCase(),
          couponData.description || '',
          couponData.discountType || 'percentage',
          parseFloat(couponData.discountValue) || 0,
          parseFloat(couponData.minOrderAmount) || 0,
          parseFloat(couponData.maxDiscount) || 0,
          parseInt(couponData.usageLimit) || 0,
          0,
          couponData.validFrom || new Date().toISOString(),
          couponData.validUntil || null,
          couponData.isActive ? 1 : 0,
          couponData.showOnHome ? 1 : 0,
          new Date().toISOString(),
          new Date().toISOString()
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...couponData });
        }
      );
    });
  }

  static update(id, couponData) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE coupons SET 
          code = ?, description = ?, discountType = ?, discountValue = ?, 
          minOrderAmount = ?, maxDiscount = ?, usageLimit = ?, 
          validFrom = ?, validUntil = ?, isActive = ?, showOnHome = ?, updatedAt = ?
         WHERE id = ?`,
        [
          couponData.code.toUpperCase(),
          couponData.description || '',
          couponData.discountType || 'percentage',
          parseFloat(couponData.discountValue) || 0,
          parseFloat(couponData.minOrderAmount) || 0,
          parseFloat(couponData.maxDiscount) || 0,
          parseInt(couponData.usageLimit) || 0,
          couponData.validFrom || new Date().toISOString(),
          couponData.validUntil || null,
          couponData.isActive ? 1 : 0,
          couponData.showOnHome ? 1 : 0,
          new Date().toISOString(),
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...couponData });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM coupons WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  static incrementUsage(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  static getActiveHomeCoupons() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      db.all(
        `SELECT * FROM coupons 
         WHERE isActive = 1 AND showOnHome = 1 
         AND (validUntil IS NULL OR validUntil > ?)
         AND (usageLimit = 0 OR usedCount < usageLimit)
         ORDER BY createdAt DESC`,
        [now],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // ✅ NEW: Check if a user has already used a coupon
  static hasUserUsedCoupon(userId, couponId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM coupon_usage WHERE userId = ? AND couponId = ?',
        [userId, couponId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }

  // ✅ NEW: Record that a user used a coupon
  static recordUsage(couponId, userId, orderId, code) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO coupon_usage (couponId, userId, orderId, code, usedAt)
         VALUES (?, ?, ?, ?, ?)`,
        [couponId, userId, orderId, code, new Date().toISOString()],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // ✅ NEW: Get all coupons a specific user has used
  static getUserUsage(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM coupon_usage WHERE userId = ? ORDER BY usedAt DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // ✅ UPDATED: validateCoupon now accepts userId for per-user check
  static validateCoupon(code, orderAmount, userId = null) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      db.get(
        `SELECT * FROM coupons 
         WHERE code = ? AND isActive = 1 
         AND (validUntil IS NULL OR validUntil > ?)
         AND (usageLimit = 0 OR usedCount < usageLimit)`,
        [code.toUpperCase(), now],
        async (err, coupon) => {
          if (err) {
            reject(err);
            return;
          }

          if (!coupon) {
            resolve({ valid: false, message: 'Invalid or expired coupon code' });
            return;
          }

          // ✅ NEW: per-user check (only if user is logged in)
          if (userId) {
            try {
              const alreadyUsed = await Coupon.hasUserUsedCoupon(userId, coupon.id);
              if (alreadyUsed) {
                resolve({
                  valid: false,
                  message: 'You have already used this coupon on a previous order',
                  code: 'ALREADY_USED'
                });
                return;
              }
            } catch (usageErr) {
              console.error('Error checking coupon usage:', usageErr);
            }
          }

          if (orderAmount < coupon.minOrderAmount) {
            resolve({ 
              valid: false, 
              message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
            });
            return;
          }

          let discount = 0;
          if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }

          resolve({
            valid: true,
            coupon,
            discount: Math.round(discount * 100) / 100,
            message: 'Coupon applied successfully'
          });
        }
      );
    });
  }
}

module.exports = Coupon;