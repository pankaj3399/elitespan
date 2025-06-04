// server/routes/providerRoutes.js
const express = require('express');
const Provider = require('../models/Provider.js');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

// --- Helper Function to Construct Full S3 URL ---
const getFullS3Url = (key) => {
  if (!key) {
    return null; // Or a default placeholder, or an empty string
  }
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  if (!bucketName || !region) {
    console.warn(
      `Backend Misconfiguration: AWS_S3_BUCKET_NAME ('${bucketName}') or AWS_REGION ('${region}') is not set. Cannot form full S3 URL for key: ${key}`
    );
    // Fallback: Return the key itself. Frontend will likely show a broken image,
    // indicating a backend configuration issue.
    return key;
  }
  // Standard S3 URL format: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

// --- Helper to prepare provider data for response (with full URLs) ---
const prepareProviderForResponse = (providerDocument) => {
  if (!providerDocument) return null;
  // Ensure we work with a plain object for modification
  const providerObject = providerDocument.toObject
    ? providerDocument.toObject()
    : { ...providerDocument };

  providerObject.headshotUrl = getFullS3Url(providerObject.headshotUrl);
  providerObject.galleryUrl = getFullS3Url(providerObject.galleryUrl);
  // If you add other S3 image keys to your Provider model in the future, transform them here too.

  return providerObject;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
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
    // req.body.headshotUrl and req.body.galleryUrl, if present, are S3 keys
    const providerData = new Provider(req.body); // S3 keys are stored as is
    const savedProvider = await providerData.save();

    res.status(201).json({
      message: 'Provider info saved successfully',
      providerId: savedProvider._id,
      provider: prepareProviderForResponse(savedProvider), // Transform S3 keys to full URLs for the response
    });
  } catch (err) {
    console.error('Error saving provider info:', err);
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Provider with this information already exists' });
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
      stateLicenses, // NEW FIELD
    } = req.body;

    // Validate stateLicenses if provided
    if (stateLicenses && Array.isArray(stateLicenses)) {
      for (const license of stateLicenses) {
        // Check if all required fields are present
        if (!license.state || !license.deaNumber || !license.licenseNumber) {
          return res.status(400).json({ 
            message: 'Each state license must include state, DEA number, and license number' 
          });
        }
        
        // Trim whitespace
        license.state = license.state.trim();
        license.deaNumber = license.deaNumber.trim();
        license.licenseNumber = license.licenseNumber.trim();
        
        // Basic validation - ensure fields are not empty after trimming
        if (license.state.length === 0 || license.deaNumber.length === 0 || license.licenseNumber.length === 0) {
          return res.status(400).json({ 
            message: 'State, DEA number, and license number cannot be empty' 
          });
        }

        // Validate state format (should be 2-letter state code)
        if (license.state.length !== 2) {
          return res.status(400).json({ 
            message: 'State must be a valid 2-letter state code' 
          });
        }
      }
      
      // Check for duplicate states
      const states = stateLicenses.map(license => license.state.toUpperCase());
      const uniqueStates = new Set(states);
      if (states.length !== uniqueStates.size) {
        return res.status(400).json({ 
          message: 'Cannot have multiple licenses for the same state' 
        });
      }

      // Normalize state codes to uppercase
      stateLicenses.forEach(license => {
        license.state = license.state.toUpperCase();
      });
    }

    const updateData = {
      specialties: specialties || [],
      boardCertifications: boardCertifications || [],
      hospitalAffiliations: hospitalAffiliations || [],
      educationAndTraining: educationAndTraining || [],
      stateLicenses: stateLicenses || [], // Include state licenses
    };

    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json({
      message: 'Qualifications saved successfully',
      provider: prepareProviderForResponse(updatedProvider), // Transform S3 keys to full URLs
    });
  } catch (error) {
    console.error('Error saving qualifications:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid provider ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update provider images (Step 2)
router.put('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    // IMPORTANT: headshotUrl and galleryUrl from req.body are S3 KEYS
    const { headshotUrl, galleryUrl } = req.body;

    const updateData = {};
    if (headshotUrl !== undefined) {
      // Check for undefined to allow empty string for removal
      updateData.headshotUrl = headshotUrl; // Store the S3 KEY
    }
    if (galleryUrl !== undefined) {
      updateData.galleryUrl = galleryUrl; // Store the S3 KEY
    }

    if (Object.keys(updateData).length === 0) {
      // If no image data is sent, fetch and return the current provider data (with transformed URLs)
      const currentProvider = await Provider.findById(id);
      if (!currentProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      return res.status(200).json({
        message: 'No new image information provided. Current data returned.',
        provider: prepareProviderForResponse(currentProvider),
      });
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set to only update provided fields
      { new: true, runValidators: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json({
      message: 'Images saved successfully',
      provider: prepareProviderForResponse(updatedProvider), // Transform S3 keys to full URLs
    });
  } catch (error) {
    console.error('Error saving images:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const providerFromDB = await Provider.findOne({ _id: id });

    if (!providerFromDB) {
      return res
        .status(404)
        .json({ message: 'Provider not found or not available' });
    }

    res.status(200).json({
      message: 'Provider retrieved successfully',
      provider: prepareProviderForResponse(providerFromDB), // Transform S3 keys to full URLs
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid provider ID format' });
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

// Upload Reviews Route
router.post(
  '/:providerId/upload-reviews',
  upload.single('reviewsFile'),
  async (req, res) => {
    try {
      const { providerId } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const provider = await Provider.findById(providerId); // This is the provider whose reviews are being updated
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res
          .status(400)
          .json({ error: 'Excel file is empty or has no valid data' });
      }

      const reviewsData = [];
      const errors = [];
      data.forEach((row, index) => {
        try {
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

          if (!clientName || !reviewText || isNaN(satisfactionRating)) {
            errors.push(
              `Row ${
                index + 2
              }: Missing required fields (Client Name, Review, or Satisfaction Rating)`
            );
            return;
          }
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
            satisfactionRating: Math.round(satisfactionRating * 10) / 10,
            efficacyRating: Math.round(efficacyRating * 10) / 10,
          });
        } catch (error) {
          errors.push(
            `Row ${index + 2}: Error processing data - ${error.message}`
          );
        }
      });

      if (errors.length > 0 && reviewsData.length === 0) {
        return res
          .status(400)
          .json({
            error: 'No valid reviews found in Excel file',
            details: errors.slice(0, 5),
          });
      }

      const reviewsAddedCount = provider.addReviewsFromExcel(reviewsData);
      await provider.save();

      const responsePayload = {
        message: 'Reviews processed successfully',
        reviewsAdded: reviewsAddedCount,
        totalRows: data.length,
        stats: provider.reviewStats, // Assuming reviewStats doesn't contain S3 keys needing transformation
      };

      if (errors.length > 0) {
        responsePayload.warnings = {
          message: `${errors.length} rows had issues and were skipped`,
          details: errors.slice(0, 5),
        };
      }
      res.json(responsePayload);
    } catch (error) {
      console.error('Error processing reviews:', error);
      if (error.message.includes('Only .xlsx and .xls files are allowed')) {
        return res
          .status(400)
          .json({
            error: 'Invalid file type. Only .xlsx and .xls files are allowed.',
          });
      }
      res
        .status(500)
        .json({
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

    const activeReviews = provider.reviews.filter(
      (review) => review.isActive && review.isApproved
    );

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = activeReviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews, // Assuming reviews themselves don't contain S3 keys needing transformation
      totalReviews: activeReviews.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(activeReviews.length / parseInt(limit)),
      stats: provider.reviewStats, // Assuming reviewStats doesn't contain S3 keys
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
