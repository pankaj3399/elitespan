// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // Ensure both are imported
const { signup, login, editProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.post('/signup', [
  check('name').trim().not().isEmpty().withMessage('Name is required and cannot be empty'),
  check('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('contactInfo').optional().isObject().withMessage('Contact info must be an object if provided'),
  check('contactInfo.phone').optional().trim().isString().withMessage('Phone must be a string'),
  check('contactInfo.address').optional().trim().isString().withMessage('Address must be a string'),
], (req, res, next) => {
  // Log and return validation errors if any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
}, signup);

router.post('/login', [
  check('email').trim().isEmail().withMessage('Valid email is required'),
  check('password').trim().not().isEmpty().withMessage('Password is required'),
], login);

router.put('/profile', auth, [
  check('name').optional().trim().not().isEmpty().withMessage('Name cannot be empty'),
  check('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
  check('isPremium').optional().isBoolean().withMessage('isPremium must be a boolean'),
  check('premiumExpiry').optional().isISO8601().withMessage('premiumExpiry must be a valid date'),
], editProfile);

module.exports = router;