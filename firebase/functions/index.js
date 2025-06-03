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

// Import demo setup function
const { setupDemoData } = require('./setupDemo');

// Import reCAPTCHA verification function
const { verifyReCaptcha } = require('./recaptchaAPI');

// Import Auth0 integration functions
const { createFirebaseToken, syncAuth0User } = require('./auth0Integration');

// Export the functions
exports.registerDevice = registerDevice;
exports.generateRegistrationCode = generateRegistrationCode;
exports.cleanupExpiredCodes = cleanupExpiredCodes;
exports.deviceHeartbeat = deviceHeartbeat;
exports.sensorData = sensorData;
exports.setupDemoData = setupDemoData;
exports.verifyReCaptcha = verifyReCaptcha;
exports.createFirebaseToken = createFirebaseToken;
exports.syncAuth0User = syncAuth0User;
