const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Admin Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if the provided email matches the ADMIN_EMAIL from .env
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password directly with the ADMIN_PASSWORD from .env
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token for the admin
    const token = jwt.sign({ id: 'static_admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, admin: { name: 'Admin', email: process.env.ADMIN_EMAIL } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Approve/Reject Doctor
exports.updateDoctorApproval = async (req, res) => {
  const { doctorId, isApproved } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = isApproved;
    await doctor.save();
    res.json({ message: isApproved ? 'Doctor approved successfully' : 'Doctor rejected successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get All Doctors (for admin panel)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};