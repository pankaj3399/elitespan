const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { signup, login, editProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/signup', [
  check('name').trim().not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
], signup);

router.post('/login', [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').exists().withMessage('Password is required'),
], login);

router.put('/profile', auth, [
  check('name').optional().trim().not().isEmpty().withMessage('Name is required'),
  check('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
], editProfile);

module.exports = router;