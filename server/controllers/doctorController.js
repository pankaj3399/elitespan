const Doctor = require('../models/Doctor');

// Get all doctors (with search and filter)
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, experience, location } = req.query;

    let query = {};
    if (specialization) query.specialization = specialization;
    if (experience) query.experience = { $gte: parseInt(experience) }; // Minimum experience
    if (location) query.location = location;

    const doctors = await Doctor.find(query).sort({ experience: -1 }); // Sort by experience (descending)
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add mock doctor data (run once, then comment out)
exports.seedDoctors = async (req, res) => {
  try {
    const mockDoctors = [
      { name: 'Dr. John Doe', specialization: 'Cardiology', experience: 15, location: 'New York', contactInfo: { phone: '123-456-7890', email: 'john.doe@hospital.com' }, rating: 4.5 },
      { name: 'Dr. Jane Smith', specialization: 'Pediatrics', experience: 8, location: 'Los Angeles', contactInfo: { phone: '234-567-8901', email: 'jane.smith@hospital.com' }, rating: 4.0 },
      { name: 'Dr. Michael Brown', specialization: 'Orthopedics', experience: 12, location: 'Chicago', contactInfo: { phone: '345-678-9012', email: 'michael.brown@hospital.com' }, rating: 4.8 },
    ];

    await Doctor.insertMany(mockDoctors);
    res.json({ message: 'Mock doctors seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};