const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  usersRegistered: {
    type: Number,
    default: 0,
  },
  doctorsRegistered: {
    type: Number,
    default: 0,
  },
  doctorsApproved: {
    type: Number,
    default: 0,
  },
  transactions: {
    total: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('Analytics', analyticsSchema);