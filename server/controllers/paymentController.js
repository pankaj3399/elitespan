const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Doctor = require('../models/Doctor');
const PromoCode = require('../models/PromoCode');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  console.log('Starting createPaymentIntent...');
  const { amount, userId, doctorId } = req.body;
  console.log('Received request body:', req.body);
  console.log('Auth token (req.user):', req.user);

  try {
    // Check if req.user is defined (from auth middleware)
    if (!req.user) {
      console.error('req.user is undefined - Authentication middleware failed');
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    // Initialize adjustedAmount with the original amount
    let adjustedAmount = amount;

    // Apply promo code discount if provided
    if (req.body.promoCode) {
      const promoCode = await PromoCode.findOne({
        code: req.body.promoCode,
        isActive: true,
        expiryDate: { $gte: new Date() },
      });
      if (promoCode) {
        adjustedAmount = amount * (1 - promoCode.discountPercentage / 100);
        console.log(`Promo code applied: ${req.body.promoCode}, New amount: ${adjustedAmount}`);
      } else {
        console.log(`Invalid or expired promo code: ${req.body.promoCode}`);
      }
    }

    // Check Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ message: 'Stripe secret key is missing. Please set STRIPE_SECRET_KEY in .env' });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      console.log('Validation failed: Amount must be greater than 0');
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    console.log('Stripe secret key (partial):', process.env.STRIPE_SECRET_KEY?.substring(0, 8) + '...');

    // Test Stripe connection
    try {
      await stripe.paymentIntents.list({ limit: 1 });
      console.log('Stripe connection successful');
    } catch (stripeError) {
      console.error('Stripe connection failed:', {
        message: stripeError.message,
        stack: stripeError.stack,
        code: stripeError.code,
        raw: stripeError.raw,
      });
      return res.status(500).json({ message: 'Failed to connect to Stripe', error: stripeError.message });
    }

    // Create Payment Intent
    console.log('Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(adjustedAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'], // Remove 'apple_pay'
      metadata: {
        userId: userId || req.user?.id || 'anonymous',
        doctorId,
      },
    });

    console.log('Created payment intent:', paymentIntent);
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentMethodTypes: paymentIntent.payment_method_types,
    });
  } catch (error) {
    console.error('Error in createPaymentIntent:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw,
      httpStatus: error.statusCode,
    });
    // Pass the Stripe error status code (e.g., 400) to the frontend
    res.status(error.statusCode || 500).json({ message: 'Payment intent creation failed', error: error.message });
  }
};

// Confirm Payment and Store Transaction
exports.confirmPayment = async (req, res) => {
  console.log('Starting confirmPayment...');
  const { paymentIntentId, paymentMethodId } = req.body;
  console.log('Confirming payment with:', { paymentIntentId, paymentMethodId });

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    console.log('Payment intent confirmed:', paymentIntent);

    if (paymentIntent.status === 'succeeded') {
      const { amount, currency, metadata } = paymentIntent;
      const transaction = new Transaction({
        userId: metadata.userId === 'anonymous' ? null : metadata.userId,
        doctorId: metadata.doctorId || null,
        amount: amount / 100,
        currency,
        stripePaymentId: paymentIntent.id,
        status: 'succeeded',
      });

      await transaction.save();

      if (metadata.userId && metadata.userId !== 'anonymous') {
        await User.findByIdAndUpdate(metadata.userId, {
          $set: {
            isPremium: true,
            premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

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
      raw: error.raw,
    });
    res.status(error.statusCode || 500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

// Get Transactions for Admin (Revenue Tracking)
exports.getTransactions = async (req, res) => {
  console.log('Starting getTransactions...');
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

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
      raw: error.raw,
    });
    res.status(error.statusCode || 500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};