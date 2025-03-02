const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Middleware for doctor-specific routes
const authDoctor = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Doctor access required' });
    }
    next();
  });
};

// Middleware for admin-specific routes
const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

module.exports = { auth, authDoctor, authAdmin };