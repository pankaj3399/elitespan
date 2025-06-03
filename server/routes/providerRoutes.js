// server/routes/providerRoutes.js
const express = require('express');
const Provider = require('../models/Provider.js');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept Excel files
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls files are allowed'), false);
    }
  },
});

// Create new provider (Step 1: Basic Info)
router.post('/', async (req, res) => {
  try {
    const providerData = new Provider(req.body);
    const saved = await providerData.save();
    res.status(201).json({
      message: 'Provider info saved successfully',
      providerId: saved._id,
      provider: saved,
    });
  } catch (err) {
    console.error('Error saving provider info:', err);

    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Provider with this information already exists',
      });
    }

    res.status(500).json({
      message: 'Server error',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
  }
});

// Update provider qualifications (Step 2)
router.put('/:id/qualifications', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      specialties,
      boardCertifications,
      hospitalAffiliations,
      educationAndTraining,
    } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      id,
      {
        specialties,
        boardCertifications,
        hospitalAffiliations,
        educationAndTraining,
      },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json({
      message: 'Qualifications saved successfully',
      provider,
    });
  } catch (error) {
    console.error('Error saving qualifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { headshotUrl, galleryUrl } = req.body; // ← REMOVED reviewsUrl

    // Convert S3 keys to full URLs
    const headshotFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${headshotUrl}`;
    const galleryFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${galleryUrl}`;
    // ← REMOVED reviewsFullUrl

    const provider = await Provider.findByIdAndUpdate(
      id,
      {
        headshotUrl: headshotFullUrl,
        galleryUrl: galleryFullUrl,
        // ← REMOVED reviewsUrl: reviewsFullUrl
      },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json({
      message: 'Images saved successfully',
      provider,
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
        message: 'Provider not found or not available',
      });
    }

    res.status(200).json({
      message: 'Provider retrieved successfully',
      provider,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid provider ID format',
      });
    }

    res.status(500).json({
      message: 'Server error',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

router.post(
  '/:providerId/upload-reviews',
  upload.single('reviewsFile'),
  async (req, res) => {
    try {
      const { providerId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Find the provider
      const provider = await Provider.findById(providerId);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // Parse Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res
          .status(400)
          .json({ error: 'Excel file is empty or has no valid data' });
      }

      // Process and validate review data
      const reviewsData = [];
      const errors = [];

      data.forEach((row, index) => {
        try {
          // Map Excel columns to review fields (flexible column name matching)
          const clientName =
            row['Client Name'] ||
            row['client_name'] ||
            row['name'] ||
            row['Name'] ||
            row['CLIENT NAME'];
          const reviewText =
            row['Review'] ||
            row['review'] ||
            row['comment'] ||
            row['Comment'] ||
            row['REVIEW'];
          const satisfactionRating = parseFloat(
            row['Satisfaction Rating'] ||
              row['satisfaction'] ||
              row['rating'] ||
              row['Rating'] ||
              row['SATISFACTION RATING'] ||
              row['Satisfaction'] ||
              row['SATISFACTION']
          );
          const efficacyRating =
            parseFloat(
              row['Efficacy Rating'] ||
                row['efficacy'] ||
                row['Efficacy'] ||
                row['EFFICACY RATING'] ||
                row['EFFICACY']
            ) || satisfactionRating;

          // Validate required fields
          if (!clientName || !reviewText || isNaN(satisfactionRating)) {
            errors.push(
              `Row ${
                index + 2
              }: Missing required fields (Client Name, Review, or Satisfaction Rating)`
            );
            return;
          }

          // Validate rating ranges
          if (satisfactionRating < 1 || satisfactionRating > 5) {
            errors.push(
              `Row ${index + 2}: Satisfaction rating must be between 1 and 5`
            );
            return;
          }

          if (efficacyRating < 1 || efficacyRating > 5) {
            errors.push(
              `Row ${index + 2}: Efficacy rating must be between 1 and 5`
            );
            return;
          }

          reviewsData.push({
            clientName: clientName.toString().trim(),
            reviewText: reviewText.toString().trim(),
            satisfactionRating: Math.round(satisfactionRating * 10) / 10, // Round to 1 decimal
            efficacyRating: Math.round(efficacyRating * 10) / 10,
          });
        } catch (error) {
          errors.push(
            `Row ${index + 2}: Error processing data - ${error.message}`
          );
        }
      });

      // If there are errors but some valid reviews, log errors but continue
      if (errors.length > 0 && reviewsData.length === 0) {
        return res.status(400).json({
          error: 'No valid reviews found in Excel file',
          details: errors.slice(0, 5), // Show first 5 errors
        });
      }

      // Add reviews to provider
      const reviewsAdded = provider.addReviewsFromExcel(reviewsData);
      await provider.save();

      // Prepare response
      const response = {
        message: 'Reviews processed successfully',
        reviewsAdded,
        totalRows: data.length,
        stats: provider.reviewStats,
      };

      if (errors.length > 0) {
        response.warnings = {
          message: `${errors.length} rows had issues and were skipped`,
          details: errors.slice(0, 5), // Show first 5 errors
        };
      }

      res.json(response);
    } catch (error) {
      console.error('Error processing reviews:', error);

      if (error.message.includes('Only .xlsx and .xls files are allowed')) {
        return res
          .status(400)
          .json({
            error: 'Invalid file type. Only .xlsx and .xls files are allowed.',
          });
      }

      res.status(500).json({
        error: 'Failed to process reviews file',
        details: error.message,
      });
    }
  }
);

// Get provider with reviews
router.get('/:providerId/reviews', async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Filter active and approved reviews
    const activeReviews = provider.reviews.filter(
      (review) => review.isActive && review.isApproved
    );

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = activeReviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      totalReviews: activeReviews.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(activeReviews.length / parseInt(limit)),
      stats: provider.reviewStats,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
