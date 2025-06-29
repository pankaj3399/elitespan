// backend/models/Waitlist.js
const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  // Type of waitlist entry
  type: {
    type: String,
    enum: ['general', 'product_request'],
    default: 'general',
  },
  // For product access requests
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  productTitle: {
    type: String,
    required: false,
    trim: true,
  },
  // User who requested access
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  userName: {
    type: String,
    required: false,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

// Compound index for product requests
waitlistSchema.index({ type: 1, productId: 1 });
waitlistSchema.index({ userId: 1, productId: 1 }, { sparse: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
