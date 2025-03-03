const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, userId, doctorId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        doctorId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment intent creation failed', error });
  }
};

// Confirm Payment and Store Transaction
exports.confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      const { amount, currency, metadata } = paymentIntent;
      const transaction = new Transaction({
        userId: metadata.userId,
        doctorId: metadata.doctorId || null,
        amount: amount / 100, // Convert back to dollars
        currency,
        stripePaymentId: paymentIntent.id,
        status: 'succeeded',
        invoice: `https://your-app.com/invoice/${paymentIntent.id}`, // Mocked URL
      });

      await transaction.save();
      await User.findByIdAndUpdate(metadata.userId, { $set: { isPremium: true } }); // Mock premium access

      res.json({ message: 'Payment confirmed', transaction });
    } else {
      res.status(400).json({ message: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment confirmation failed', error });
  }
};

// Get Transactions for Admin (Revenue Tracking)
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};