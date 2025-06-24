// server/utils/geocoding.js
const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ GOOGLE_MAPS_API_KEY not found in environment variables. Geocoding will not work.');
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * @param {string} address - The address to geocode
 * @returns {Object} - { lat, lng, formattedAddress } or null if failed
 */
const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  if (!address || address.trim().length === 0) {
    throw new Error('Address is required for geocoding');
  }

  try {
    console.log(`🌍 Geocoding address: ${address}`);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address.trim(),
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      console.error('❌ Geocoding failed:', response.data.status, response.data.error_message);
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    if (!response.data.results || response.data.results.length === 0) {
      console.error('❌ No geocoding results found for address:', address);
      throw new Error('No location found for the provided address');
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    console.log(`✅ Geocoded successfully: ${location.lat}, ${location.lng}`);
    
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address
    };

  } catch (error) {
    console.error('❌ Error in geocodeAddress:', error.message);
    
    if (error.response) {
      console.error('API Error:', error.response.data);
      throw new Error(`Geocoding API error: ${error.response.data.error_message || error.response.statusText}`);
    }
    
    throw error;
  }
};

/**
 * Create GeoJSON Point from latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} - GeoJSON Point object
 */
const createGeoJSONPoint = (lat, lng) => {
  return {
    type: 'Point',
    coordinates: [lng, lat] // Note: GeoJSON format is [longitude, latitude]
  };
};

/**
 * Calculate distance between two coordinates in miles
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} - Distance in miles
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Build provider address string for geocoding
 * @param {Object} provider - Provider object with address fields
 * @returns {string} - Full address string
 */
const buildProviderAddress = (provider) => {
  const parts = [provider.address];
  if (provider.suite) parts.push(provider.suite);
  parts.push(`${provider.city}, ${provider.state} ${provider.zip}`);
  return parts.join(', ');
};

module.exports = {
  geocodeAddress,
  createGeoJSONPoint,
  calculateDistance,
  buildProviderAddress
};