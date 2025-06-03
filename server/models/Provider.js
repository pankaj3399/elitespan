// server/models/Provider.js
const mongoose = require('mongoose');

// Review subdocument schema
const reviewSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
    satisfactionRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    efficacyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: function () {
        return this.satisfactionRating;
      },
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const providerSchema = new mongoose.Schema(
  {
    // Basic Provider Information
    practiceName: { type: String, required: true },
    providerName: { type: String, required: true },
    email: { type: String, required: true },
    npiNumber: { type: String, required: true },
    address: { type: String, required: true },
    suite: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },

    // Qualifications
    specialties: { type: [String], default: [] },
    boardCertifications: { type: [String], default: [] },
    hospitalAffiliations: { type: [String], default: [] },
    educationAndTraining: { type: [String], default: [] },

    // Images/Files (remove reviewsUrl since we're not storing Excel)
    headshotUrl: String,
    galleryUrl: String,

    // Embedded Reviews
    reviews: [reviewSchema],

    isProfileComplete: { type: Boolean, default: false },

    // Status
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for better performance
providerSchema.index({ npiNumber: 1 }, { unique: true });
providerSchema.index({ email: 1 });
providerSchema.index({ isActive: 1, isApproved: 1 });
providerSchema.index({ 'reviews.satisfactionRating': 1 });
providerSchema.index({ 'reviews.isActive': 1, 'reviews.isApproved': 1 });

// Virtual for full address
providerSchema.virtual('fullAddress').get(function () {
  const parts = [this.address];
  if (this.suite) parts.push(this.suite);
  parts.push(`${this.city}, ${this.state} ${this.zip}`);
  return parts.join(', ');
});

// Virtual for review statistics
providerSchema.virtual('reviewStats').get(function () {
  const activeReviews = this.reviews.filter(
    (review) => review.isActive && review.isApproved
  );

  if (activeReviews.length === 0) {
    return {
      totalReviews: 0,
      averageSatisfactionRating: 0,
      averageEfficacyRating: 0,
    };
  }

  const totalSatisfaction = activeReviews.reduce(
    (sum, review) => sum + review.satisfactionRating,
    0
  );
  const totalEfficacy = activeReviews.reduce(
    (sum, review) => sum + review.efficacyRating,
    0
  );

  return {
    totalReviews: activeReviews.length,
    averageSatisfactionRating:
      Math.round((totalSatisfaction / activeReviews.length) * 10) / 10,
    averageEfficacyRating:
      Math.round((totalEfficacy / activeReviews.length) * 10) / 10,
  };
});

// Method to check if provider profile is complete
providerSchema.methods.checkProfileCompletion = function () {
  const hasBasicInfo =
    this.practiceName && this.providerName && this.email && this.npiNumber;
  const hasQualifications =
    this.specialties.length > 0 || this.boardCertifications.length > 0;
  const hasImages = this.headshotUrl && this.galleryUrl;

  this.isProfileComplete = hasBasicInfo && hasQualifications && hasImages;

  return this.isProfileComplete;
};

// Method to add reviews from Excel data
providerSchema.methods.addReviewsFromExcel = function (reviewsData) {
  // Clear existing reviews
  this.reviews = [];

  // Add new reviews
  reviewsData.forEach((reviewData) => {
    this.reviews.push({
      clientName: reviewData.clientName,
      reviewText: reviewData.reviewText,
      satisfactionRating: reviewData.satisfactionRating,
      efficacyRating:
        reviewData.efficacyRating || reviewData.satisfactionRating,
    });
  });

  return this.reviews.length;
};

// Pre-save middleware to update completion status
providerSchema.pre('save', function (next) {
  this.checkProfileCompletion();
  next();
});

// Ensure virtual fields are serialized
providerSchema.set('toJSON', { virtuals: true });
providerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Provider', providerSchema);
