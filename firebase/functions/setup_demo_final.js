const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with explicit project configuration
console.log('🔥 Initializing Firebase Admin SDK...');

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'grainguard-22f5a',
    });
  }
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Demo farm and device IDs
const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
const DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';

// Test user UIDs from export
const TEST_USERS = [
  'auth0|66da9ccb9d3abcdf0d3deecc',
  'auth0|66da9d009d3abcdf0d3deed7',
  'auth0|66da9d229d3abcdf0d3deee2',
  'auth0|67142e2e15e1d76b0a1b6af9'
];

async function testConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Try to read a simple document
    const testRef = db.collection('test').doc('connection');
    await testRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    const testDoc = await testRef.get();
    
    if (testDoc.exists) {
      console.log('✅ Firebase connection successful');
      await testRef.delete(); // Clean up test document
      return true;
    } else {
      console.log('❌ Firebase connection test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    return false;
  }
}

async function setupDemoAccess() {
  try {
    console.log('🚀 Starting demo farm setup with Firebase Admin...');
    
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Firebase connection failed');
    }
    
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
    
    // Create userFarms collection entries (for ESP32 access checking)
    for (const userId of TEST_USERS) {
      try {
        const userFarmData = {
          userId: userId,
          farmId: FARM_ID,
          farmName: 'My Test Farm',
          role: 'owner',
          permissions: ['read', 'write', 'admin'],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isDemo: true
        };
        
        await db.collection('userFarms').doc(`${userId}_${FARM_ID}`).set(userFarmData, { merge: true });
        console.log(`✅ userFarms access granted for: ${userId.substring(0, 20)}...`);
      } catch (error) {
        console.log(`⚠️ Failed to grant userFarms access for ${userId}: ${error.message}`);
      }
    }

    // Create farmMembers collection entries (for web app access)
    for (const userId of TEST_USERS) {
      try {
        const memberData = {
          userId: userId,
          farmId: FARM_ID,
          role: 'owner',
          addedAt: admin.firestore.FieldValue.serverTimestamp(),
          addedBy: 'demo_setup',
          isDemo: true
        };
        
        await db.collection('farmMembers').doc(`${userId}_${FARM_ID}`).set(memberData, { merge: true });
        console.log(`✅ farmMembers access granted for: ${userId.substring(0, 20)}...`);
      } catch (error) {
        console.log(`⚠️ Failed to grant farmMembers access for ${userId}: ${error.message}`);
      }
    }

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

    // Create readings in parallel for speed
    const readingPromises = [
      db.collection('temperature_readings').add({ ...readingBase, value: 22.5 }),
      db.collection('humidity_readings').add({ ...readingBase, value: 65.0 }),
      db.collection('co2_readings').add({ ...readingBase, value: 400 }),
      db.collection('lidar_readings').add({ ...readingBase, value: 151.0 }),
      db.collection('outdoor_temp_readings').add({ ...readingBase, value: 18.0 })
    ];
    
    await Promise.all(readingPromises);
    console.log('✅ Individual sensor readings created');

    console.log('\n🎉 Demo setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Farm ID: ${FARM_ID}`);
    console.log(`   Device ID: ${DEVICE_ID}`);
    console.log(`   Test users with access: ${TEST_USERS.length}`);
    console.log(`   Collections created: farms, devices, userFarms, farmMembers, farmDevices, sensorData + 5 reading types`);
    console.log('\n✅ Ready for ESP32 testing!');
    console.log('\n🚀 Your ESP32 with display_hard_code.ino should now be able to upload data successfully.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDemoAccess()
    .then(() => {
      console.log('\n✨ Setup complete! You can now test the ESP32 hardcoded display.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDemoAccess };
