const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require("mongoose");

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

const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors());

// Body parser middleware
app.use(express.json());

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

// Connect to MongoDB (for serverless, connection happens on each request)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;