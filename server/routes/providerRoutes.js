// server/routes/providerRoutes.js 
const express = require('express');
const Provider = require('../models/Provider.js');

const router = express.Router();

// Create new provider (Step 1: Basic Info)
router.post('/', async (req, res) => {
    try {
        const providerData = new Provider(req.body);
        const saved = await providerData.save();
        res.status(201).json({
            message: 'Provider info saved successfully',
            providerId: saved._id,
            provider: saved
        });
    } catch (err) {
        console.error('Error saving provider info:', err);
        
        if (err.name === 'ValidationError') {
            const errors = {};
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: 'Provider with this information already exists' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// Update provider qualifications (Step 2)
router.put('/:id/qualifications', async (req, res) => {
    try {
        const { id } = req.params;
        const { specialties, boardCertifications, hospitalAffiliations, educationAndTraining } = req.body;
        
        const provider = await Provider.findByIdAndUpdate(
            id,
            {
                specialties,
                boardCertifications,
                hospitalAffiliations,
                educationAndTraining
            },
            { new: true, runValidators: true }
        );
        
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        
        res.status(200).json({
            message: 'Qualifications saved successfully',
            provider
        });
    } catch (error) {
        console.error('Error saving qualifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update provider images (Step 3)
router.put('/:id/images', async (req, res) => {
    try {
        const { id } = req.params;
        const { headshotUrl, galleryUrl, reviewsUrl } = req.body;
        
        // Convert S3 keys to full URLs
        const headshotFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${headshotUrl}`;
        const galleryFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${galleryUrl}`;
        const reviewsFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${reviewsUrl}`;
        
        const provider = await Provider.findByIdAndUpdate(
            id,
            {
                headshotUrl: headshotFullUrl,
                galleryUrl: galleryFullUrl,
                reviewsUrl: reviewsFullUrl
            },
            { new: true, runValidators: true }
        );
        
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        
        res.status(200).json({
            message: 'Images saved successfully',
            provider
        });
    } catch (error) {
        console.error('Error saving images:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find provider by ID and only return if active and approved
        const provider = await Provider.findOne({
            _id: id,
        });
        
        if (!provider) {
            return res.status(404).json({ 
                message: 'Provider not found or not available' 
            });
        }
        
        res.status(200).json({
            message: 'Provider retrieved successfully',
            provider
        });
        
    } catch (error) {
        console.error('Error fetching provider:', error);
        
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid provider ID format' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;