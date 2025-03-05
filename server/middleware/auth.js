// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Allow unauthenticated requests for payment intent creation, but log for debugging
    console.warn('No token provided for payment intent creation');
    req.user = { id: 'anonymous' }; // Mock user for payment initiation
    return next();
  }

  try {
    console.log('Verifying token:', token); // Debug token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ensure decoded includes { id, role }
    next();
  } catch (error) {
    console.error('Token verification error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(401).json({ message: 'Token is invalid or expired', error: error.message });
  }
};

const authDoctor = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Doctor access required' });
    }
    next();
  });
};

const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

module.exports = { auth, authDoctor, authAdmin };