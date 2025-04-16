// server/routes/qualifications.js
const express = require('express');
const Qualification = require('../models/Qualification.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const qualification = new Qualification(req.body);
        await qualification.save();
        res.status(201).json({ message: 'Qualification saved successfully', qualification });
    } catch (error) {
        console.error('Error saving qualification:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
