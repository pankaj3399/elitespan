const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {login, updateDoctorApproval, getAllDoctors } = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');


router.post('/login', [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').exists().withMessage('Password is required'),
], login);

router.put('/doctors/approve', authAdmin, [
  check('doctorId').not().isEmpty().withMessage('Doctor ID is required'),
  check('isApproved').isBoolean().withMessage('Approval status must be boolean'),
], updateDoctorApproval);

router.get('/doctors', authAdmin, getAllDoctors);

module.exports = router;