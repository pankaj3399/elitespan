const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Route imports
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const providerRoutes = require('./routes/providerRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// Load environment variables
dotenv.config();

const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Body parser middleware
app.use(express.json());

// CORS configuration
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin-panel', adminPanelRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/provider-info', providerRoutes);
app.use('/api', uploadRoutes);
app.use('/api/payments', paymentRoutes);
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
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
