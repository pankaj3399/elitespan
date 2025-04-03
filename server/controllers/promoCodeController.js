const PromoCode = require('../models/PromoCode');

exports.createPromoCode = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate } = req.body;
    const existingCode = await PromoCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    const newPromoCode = new PromoCode({ code, discountPercentage, expiryDate });
    await newPromoCode.save();
    res.status(201).json({ message: 'Promo code created successfully', promoCode: newPromoCode });
  } catch (error) {
    res.status(500).json({ message: 'Error creating promo code', error: error.message });
  }
};

exports.getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({ isActive: true });
    res.status(200).json({ promoCodes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promo codes', error: error.message });
  }
};

exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    const promoCode = await PromoCode.findOne({ code, isActive: true, expiryDate: { $gte: new Date() } });
    if (!promoCode) {
      return res.status(400).json({ message: 'Invalid or expired promo code' });
    }
    res.status(200).json({ discountPercentage: promoCode.discountPercentage });
  } catch (error) {
    res.status(500).json({ message: 'Error validating promo code', error: error.message });
  }
};