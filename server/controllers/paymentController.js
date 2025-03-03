const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, userId, doctorId } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is missing');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card', 'apple_pay', 'paypal'], // Explicitly support all three
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
      paymentMethodTypes: paymentIntent.payment_method_types, // Inform frontend of available methods
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Payment intent creation failed', error: error.message });
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
        invoice: await generateInvoice({ // Generate invoice
          stripePaymentId: paymentIntent.id,
          userId: metadata.userId,
          doctorId: metadata.doctorId || null,
          amount: amount / 100,
          currency,
          createdAt: new Date(),
        }),
      });

      await transaction.save();
      await User.findByIdAndUpdate(metadata.userId, {
        $set: { isPremium: true, premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days premium
      });

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
      // Handle PayPal redirect or 3D Secure for cards/Apple Pay
      res.json({
        requiresAction: true,
        redirectUrl: paymentIntent.next_action?.redirect_to_url?.url || 'Action required',
      });
    } else {
      res.status(400).json({ message: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

// Get Transactions for Admin (Revenue Tracking)
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    res.json({ transactions, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};