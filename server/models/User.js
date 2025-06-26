// backend/models/User.js

const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, required: false, trim: true },
  address: { type: String, required: true, trim: true }, 
  specialties: [{ type: String, trim: true }],
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "provider", "admin"],
    default: "user",
    required: false,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: false,
  },
  contactInfo: {
    type: contactInfoSchema,
    required: true, // Now required
  },
  // Geospatial location data
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere' // Geospatial index
    }
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("User", userSchema);