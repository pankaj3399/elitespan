const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    headshotUrl: { type: String, required: true },
    galleryUrl: { type: String, required: true },
    reviewsUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);
