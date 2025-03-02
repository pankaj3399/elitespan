const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Doctor Signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, specialization, experience, location, contactInfo } = req.body;

  try {
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    doctor = new Doctor({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      specialization,
      experience,
      location,
      contactInfo,
    });

    await doctor.save();

    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, doctor: { name: doctor.name, email: doctor.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Doctor Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, doctor: { name: doctor.name, email: doctor.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Doctor Profile (including availability)
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, specialization, experience, location, contactInfo, availability } = req.body;

  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience || doctor.experience;
    doctor.location = location || doctor.location;
    doctor.contactInfo = contactInfo || doctor.contactInfo;
    if (availability) doctor.availability = availability;

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor: { name: doctor.name, email: doctor.email, specialization: doctor.specialization, experience: doctor.experience, location: doctor.location, contactInfo: doctor.contactInfo, availability: doctor.availability } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Doctor Profile (for dashboard)
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};