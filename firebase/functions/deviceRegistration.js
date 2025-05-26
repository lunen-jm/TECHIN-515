const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function for ESP32 device self-registration
 * Called by ESP32 devices during WiFi provisioning
 */
exports.registerDevice = functions.https.onRequest(async (req, res) => {
  // Enable CORS for ESP32 requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { deviceId, registrationCode, deviceType, capabilities } = req.body;

    // Validate required fields
    if (!deviceId || !registrationCode) {
      res.status(400).json({ 
        error: 'Missing required fields: deviceId and registrationCode' 
      });
      return;
    }

    console.log(`Device registration attempt: ${deviceId} with code: ${registrationCode}`);

    // Verify registration code exists and is valid
    const regCodeDoc = await db.collection('registrationCodes').doc(registrationCode).get();
    
    if (!regCodeDoc.exists) {
      console.log(`Invalid registration code: ${registrationCode}`);
      res.status(400).json({ error: 'Invalid registration code' });
      return;
    }

    const regCodeData = regCodeDoc.data();
    
    // Check if code has expired (24 hour expiry)
    const now = admin.firestore.Timestamp.now();
    const expiryTime = regCodeData.createdAt.toMillis() + (24 * 60 * 60 * 1000); // 24 hours
    
    if (now.toMillis() > expiryTime) {
      console.log(`Expired registration code: ${registrationCode}`);
      res.status(400).json({ error: 'Registration code has expired' });
      return;
    }

    // Check if code has already been used
    if (regCodeData.used) {
      console.log(`Already used registration code: ${registrationCode}`);
      res.status(400).json({ error: 'Registration code has already been used' });
      return;
    }

    // Check if device already exists
    const deviceDoc = await db.collection('devices').doc(deviceId).get();
    if (deviceDoc.exists) {
      console.log(`Device already registered: ${deviceId}`);
      res.status(409).json({ error: 'Device already registered' });
      return;
    }

    // Get farm and user information from registration code
    const farmId = regCodeData.farmId;
    const userId = regCodeData.userId;

    // Verify farm exists and user has access
    const farmDoc = await db.collection('farms').doc(farmId).get();
    if (!farmDoc.exists) {
      console.log(`Farm not found: ${farmId}`);
      res.status(400).json({ error: 'Associated farm not found' });
      return;
    }

    const farmData = farmDoc.data();
    if (!farmData.users || !farmData.users.includes(userId)) {
      console.log(`User ${userId} does not have access to farm ${farmId}`);
      res.status(403).json({ error: 'User does not have access to farm' });
      return;
    }

    // Create device document
    const deviceData = {
      id: deviceId,
      name: regCodeData.deviceName || `Sensor ${deviceId.slice(-4)}`,
      type: deviceType || 'farm_sensor',
      farmId: farmId,
      location: regCodeData.location || {
        name: 'Unspecified Location',
        coordinates: null
      },
      capabilities: capabilities ? capabilities.split(',') : ['temperature', 'humidity'],
      status: 'online',
      batteryLevel: 100,
      lastSeen: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      registeredBy: userId,
      registrationCode: registrationCode,
      firmwareVersion: '1.0.0',
      settings: {
        readingInterval: 300, // 5 minutes default
        transmissionInterval: 1800, // 30 minutes default
        sleepMode: true
      },
      calibration: {
        temperature: { offset: 0, scale: 1 },
        humidity: { offset: 0, scale: 1 },
        soilMoisture: { min: 0, max: 1023 }
      }
    };

    // Use batch write to ensure atomicity
    const batch = db.batch();

    // Add device
    const deviceRef = db.collection('devices').doc(deviceId);
    batch.set(deviceRef, deviceData);

    // Mark registration code as used
    const regCodeRef = db.collection('registrationCodes').doc(registrationCode);
    batch.update(regCodeRef, {
      used: true,
      usedAt: admin.firestore.Timestamp.now(),
      deviceId: deviceId
    });

    // Update farm's device count
    const farmRef = db.collection('farms').doc(farmId);
    batch.update(farmRef, {
      deviceCount: admin.firestore.FieldValue.increment(1),
      lastDeviceAdded: admin.firestore.Timestamp.now()
    });

    // Commit the batch
    await batch.commit();

    console.log(`Device registered successfully: ${deviceId} to farm ${farmId}`);

    // Return success response with device configuration
    res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      device: {
        id: deviceId,
        name: deviceData.name,
        farmId: farmId,
        settings: deviceData.settings
      },
      firebase: {
        projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT,
        databaseURL: `https://${process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT}-default-rtdb.firebaseio.com/`
      }
    });

  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Cloud Function to generate registration codes
 * Called by the web app when users want to add new devices
 */
exports.generateRegistrationCode = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { farmId, deviceName, location } = data;
  const userId = context.auth.uid;

  try {
    // Verify user has access to the farm
    const farmDoc = await db.collection('farms').doc(farmId).get();
    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found');
    }

    const farmData = farmDoc.data();
    if (!farmData.users || !farmData.users.includes(userId)) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have access to this farm');
    }

    // Generate a unique 8-character registration code
    const registrationCode = generateUniqueCode();

    // Create registration code document
    const regCodeData = {
      code: registrationCode,
      farmId: farmId,
      userId: userId,
      deviceName: deviceName || 'New Farm Sensor',
      location: location || { name: 'Unspecified Location', coordinates: null },
      createdAt: admin.firestore.Timestamp.now(),
      used: false,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours
    };

    await db.collection('registrationCodes').doc(registrationCode).set(regCodeData);

    console.log(`Registration code generated: ${registrationCode} for farm ${farmId}`);

    return {
      registrationCode: registrationCode,
      expiresAt: regCodeData.expiresAt,
      deviceName: regCodeData.deviceName,
      farmName: farmData.name
    };

  } catch (error) {
    console.error('Error generating registration code:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate registration code');
  }
});

/**
 * Helper function to generate unique registration codes
 */
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Scheduled function to clean up expired registration codes
 */
exports.cleanupExpiredCodes = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  
  try {
    const expiredCodes = await db.collection('registrationCodes')
      .where('expiresAt', '<', now)
      .where('used', '==', false)
      .get();

    const batch = db.batch();
    expiredCodes.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${expiredCodes.size} expired registration codes`);
  } catch (error) {
    console.error('Error cleaning up expired codes:', error);
  }
});

/**
 * HTTP endpoint for device heartbeat/status updates
 */
exports.deviceHeartbeat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { deviceId, batteryLevel, status, readings } = req.body;

    if (!deviceId) {
      res.status(400).json({ error: 'Device ID is required' });
      return;
    }

    // Update device status
    const deviceRef = db.collection('devices').doc(deviceId);
    const updateData = {
      lastSeen: admin.firestore.Timestamp.now(),
      status: status || 'online'
    };

    if (batteryLevel !== undefined) {
      updateData.batteryLevel = batteryLevel;
    }

    await deviceRef.update(updateData);

    // If readings are provided, store them
    if (readings && Array.isArray(readings)) {
      const batch = db.batch();
      
      readings.forEach(reading => {
        const readingRef = db.collection('readings').doc();
        batch.set(readingRef, {
          ...reading,
          deviceId: deviceId,
          timestamp: admin.firestore.Timestamp.now()
        });
      });

      await batch.commit();
    }

    res.status(200).json({ success: true, message: 'Heartbeat received' });

  } catch (error) {
    console.error('Device heartbeat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
