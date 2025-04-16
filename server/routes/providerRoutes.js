const express = require('express');
const Provider = require('../models/Provider.js'); // Mongoose model

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const providerData = new Provider(req.body);
        const saved = await providerData.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error saving provider info:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
