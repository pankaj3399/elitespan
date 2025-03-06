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

// Middleware
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

// // Start cron job
// require('./utils/cron');

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running on Vercel');
});

// Define PORT from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// // For local development: Start the server (comment or remove this for Vercel deployment)
if (process.env.NODE_ENV !== 'production') {
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
}

// Export the Express app for Vercel (serverless deployment)
module.exports = app;