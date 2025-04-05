const PromoCode = require('../models/PromoCode');

exports.createPromoCode = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate } = req.body;
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    // Parse and validate expiryDate
    let parsedExpiryDate = null;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date' });
      }
    }

    const newPromoCode = new PromoCode({
      code: code.toUpperCase(), // Ensure code is stored in uppercase
      discountPercentage,
      expiresAt: parsedExpiryDate,
      isActive: true,
    });

    await newPromoCode.save();
    console.log('Created promo code:', newPromoCode); // Debug log
    res.status(201).json({ message: 'Promo code created successfully', promoCode: newPromoCode });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ message: 'Error creating promo code', error: error.message });
  }
};

exports.getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({ isActive: true });
    console.log('Fetched promo codes:', promoCodes); // Debug log
    res.status(200).json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ message: 'Error fetching promo codes', error: error.message });
  }
};

exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Validating promo code:', code); // Debug log
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(), // Case-insensitive matching
      isActive: true,
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null },
      ],
    });
    if (!promoCode) {
      console.log('Promo code not found or invalid:', code);
      return res.status(400).json({ message: 'Invalid or expired promo code' });
    }
    console.log('Promo code validated:', promoCode);
    res.status(200).json({ discountPercentage: promoCode.discountPercentage });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ message: 'Error validating promo code', error: error.message });
  }
};