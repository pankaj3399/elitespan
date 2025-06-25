// server/routes/providerRoutes.js
const express = require('express');
const Provider = require('../models/Provider.js');
const User = require('../models/User.js');
const multer = require('multer');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { sendProviderRegistrationEmails } = require('../utils/email.js');
const {
  geocodeAddress,
  createGeoJSONPoint,
  buildProviderAddress,
  calculateDistance,
} = require('../utils/geocoding.js');
const router = express.Router();

// --- Helper Function to Construct Full S3 URL ---
const getFullS3Url = (key) => {
  if (!key) {
    return null;
  }
   if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  if (!bucketName || !region) {
    console.warn(
      `Backend Misconfiguration: AWS_S3_BUCKET_NAME ('${bucketName}') or AWS_REGION ('${region}') is not set. Cannot form full S3 URL for key: ${key}`
    );
    return key;
  }
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

// --- Helper to prepare provider data for response (with full URLs and distance) ---
const prepareProviderForResponse = (providerDocument, userLocation = null) => {
  if (!providerDocument) return null;
  const providerObject = providerDocument.toObject
    ? providerDocument.toObject()
    : { ...providerDocument };

  providerObject.headshotUrl = getFullS3Url(providerObject.headshotUrl);
  providerObject.galleryUrl = getFullS3Url(providerObject.galleryUrl);

  // Add distance if user location is provided
  if (
    userLocation &&
    providerObject.location &&
    providerObject.location.coordinates
  ) {
    const [providerLng, providerLat] = providerObject.location.coordinates;
    const [userLng, userLat] = userLocation.coordinates;
    const distance = calculateDistance(
      userLat,
      userLng,
      providerLat,
      providerLng
    );
    providerObject.distance = Math.round(distance * 10) / 10; // Round to 1 decimal place
    providerObject.distanceUnit = 'miles';
  }

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

// GET all providers with geospatial search
router.get('/', async (req, res) => {
  try {
    const { search, specialty, location, userSpecialties, userId } = req.query;

    console.log('🔍 Provider search request:', {
      search,
      specialty,
      location,
      userSpecialties,
      userId,
    });

    // Get user's location for distance calculation
    let userLocation = null;
    if (userId) {
      try {
        const user = await User.findById(userId).select('location');
        if (user && user.location) {
          userLocation = user.location;
          console.log('👤 Found user location:', userLocation.coordinates);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch user location:', error.message);
      }
    }

    // Base query: Ensures only active and approved providers are shown to users.
    const query = {
      isActive: true,
      isApproved: true,
    };

    // Add specialty filter if provided (manual search)
    if (specialty) {
      console.log('🎯 Adding specialty filter:', specialty);
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }

    // Add user specialties filter if provided (automatic matching)
    if (userSpecialties && !specialty) {
      // Only apply if not manually searching
      const userSpecialtiesArray = userSpecialties
        .split(',')
        .map((s) => s.trim());
      console.log('👤 User specialties for matching:', userSpecialtiesArray);

      // Create regex patterns for partial matching
      const specialtyRegexes = userSpecialtiesArray.map(
        (userSpec) => new RegExp(userSpec, 'i')
      );

      console.log('🔍 Final specialty regexes:', specialtyRegexes);
      query.specialties = { $in: specialtyRegexes };
      console.log('🔎 Applied user specialty filter to query');
    }

    // Add location filter if provided (search city and state only)
    if (location) {
      console.log('📍 Adding location filter:', location);
      const locationRegex = new RegExp(location, 'i');
      query.$or = [{ city: locationRegex }, { state: locationRegex }];
    }

    // Add general search filter if provided (searches multiple fields)
    if (search) {
      console.log('🔍 Adding general search filter:', search);
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { providerName: searchRegex },
        { practiceName: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { specialties: { $in: [searchRegex] } },
      ];
    }

    console.log('📋 Final MongoDB query:', JSON.stringify(query, null, 2));

    let providers;

    // If we have user location, use geospatial query for distance sorting
    if (userLocation && userLocation.coordinates) {
      console.log('🌍 Using geospatial query with user location');

      providers = await Provider.aggregate([
        {
          $geoNear: {
            near: userLocation,
            distanceField: 'calculatedDistance',
            distanceMultiplier: 0.000621371, // Convert meters to miles
            spherical: true,
            query: query,
            key: 'location', // <--- ADD THIS LINE
            maxDistance: 160934 * 100,
            minDistance: 0,
          },
        },
        { $limit: 100 },
      ]);

      console.log(
        `📊 Found ${providers.length} providers with geospatial sorting`
      );
    } else {
      // Fallback to regular query without distance sorting
      console.log('📍 Using regular query without geospatial sorting');
      providers = await Provider.find(query).limit(100);
      console.log(`📊 Found ${providers.length} providers from regular query`);
    }

    // Log each provider's specialties for debugging
    providers.forEach((provider, index) => {
      console.log(`Provider ${index + 1}: ${provider.providerName}`);
      console.log(`  Raw specialties:`, provider.specialties);
      console.log(
        `  Distance: ${provider.calculatedDistance ? provider.calculatedDistance.toFixed(1) + ' miles' : 'Not calculated'}`
      );

      // If we have user specialties, check if this provider matches
      if (userSpecialties) {
        const userSpecialtiesArray = userSpecialties
          .split(',')
          .map((s) => s.trim().toLowerCase());
        const providerSpecialties =
          provider.specialties?.map((s) => s.toLowerCase()) || [];

        const hasMatch = providerSpecialties.some((providerSpec) =>
          userSpecialtiesArray.some(
            (userSpec) =>
              providerSpec.includes(userSpec) || userSpec.includes(providerSpec)
          )
        );

        console.log(`  Matches user specialties: ${hasMatch ? '✅' : '❌'}`);
      }
      console.log('---');
    });

    // Use the helper function to ensure S3 URLs are complete and add distance
    const preparedProviders = providers.map((p) =>
      prepareProviderForResponse(p, userLocation)
    );

    console.log(`✅ Returning ${preparedProviders.length} prepared providers`);

    res.json({
      success: true,
      count: preparedProviders.length,
      providers: preparedProviders,
      debug: {
        originalQuery: query,
        userSpecialties: userSpecialties ? userSpecialties.split(',') : null,
        userLocationUsed: !!userLocation,
        searchType: specialty
          ? 'manual specialty search'
          : userSpecialties
            ? 'user specialty matching'
            : location
              ? 'location search'
              : search
                ? 'general search'
                : 'all providers',
        sortedByDistance: !!userLocation,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching public providers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new provider (Step 1: Basic Info) with geocoding
router.post('/', async (req, res) => {
  try {
    const { password, confirmPassword, ...providerData } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password is required and must be at least 6 characters long',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: providerData.email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Geocode provider address
    console.log('🌍 Geocoding provider address');
    const fullAddress = buildProviderAddress(providerData);
    let coordinates;

    try {
      const geocodeResult = await geocodeAddress(fullAddress);
      coordinates = createGeoJSONPoint(geocodeResult.lat, geocodeResult.lng);
      console.log('✅ Provider address geocoded successfully:', coordinates);
    } catch (geocodeError) {
      console.error(
        '❌ Geocoding failed for provider address:',
        geocodeError.message
      );
      return res.status(400).json({
        message:
          'Unable to verify the provided address. Please check that the address is correct.',
        geocodeError: geocodeError.message,
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the Provider document with location
    const newProvider = new Provider({
      ...providerData,
      location: coordinates,
    });
    const savedProvider = await newProvider.save();

    // Create the User document with provider role
    const newUser = new User({
      name: providerData.providerName,
      email: providerData.email,
      password: hashedPassword,
      role: 'provider',
      providerId: savedProvider._id,
      contactInfo: {
        address: fullAddress,
        phone: '', // Provider phone would be separate
        specialties: providerData.specialties || [],
      },
      location: coordinates, // Same location as provider
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'Provider account created successfully',
      providerId: savedProvider._id,
      userId: savedUser._id,
      provider: prepareProviderForResponse(savedProvider),
    });
  } catch (err) {
    console.error('Error creating provider account:', err);

    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (err.code === 11000) {
      // Handle duplicate key error
      if (err.keyPattern?.email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (err.keyPattern?.npiNumber) {
        return res.status(400).json({ message: 'NPI Number already exists' });
      }
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
      stateLicenses,
    } = req.body;

    // Validate stateLicenses if provided
    if (stateLicenses && Array.isArray(stateLicenses)) {
      for (const license of stateLicenses) {
        if (!license.state || !license.deaNumber || !license.licenseNumber) {
          return res.status(400).json({
            message:
              'Each state license must include state, DEA number, and license number',
          });
        }

        license.state = license.state.trim();
        license.deaNumber = license.deaNumber.trim();
        license.licenseNumber = license.licenseNumber.trim();

        if (
          license.state.length === 0 ||
          license.deaNumber.length === 0 ||
          license.licenseNumber.length === 0
        ) {
          return res.status(400).json({
            message: 'State, DEA number, and license number cannot be empty',
          });
        }

        if (license.state.length !== 2) {
          return res.status(400).json({
            message: 'State must be a valid 2-letter state code',
          });
        }
      }

      // Check for duplicate states
      const states = stateLicenses.map((license) =>
        license.state.toUpperCase()
      );
      const uniqueStates = new Set(states);
      if (states.length !== uniqueStates.size) {
        return res.status(400).json({
          message: 'Cannot have multiple licenses for the same state',
        });
      }

      // Normalize state codes to uppercase
      stateLicenses.forEach((license) => {
        license.state = license.state.toUpperCase();
      });
    }

    const updateData = {
      specialties: specialties || [],
      boardCertifications: boardCertifications || [],
      hospitalAffiliations: hospitalAffiliations || [],
      educationAndTraining: educationAndTraining || [],
      stateLicenses: stateLicenses || [],
    };

    const updatedProvider = await Provider.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.status(200).json({
      message: 'Qualifications saved successfully',
      provider: prepareProviderForResponse(updatedProvider),
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

// Update provider images and practice description (Step 3)
router.put('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { headshotUrl, galleryUrl, practiceDescription } = req.body;

    const updateData = {};
    if (headshotUrl !== undefined) {
      updateData.headshotUrl = headshotUrl;
    }
    if (galleryUrl !== undefined) {
      updateData.galleryUrl = galleryUrl;
    }
    if (practiceDescription !== undefined) {
      updateData.practiceDescription = practiceDescription.trim();
    }

    if (Object.keys(updateData).length === 0) {
      const currentProvider = await Provider.findById(id);
      if (!currentProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      return res.status(200).json({
        message: 'No new information provided. Current data returned.',
        provider: prepareProviderForResponse(currentProvider),
      });
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // If this is the final step, send emails
    if (headshotUrl && galleryUrl && practiceDescription) {
      try {
        await sendProviderRegistrationEmails(id);
        console.log(
          '✅ Provider registration completed - emails sent successfully'
        );
      } catch (emailError) {
        console.error('❌ Failed to send registration emails:', emailError);
        // Don't fail the upload if email fails
      }
    }

    res.status(200).json({
      message: 'Profile content saved successfully',
      provider: prepareProviderForResponse(updatedProvider),
    });
  } catch (error) {
    console.error('Error saving profile content:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get provider by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Optional user ID for distance calculation

    const providerFromDB = await Provider.findOne({
      _id: id,
      isActive: true,
      isApproved: true,
    });

    if (!providerFromDB) {
      return res
        .status(404)
        .json({ message: 'Provider not found or not available' });
    }

    // Get user location if userId provided
    let userLocation = null;
    if (userId) {
      try {
        const user = await User.findById(userId).select('location');
        if (user && user.location) {
          userLocation = user.location;
        }
      } catch (error) {
        console.warn(
          '⚠️ Could not fetch user location for provider details:',
          error.message
        );
      }
    }

    res.status(200).json({
      message: 'Provider retrieved successfully',
      provider: prepareProviderForResponse(providerFromDB, userLocation),
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

// KEPT: Upload reviews (for future use elsewhere in the app)
router.post(
  '/:providerId/upload-reviews',
  upload.single('reviewsFile'),
  async (req, res) => {
    try {
      const { providerId } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const provider = await Provider.findById(providerId);
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
        return res.status(400).json({
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
        stats: provider.reviewStats,
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
        return res.status(400).json({
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

// KEPT: Get provider with reviews (for future use elsewhere)
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
