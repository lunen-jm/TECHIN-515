const functions = require('firebase-functions');

// Import the device registration functions
const {
  registerDevice,
  generateRegistrationCode,
  cleanupExpiredCodes,
  deviceHeartbeat
} = require('./deviceRegistration');

// Export the functions
exports.registerDevice = registerDevice;
exports.generateRegistrationCode = generateRegistrationCode;
exports.cleanupExpiredCodes = cleanupExpiredCodes;
exports.deviceHeartbeat = deviceHeartbeat;
