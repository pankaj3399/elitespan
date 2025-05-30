// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password for admin
    const hashedPassword = await bcrypt.hash('khushijoy', 12);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'ana@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@elitehealthspan.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();