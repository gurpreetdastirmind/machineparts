const Coupon = require('../models/Coupon');

// Get all coupons (admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons', error: error.message });
  }
};

// Get coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupon', error: error.message });
  }
};

// Create coupon (admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive, showOnHome } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findByCode(code);
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      description,
      discountType: discountType || 'percentage',
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
      showOnHome: showOnHome !== undefined ? showOnHome : false
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon', error: error.message });
  }
};

// Update coupon (admin)
exports.updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const couponData = req.body;

    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check if code is being changed and if it conflicts
    if (couponData.code && couponData.code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await Coupon.findByCode(couponData.code);
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
    }

    const updatedCoupon = await Coupon.update(couponId, couponData);
    res.json({ success: true, message: 'Coupon updated successfully', data: updatedCoupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coupon', error: error.message });
  }
};

// Delete coupon (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const changes = await Coupon.delete(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon', error: error.message });
  }
};

// Get active coupons for home page (public)
exports.getHomeCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getActiveHomeCoupons();
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Get home coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons', error: error.message });
  }
};

// Validate coupon code (public)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const result = await Coupon.validateCoupon(code, parseFloat(orderAmount) || 0);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate coupon', error: error.message });
  }
};