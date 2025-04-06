const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createPaymentIntent, confirmPayment, getTransactions } = require('../controllers/paymentController');
const { auth, authAdmin } = require('../middleware/auth');

router.post('/create-payment-intent', auth, [
  check('amount').isInt({ min: 1, max: 99999999 }).withMessage('Amount must be between 1 and 99999999 cents'),
  check('userId').optional().not().isEmpty().withMessage('User ID is required if applicable'),
  check('doctorId').optional().not().isEmpty().withMessage('Doctor ID is required if applicable'),
  check('promoCode').optional().not().isEmpty().withMessage('Promo code must be valid if provided'),
], createPaymentIntent);

router.post('/confirm-payment', auth, [
  check('paymentIntentId').not().isEmpty().withMessage('Payment Intent ID is required'),
  check('paymentMethodId').not().isEmpty().withMessage('Payment Method ID is required'),
], confirmPayment);

router.get('/transactions', authAdmin, getTransactions);

module.exports = router;