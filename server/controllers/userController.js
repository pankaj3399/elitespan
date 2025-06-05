// backend/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { name, email, password, contactInfo } = req.body;
  console.log('Signup request payload:', JSON.stringify(req.body, null, 2));

  // Check for validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res
      .status(400)
      .json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    // Explicitly log and validate each field
    console.log('Validating fields:', { name, email, password, contactInfo });

    // Validate required fields
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: 'Name is required and cannot be empty' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res
        .status(400)
        .json({ message: 'A valid email address is required' });
    }
    if (!password || password.trim().length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    // Ensure contactInfo is an object, even if empty
    if (contactInfo && typeof contactInfo !== 'object') {
      return res
        .status(400)
        .json({ message: 'Contact info must be an object' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      // User exists, return their data to proceed to payment (premium status updated after payment)

      // FIXED: Use actual role from database, with proper fallback
      let userRole;
      if (existingUser.isAdmin) {
        userRole = 'admin';
      } else if (existingUser.role) {
        userRole = existingUser.role; // Use the actual role field
      } else {
        userRole = 'user'; // Default fallback
      }

      const token = jwt.sign(
        { id: existingUser._id, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({
        message: 'User already exists, proceeding to payment',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: userRole, // Return the correct role
          providerId: existingUser.providerId, // Include providerId if exists
          isAdmin: existingUser.isAdmin,
        },
        token,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      contactInfo: contactInfo || {},
    });

    await user.save();

    // FIXED: Use actual role from database, with proper fallback
    let userRole;
    if (user.isAdmin) {
      userRole = 'admin';
    } else if (user.role) {
      userRole = user.role; // Use the actual role field
    } else {
      userRole = 'user'; // Default fallback
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole, // Return the correct role
        providerId: user.providerId, // Include providerId if exists
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res
      .status(500)
      .json({ message: 'Server error during signup', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Debug: Log what we found in the database
    console.log('User found in database:', {
      id: user._id,
      email: user.email,
      role: user.role, // This should show 'provider' for your test user
      isAdmin: user.isAdmin,
      providerId: user.providerId,
    });

    // FIXED: Use actual role from database, with proper fallback logic
    let userRole;
    if (user.isAdmin) {
      userRole = 'admin';
    } else if (user.role) {
      userRole = user.role; // Use the actual role field from database
    } else {
      userRole = 'user'; // Default fallback
    }

    console.log('Determined user role:', userRole); // Debug log

    const token = jwt.sign(
      { id: user._id, role: userRole }, // This will now include the correct role
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const responseData = {
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole, // This will now be 'provider' for your test user
        providerId: user.providerId, // Include providerId for providers
        isAdmin: user.isAdmin,
      },
    };

    console.log('Sending response:', responseData); // Debug log

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'Server error during login', error: error.message });
  }
};

exports.editProfile = async (req, res) => {
  const { id } = req.user; // From auth middleware
  const { name, contactInfo, isPremium, premiumExpiry } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name ? name.trim() : user.name;
    user.contactInfo = contactInfo || user.contactInfo;
    user.isPremium = isPremium !== undefined ? isPremium : user.isPremium;
    user.premiumExpiry = premiumExpiry || user.premiumExpiry;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({
      message: 'Server error during profile update',
      error: error.message,
    });
  }
};
