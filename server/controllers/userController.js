// backend/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { geocodeAddress, createGeoJSONPoint } = require('../utils/geocoding');
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

    // Validate contactInfo is provided and has required fields
    if (!contactInfo || typeof contactInfo !== 'object') {
      return res
        .status(400)
        .json({ message: 'Contact information is required' });
    }

    if (!contactInfo.address || !contactInfo.address.trim()) {
      return res
        .status(400)
        .json({ message: 'Address is required for location-based matching' });
    }

    if (!contactInfo.specialties || !Array.isArray(contactInfo.specialties) || contactInfo.specialties.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one area of interest is required' });
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
          contactInfo: existingUser.contactInfo
        },
        token,
      });
    }

    // Geocode the user's address
    console.log('🌍 Geocoding user address:', contactInfo.address);
    let coordinates;
    try {
      const geocodeResult = await geocodeAddress(contactInfo.address);
      coordinates = createGeoJSONPoint(geocodeResult.lat, geocodeResult.lng);
      console.log('✅ User address geocoded successfully:', coordinates);
    } catch (geocodeError) {
      console.error('❌ Geocoding failed for user address:', geocodeError.message);
      return res.status(400).json({ 
        message: 'Unable to verify the provided address. Please check that your address is correct and try again.',
        geocodeError: geocodeError.message 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Create new user with validated role and location
    const user = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      contactInfo: {
        phone: contactInfo.phone || '',
        address: contactInfo.address.trim(),
        specialties: contactInfo.specialties
      },
      location: coordinates,
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
        contactInfo: user.contactInfo
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
        contactInfo: user.contactInfo
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
    user.isPremium = isPremium !== undefined ? isPremium : user.isPremium;
    user.premiumExpiry = premiumExpiry || user.premiumExpiry;
    user.role = updatedRole;

    // Handle contactInfo updates with potential geocoding
    if (contactInfo) {
      const updatedContactInfo = { ...user.contactInfo, ...contactInfo };
      
      // If address changed, we need to geocode the new address
      if (contactInfo.address && contactInfo.address !== user.contactInfo.address) {
        console.log('🌍 User address changed, re-geocoding:', contactInfo.address);
        try {
          const geocodeResult = await geocodeAddress(contactInfo.address);
          const coordinates = createGeoJSONPoint(geocodeResult.lat, geocodeResult.lng);
          user.location = coordinates;
          console.log('✅ User address re-geocoded successfully:', coordinates);
        } catch (geocodeError) {
          console.error('❌ Re-geocoding failed for user address:', geocodeError.message);
          return res.status(400).json({ 
            message: 'Unable to verify the new address. Please check that your address is correct.',
            geocodeError: geocodeError.message 
          });
        }
      }
      
      user.contactInfo = updatedContactInfo;
    }

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