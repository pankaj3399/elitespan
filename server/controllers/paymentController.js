// backend/controllers/paymentController.js

const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Analytics = require('../models/Analytics'); // For tracking analytics
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use the latest Stripe API version
});

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, userId, doctorId } = req.body;
  console.log('Creating payment intent for:', { amount, userId, doctorId, token: req.user });

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is missing. Please set STRIPE_SECRET_KEY in .env');
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    console.log('Stripe secret key:', process.env.STRIPE_SECRET_KEY.substring(0, 8) + '...'); // Log part of the key for debugging

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'], // Explicitly specify card as the payment method type
      metadata: {
        userId: userId || req.user.id || 'anonymous', // Use anonymous if no user
        doctorId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentMethodTypes: paymentIntent.payment_method_types,
    });
  } catch (error) {
    console.error('Stripe error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw, // Raw Stripe error for more detail
    });
    res.status(500).json({ message: 'Payment intent creation failed', error: error.message });
  }
};

// Confirm Payment and Store Transaction
exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, paymentTokenId } = req.body; // Updated to accept paymentTokenId

  try {
    // Use the payment token to confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method_data: {
        type: 'card',
        card: { token: paymentTokenId }, // Use the token from stripe.createToken
      },
    });

    if (paymentIntent.status === 'succeeded') {
      const { amount, currency, metadata } = paymentIntent;
      const transaction = new Transaction({
        userId: metadata.userId === 'anonymous' ? null : metadata.userId, // Use null for anonymous, link to user later
        doctorId: metadata.doctorId || null,
        amount: amount / 100, // Convert back to dollars
        currency,
        stripePaymentId: paymentIntent.id,
        status: 'succeeded',
      });

      await transaction.save();

      // Update user's premium status only after successful payment
      if (metadata.userId && metadata.userId !== 'anonymous') {
        await User.findByIdAndUpdate(metadata.userId, {
          $set: {
            isPremium: true,
            premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days premium
          },
        });
      }

      // Update analytics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let analytics = await Analytics.findOne({ date: today });
      if (!analytics) {
        analytics = new Analytics({ date: today });
      }
      analytics.transactions.total += 1;
      analytics.transactions.revenue += amount / 100;
      analytics.usersRegistered = await User.countDocuments();
      analytics.doctorsRegistered = await Doctor.countDocuments();
      analytics.doctorsApproved = await Doctor.countDocuments({ isApproved: true });
      await analytics.save();

      res.json({ message: 'Payment confirmed', transaction });
    } else if (paymentIntent.status === 'requires_action') {
      // Handle 3D Secure for cards
      res.json({
        requiresAction: true,
        redirectUrl: paymentIntent.next_action?.redirect_to_url?.url || 'Action required',
      });
    } else {
      res.status(400).json({ message: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Payment confirmation error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw, // Raw Stripe error for more detail
    });
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

// Get Transactions for Admin (Revenue Tracking)
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query; // Added paymentMethod filter
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod; // Mock payment method tracking (optional)

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    res.json({ transactions, totalRevenue });
  } catch (error) {
    console.error('Fetch transactions error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw, // Raw Stripe error for more detail
    });
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};