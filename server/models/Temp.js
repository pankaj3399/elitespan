const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
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

module.exports = mongoose.model('Waitlist', waitlistSchema);