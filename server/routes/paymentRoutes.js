const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createPaymentIntent, confirmPayment, getTransactions } = require('../controllers/paymentController');
const { auth, authAdmin } = require('../middleware/auth');

router.post('/create-payment-intent', auth, [
  check('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  check('userId').not().isEmpty().withMessage('User ID is required'),
  check('doctorId').optional().not().isEmpty().withMessage('Doctor ID is required if applicable'),
], createPaymentIntent);

router.post('/confirm-payment', auth, [
  check('paymentIntentId').not().isEmpty().withMessage('Payment Intent ID is required'),
], confirmPayment);

router.get('/transactions', authAdmin, getTransactions);

module.exports = router;