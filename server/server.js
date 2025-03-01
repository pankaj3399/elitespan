const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const waitlistRoutes = require('../routes/waitlistRoutes');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration to allow requests from your frontend
app.use(cors({
  origin: '*', // Allow requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/waitlist', waitlistRoutes);

// // Start cron job
// require('./utils/cron');

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running on Vercel');
});

module.exports = app; // Export the Express app for Vercel