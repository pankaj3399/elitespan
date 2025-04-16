const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    practiceName: String,
    providerName: String,
    npiNumber: String,
    address: String,
    suite: String,
    city: String,
    state: String,
    zip: String,
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
