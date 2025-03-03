const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getUsers, updateUser, deleteUser, getAllDoctors, updateDoctorApproval, deleteDoctor, getTransactions, getAnalytics } = require('../controllers/adminPanelController');
const { authAdmin } = require('../middleware/auth');

router.get('/users', authAdmin, getUsers);
router.put('/users/:userId', authAdmin, [
  check('userId').not().isEmpty().withMessage('User ID is required'),
  check('isPremium').optional().isBoolean().withMessage('Premium status must be boolean'),
  check('isBanned').optional().isBoolean().withMessage('Ban status must be boolean'),
], updateUser);
router.delete('/users/:userId', authAdmin, deleteUser);

router.get('/doctors', authAdmin, getAllDoctors); // Reusing
router.put('/doctors/approve', authAdmin, [
  check('doctorId').not().isEmpty().withMessage('Doctor ID is required'),
  check('isApproved').isBoolean().withMessage('Approval status must be boolean'),
], updateDoctorApproval);
router.delete('/doctors/:doctorId', authAdmin, deleteDoctor);

router.get('/transactions', authAdmin, getTransactions); // Reusing
router.get('/analytics', authAdmin, getAnalytics);

module.exports = router;