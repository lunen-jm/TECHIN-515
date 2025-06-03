const functions = require('firebase-functions');

// Import the device registration functions
const {
  registerDevice,
  generateRegistrationCode,
  cleanupExpiredCodes,
  deviceHeartbeat
} = require('./deviceRegistration');

// Import sensor data function
const { sensorData } = require('./sensorData');

// Import reCAPTCHA verification function
const { verifyReCaptcha } = require('./recaptchaAPI');

// Export the functions
exports.registerDevice = registerDevice;
exports.generateRegistrationCode = generateRegistrationCode;
exports.cleanupExpiredCodes = cleanupExpiredCodes;
exports.deviceHeartbeat = deviceHeartbeat;
exports.sensorData = sensorData;
exports.verifyReCaptcha = verifyReCaptcha;
