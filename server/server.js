const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Route imports
const waitlistRoutes = require('./routes/waitlistRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const providerRoutes = require('./routes/providerRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Explicitly handle CORS preflight requests
app.options('*', cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}), (req, res) => {
  console.log(`Handled CORS preflight for ${req.method} ${req.url}`);
  res.status(200).end();
});

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Routes
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin-panel', adminPanelRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/provider-info', providerRoutes);
app.use('/api', uploadRoutes);
app.use('/api/email', emailRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running on Vercel');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;