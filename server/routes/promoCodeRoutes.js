const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, authAdmin } = require('../middleware/auth');
const { createPromoCode, getPromoCodes, validatePromoCode } = require('../controllers/promoCodeController');

router.post('/create', authAdmin, [
  check('code').not().isEmpty().withMessage('Promo code is required'),
  check('discountPercentage').isInt({ min: 1, max: 100 }).withMessage('Discount must be between 1 and 100'),
  check('expiresAt').optional().isISO8601().withMessage('Valid expiry date is required'),
], createPromoCode);

router.get('/list', authAdmin, getPromoCodes);

router.post('/validate', auth, [
  check('code').not().isEmpty().withMessage('Promo code is required').isString().withMessage('Code must be a string'),
], validatePromoCode);

module.exports = router;