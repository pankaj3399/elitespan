// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const waitlistRoutes = require('./routes/waitlistRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to log incoming requests (simplified)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Remove detailed headers and body logging to reduce verbosity
  next();
});

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin-panel', adminPanelRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running on Vercel');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the Express app for Vercel (serverless deployment)
module.exports = app;