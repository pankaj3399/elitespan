const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const waitlistRoutes = require('./routes/waitlistRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration to allow requests from any origin (for testing)
app.use(cors({
  origin: '*', // Allow requests from any origin (not secure for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api', doctorRoutes);

// // Start cron job
// require('./utils/cron');

// Default route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running on Vercel');
});

// Define PORT from environment variable or default to 5000
// const PORT = process.env.PORT || 3000;

// // For local development: Start the server (comment or remove this for Vercel deployment)
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// Export the Express app for Vercel (serverless deployment)
module.exports = app;