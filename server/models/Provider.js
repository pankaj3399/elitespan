// server/models/Provider.js 
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
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
    
    // Images/Files
    headshotUrl: String,
    galleryUrl: String, 
    reviewsUrl: String,

    isProfileComplete: { type: Boolean, default: false },
    
    // Status
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    
}, { timestamps: true });

// Add indexes for better performance
providerSchema.index({ npiNumber: 1 }, { unique: true });
providerSchema.index({ email: 1 });
providerSchema.index({ isActive: 1, isApproved: 1 });

// Virtual for full address
providerSchema.virtual('fullAddress').get(function() {
    const parts = [this.address];
    if (this.suite) parts.push(this.suite);
    parts.push(`${this.city}, ${this.state} ${this.zip}`);
    return parts.join(', ');
});

// Method to check if provider profile is complete
providerSchema.methods.checkProfileCompletion = function() {
    const hasBasicInfo = this.practiceName && this.providerName && this.email && this.npiNumber;
    const hasQualifications = this.specialties.length > 0 || this.boardCertifications.length > 0;
    const hasImages = this.headshotUrl && this.galleryUrl;

    this.isProfileComplete = hasBasicInfo && hasQualifications && hasImages;
    
    return this.isProfileComplete;
};

// Pre-save middleware to update completion status
providerSchema.pre('save', function(next) {
    this.checkProfileCompletion();
    next();
});

module.exports = mongoose.model('Provider', providerSchema);