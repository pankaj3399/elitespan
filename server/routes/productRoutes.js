// backend/routes/productRoutes.js
const express = require('express');
const Product = require('../models/Product');
const Waitlist = require('../models/Waitlist');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('title description imageUrl link createdAt');

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
});

// GET specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
});

// POST request access to a product (adds to waitlist)
router.post('/:id/request-access', auth, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { id: userId } = req.user;

    // Verify product exists
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get user details
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user already requested access to this product
    const existingRequest = await Waitlist.findOne({
      userId,
      productId,
      type: 'product_request',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested access to this product',
      });
    }

    // Create waitlist entry
    const waitlistEntry = new Waitlist({
      email: user.email,
      type: 'product_request',
      productId,
      productTitle: product.title,
      userId,
      userName: user.name,
    });

    await waitlistEntry.save();

    res.status(201).json({
      success: true,
      message:
        'Access request submitted successfully. We will contact you soon!',
      requestId: waitlistEntry._id,
    });
  } catch (error) {
    console.error('Error requesting product access:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit access request',
    });
  }
});

// GET user's product access requests
router.get('/user/requests', auth, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const requests = await Waitlist.find({
      userId,
      type: 'product_request',
    })
      .populate('productId', 'title description imageUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Error fetching user product requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your requests',
    });
  }
});

module.exports = router;
