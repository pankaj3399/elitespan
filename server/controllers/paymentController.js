const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Doctor = require('../models/Doctor');
const PromoCode = require('../models/PromoCode');
const { sendUserSubscriptionEmails } = require('../utils/email.js');
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
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated' });
    }

    // Initialize adjustedAmount with the original amount in cents
    let adjustedAmount = Math.round(amount); // Assume amount is already in cents from frontend

    // Apply promo code discount if provided
    if (req.body.promoCode) {
      const promoCode = await PromoCode.findOne({
        code: req.body.promoCode.toUpperCase(),
        isActive: true,
        $or: [{ expiresAt: { $gte: new Date() } }, { expiresAt: null }],
      });
      if (promoCode) {
        adjustedAmount = Math.round(
          adjustedAmount * (1 - promoCode.discountPercentage / 100)
        );
        console.log(
          `Promo code applied: ${req.body.promoCode}, New amount: ${adjustedAmount} cents`
        );
      } else {
        console.log(`Invalid or expired promo code: ${req.body.promoCode}`);
      }
    }

    // Check Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({
        message:
          'Stripe secret key is missing. Please set STRIPE_SECRET_KEY in .env',
      });
    }

    // Validate amount
    if (!adjustedAmount || adjustedAmount <= 0 || adjustedAmount > 99999999) {
      // Stripe limit is $999,999.99 (99999999 cents)
      console.log(
        'Validation failed: Amount must be between 1 and 99999999 cents'
      );
      return res
        .status(400)
        .json({ message: 'Amount must be between 1 and $999,999.99' });
    }

    console.log(
      'Stripe secret key (partial):',
      process.env.STRIPE_SECRET_KEY?.substring(0, 8) + '...'
    );

    // Create Payment Intent
    console.log('Creating Stripe payment intent with amount:', adjustedAmount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: adjustedAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId: userId || req.user?.id || 'anonymous',
        doctorId,
        promoCode: req.body.promoCode || '', // Store promo code in metadata
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
    res.status(error.statusCode || 500).json({
      message: 'Payment intent creation failed',
      error: error.message,
    });
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

      // Extract values from metadata
      const userId = metadata.userId === 'anonymous' ? null : metadata.userId;
      const promoCode = metadata.promoCode || null;

      const transaction = new Transaction({
        userId: userId,
        doctorId: metadata.doctorId || null,
        amount: amount / 100,
        currency,
        stripePaymentId: paymentIntent.id,
        status: 'succeeded',
      });

      await transaction.save();

      // Update user premium status if userId exists
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            isPremium: true,
            premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Changed to 365 days
          },
        });

        // Send subscription emails directly here - NO API CALL!
        try {
          console.log('📧 Sending subscription emails for userId:', userId);
          await sendUserSubscriptionEmails(userId, promoCode);
          console.log('✅ Subscription emails sent successfully');
        } catch (emailError) {
          console.error('❌ Failed to send subscription emails:', emailError);
          // Don't fail the payment if email fails - just log the error
        }
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
      analytics.doctorsApproved = await Doctor.countDocuments({
        isApproved: true,
      });
      await analytics.save();

      res.json({ message: 'Payment confirmed', transaction });
    } else if (paymentIntent.status === 'requires_action') {
      res.json({
        requiresAction: true,
        redirectUrl:
          paymentIntent.next_action?.redirect_to_url?.url || 'Action required',
      });
    } else {
      res
        .status(400)
        .json({ message: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Payment confirmation error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw,
    });
    res
      .status(error.statusCode || 500)
      .json({ message: 'Payment confirmation failed', error: error.message });
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

    const totalRevenue = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    res.json({ transactions, totalRevenue });
  } catch (error) {
    console.error('Fetch transactions error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      param: error.param,
      raw: error.raw,
    });
    res
      .status(error.statusCode || 500)
      .json({ message: 'Failed to fetch transactions', error: error.message });
  }
};
