// backend/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { name, email, password, contactInfo, role } = req.body;
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
    console.log('Validating fields:', { name, email, password, contactInfo, role });

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

    // SECURITY: Validate and restrict role to only allowed values
    const allowedRoles = ['user', 'provider'];
    let userRole = 'user'; // Default role
    
    if (role && allowedRoles.includes(role.toLowerCase())) {
      userRole = role.toLowerCase();
    } else if (role && !allowedRoles.includes(role.toLowerCase())) {
      return res
        .status(400)
        .json({ 
          message: 'Invalid role. Only "user" and "provider" roles are allowed for signup.',
          allowedRoles 
        });
    }

    console.log('Validated user role:', userRole);

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      // User exists, return their data to proceed to payment (premium status updated after payment)

      // Use role field with 'user' as default fallback, but never allow admin
      const existingUserRole = existingUser.role === 'admin' ? 'user' : (existingUser.role || 'user');

      const token = jwt.sign(
        { id: existingUser._id, role: existingUserRole },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({
        message: 'User already exists, proceeding to payment',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUserRole,
          providerId: existingUser.providerId, // Include providerId if exists
          isPremium: existingUser.isPremium, 
        },
        token,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Create new user with validated role
    const user = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      contactInfo: contactInfo || {},
      role: userRole, // Use the validated role
    });

    await user.save();

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
        role: userRole,
        providerId: user.providerId, // Include providerId if exists
        isPremium: user.isPremium,
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
      role: user.role,
      providerId: user.providerId,
    });

    // Use role field with 'user' as default fallback
    // SECURITY: Never return admin role through regular login
    const userRole = user.role === 'admin' ? 'user' : (user.role || 'user');

    console.log('Determined user role:', userRole); // Debug log

    const token = jwt.sign(
      { id: user._id, role: userRole },
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
        role: userRole,
        providerId: user.providerId, // Include providerId for providers
        isPremium: user.isPremium, 
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
  const { name, contactInfo, isPremium, premiumExpiry, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SECURITY: Prevent role escalation through profile update
    const allowedRoles = ['user', 'provider'];
    let updatedRole = user.role; // Keep existing role by default
    
    if (role && allowedRoles.includes(role.toLowerCase())) {
      // Only allow changing to user or provider, never to admin
      updatedRole = role.toLowerCase();
    } else if (role && !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Invalid role. Only "user" and "provider" roles can be set.',
        allowedRoles 
      });
    }

    user.name = name ? name.trim() : user.name;
    user.contactInfo = contactInfo || user.contactInfo;
    user.isPremium = isPremium !== undefined ? isPremium : user.isPremium;
    user.premiumExpiry = premiumExpiry || user.premiumExpiry;
    user.role = updatedRole;

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

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.user; // From auth middleware
    console.log('Getting profile for user ID:', id);
    
    const user = await User.findById(id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile retrieved:', {
      id: user._id,
      email: user.email,
      isPremium: user.isPremium,
      role: user.role
    });

    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isPremium: user.isPremium || false,
        premiumExpiry: user.premiumExpiry,
        providerId: user.providerId,
        contactInfo: user.contactInfo,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error getting profile',
      error: error.message,
    });
  }
};