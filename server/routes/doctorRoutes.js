const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { signup, login, updateProfile, getProfile } = require('../controllers/doctorController');
const { authDoctor } = require('../middleware/auth');

router.post('/signup', [
  check('name').trim().not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('specialization').trim().not().isEmpty().withMessage('Specialization is required'),
  check('experience').isInt({ min: 0 }).withMessage('Valid experience is required'),
  check('location').trim().not().isEmpty().withMessage('Location is required'),
  check('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
], signup);

router.post('/login', [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').exists().withMessage('Password is required'),
], login);

router.put('/profile', authDoctor, [
  check('name').optional().trim().not().isEmpty().withMessage('Name is required'),
  check('specialization').optional().trim().not().isEmpty().withMessage('Specialization is required'),
  check('experience').optional().isInt({ min: 0 }).withMessage('Valid experience is required'),
  check('location').optional().trim().not().isEmpty().withMessage('Location is required'),
  check('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  check('availability').optional().isArray().withMessage('Availability must be an array'),
], updateProfile);

router.get('/profile', authDoctor, getProfile);

module.exports = router;