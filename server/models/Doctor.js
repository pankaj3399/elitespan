const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: Number, // Years of experience
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  contactInfo: {
    phone: String,
    email: String,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  isApproved: {
    type: Boolean,
    default: false, //doctors will require admin approval
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);