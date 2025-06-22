const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authAdmin } = require('../middleware/auth');
const Provider = require('../models/Provider');

// Provider Management Routes
router.get('/providers', authAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    let filter = {};

    // Filter by status using isActive and isApproved fields
    if (status === 'approved') {
      filter.isApproved = true;
      filter.isActive = true;
    } else if (status === 'pending') {
      filter.isApproved = false;
      filter.isActive = true;
    } else if (status === 'blocked') {
      filter.isActive = false; // Blocked means isActive = false (regardless of isApproved)
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { providerName: { $regex: search, $options: 'i' } },
        { practiceName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { npiNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get providers with pagination
    const providers = await Provider.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Provider.countDocuments(filter);

    // Calculate stats based on your logic
    const stats = await Provider.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          // Approved: isApproved = true AND isActive = true
          approved: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isApproved', true] },
                    { $eq: ['$isActive', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // Pending: isApproved = false AND isActive = true
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isApproved', false] },
                    { $eq: ['$isActive', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // Blocked: isActive = false (regardless of isApproved)
          blocked: {
            $sum: {
              $cond: [{ $eq: ['$isActive', false] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      providers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalProviders: total,
      },
      stats: stats[0] || { total: 0, approved: 0, pending: 0, blocked: 0 },
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Server error while fetching providers' });
  }
});

router.put(
  '/providers/:id/status',
  authAdmin,
  [
    check('status')
      .isIn(['approve', 'block', 'pending'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate provider exists
      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      // Update provider status based on your logic
      let updateData = {};

      switch (status) {
        case 'approve':
          // Approved: isApproved = true, isActive = true
          updateData = { isApproved: true, isActive: true };
          break;
        case 'block':
          // Blocked: isActive = false (isApproved doesn't matter but we'll set it false)
          updateData = { isActive: false, isApproved: false };
          break;
        case 'pending':
          // Pending: isApproved = false, isActive = true
          updateData = { isApproved: false, isActive: true };
          break;
      }

      const updatedProvider = await Provider.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        message: `Provider ${
          status === 'approve'
            ? 'approved'
            : status === 'block'
            ? 'blocked'
            : 'set to pending'
        } successfully`,
        provider: updatedProvider,
      });
    } catch (error) {
      console.error('Error updating provider status:', error);
      res
        .status(500)
        .json({ message: 'Server error while updating provider status' });
    }
  }
);

module.exports = router;
