const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already done)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Demo farm and device IDs
const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
const DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';

// Test user UIDs from Firebase users.json export
const TEST_USERS = [
  '9tYnt2BXzqUbgYU1Bp5t6tEszrm1', // user@farmsensors.com
  'HtuMOj7VfnSSPwPWZCx7GEAr9tC3', // admin@farmsensors.com
  'IB1h5MCvcNU8AFHa5OQELFWpbwH3', // jaden.a.moon@gmail.com
  'V3ZgACoCsdN9yOYrc1xQOINg1nq1'  // test@example.com
];

/**
 * Cloud Function to set up demo data for ESP32 display testing
 * This is a one-time setup function that creates the necessary Firebase documents
 */
exports.setupDemoData = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  try {
    console.log('🚀 Starting demo farm setup...');
    
    // Step 1: Create/Update the farm document
    console.log('📝 Creating/updating farm document...');
    const farmData = {
      name: 'My Test Farm',
      description: 'Demo farm for ESP32 display testing',
      location: 'Demo Location',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isDemo: true,
      devices: [DEVICE_ID],
      userId: TEST_USERS[0], // Assign to first test user
      user_id: TEST_USERS[0]  // Backward compatibility
    };
    
    await db.collection('farms').doc(FARM_ID).set(farmData, { merge: true });
    console.log('✅ Farm document created/updated');

    // Step 2: Create/Update the device document
    console.log('📱 Creating/updating device document...');
    const deviceData = {
      name: 'Demo Sensor',
      farmId: FARM_ID,
      farmName: 'My Test Farm',
      type: 'ESP32_Display',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isDemo: true,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      userId: TEST_USERS[0],
      registeredFarm: FARM_ID,  // For backward compatibility
      registered_farm: FARM_ID  // Alternative field name
    };
    
    await db.collection('devices').doc(DEVICE_ID).set(deviceData, { merge: true });
    console.log('✅ Device document created/updated');

    // Step 3: Set up access permissions for test users
    console.log('👥 Setting up user access permissions...');
    
    const userPermissionPromises = [];
    
    // Create userFarms collection entries (for ESP32 access checking)
    for (const userId of TEST_USERS) {
      const userFarmData = {
        userId: userId,
        farmId: FARM_ID,
        farmName: 'My Test Farm',
        role: 'owner',
        permissions: ['read', 'write', 'admin'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isDemo: true
      };
      
      userPermissionPromises.push(
        db.collection('userFarms').doc(`${userId}_${FARM_ID}`).set(userFarmData, { merge: true })
      );
    }

    // Create farmMembers collection entries (for web app access)
    for (const userId of TEST_USERS) {
      const memberData = {
        userId: userId,
        farmId: FARM_ID,
        role: 'owner',
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedBy: 'demo_setup',
        isDemo: true
      };
      
      userPermissionPromises.push(
        db.collection('farmMembers').doc(`${userId}_${FARM_ID}`).set(memberData, { merge: true })
      );
    }
    
    await Promise.all(userPermissionPromises);
    console.log(`✅ User permissions set up for ${TEST_USERS.length} users`);

    // Step 4: Create farmDevices association
    console.log('🔗 Creating farm-device association...');
    const farmDeviceData = {
      farmId: FARM_ID,
      deviceId: DEVICE_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isDemo: true
    };
    
    await db.collection('farmDevices').doc(`${FARM_ID}_${DEVICE_ID}`).set(farmDeviceData, { merge: true });
    console.log('✅ Farm-device association created');

    // Step 5: Create initial sensor data structure
    console.log('📊 Creating initial sensor data...');
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    const initialData = {
      deviceId: DEVICE_ID,
      farmId: FARM_ID,
      timestamp: timestamp,
      receivedAt: timestamp,
      data: {
        temperature: 22.5,
        humidity: 65.0,
        co2: 400,
        distance1: 150.0,
        distance2: 152.0,
        distance_avg: 151.0,
        outdoor_temperature: 18.0,
        wifi_rssi: -45,
        grain_level_percent: 78.5
      },
      isDemo: true,
      source: 'demo_setup'
    };

    // Add to sensorData collection
    await db.collection('sensorData').add(initialData);
    console.log('✅ Initial sensor data created in sensorData collection');

    // Add individual readings for web app compatibility
    const readingBase = {
      deviceId: DEVICE_ID,
      farmId: FARM_ID,
      timestamp: timestamp,
      receivedAt: timestamp,
      isDemo: true
    };

    // Create all readings in parallel for speed
    const readingPromises = [
      db.collection('temperature_readings').add({ ...readingBase, value: 22.5 }),
      db.collection('humidity_readings').add({ ...readingBase, value: 65.0 }),
      db.collection('co2_readings').add({ ...readingBase, value: 400 }),
      db.collection('lidar_readings').add({ ...readingBase, value: 151.0 }),
      db.collection('outdoor_temp_readings').add({ ...readingBase, value: 18.0 })
    ];
    
    await Promise.all(readingPromises);
    console.log('✅ Individual sensor readings created');

    const summary = {
      success: true,
      message: 'Demo setup completed successfully!',
      data: {
        farmId: FARM_ID,
        deviceId: DEVICE_ID,
        usersWithAccess: TEST_USERS.length,
        collectionsCreated: [
          'farms',
          'devices', 
          'userFarms',
          'farmMembers',
          'farmDevices',
          'sensorData',
          'temperature_readings',
          'humidity_readings',
          'co2_readings',
          'lidar_readings',
          'outdoor_temp_readings'
        ]
      }
    };

    console.log('🎉 Demo setup completed successfully!');
    console.log('✅ Ready for ESP32 testing!');

    res.status(200).json(summary);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Demo setup failed',
      message: error.message,
      details: error.toString()
    });
  }
});
