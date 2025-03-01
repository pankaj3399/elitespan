const express = require('express');
const router = express.Router();
const { getDoctors, seedDoctors } = require('../controllers/doctorController');

router.get('/doctors', getDoctors);
router.post('/doctors/seed', seedDoctors); // For seeding mock data (run once)

module.exports = router;