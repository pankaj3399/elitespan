const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Transaction = require('../models/Transaction');
const Analytics = require('../models/Analytics');
require('dotenv').config();

// List All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

// Update User (e.g., premium status, ban)
exports.updateUser = async (req, res) => {
  const { userId, isPremium, isBanned } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPremium = isPremium !== undefined ? isPremium : user.isPremium;
    user.isBanned = isBanned !== undefined ? isBanned : user.isBanned;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
};

// List All Doctors (Already Exists in adminController.js, Reusing)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error });
  }
};

// Update Doctor Approval (Already Exists, Reusing from adminController.js)
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
    res.status(500).json({ message: 'Failed to update doctor approval', error });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor', error });
  }
};

// Get Transactions (Reusing from paymentController.js)
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    res.json({ transactions, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

// Get Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find().sort({ date: -1 }).limit(30); // Last 30 days
    const usersCount = await User.countDocuments();
    const doctorsCount = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctorsCount = await Doctor.countDocuments({ isApproved: false });
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      analytics,
      usersCount,
      doctorsCount,
      pendingDoctorsCount,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error });
  }
};