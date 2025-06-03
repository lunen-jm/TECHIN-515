const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function addDemoData() {
  console.log('🚀 Adding Demo Farm and Device to Firebase Firestore');
  console.log('=' + '='.repeat(50));

  try {
    // Add demo farm
    console.log('📋 Adding demo farm...');
    const farmData = {
      farmId: 'demo-farm-001',
      farmName: 'My Test Farm',
      location: 'Demo Location',
      description: 'Demo farm for testing ESP32 hardcoded display',
      createdAt: admin.firestore.Timestamp.now(),
      deviceCount: 1,
      status: 'active',
      deviceSummary: {}
    };

    await db.collection('farms').doc('demo-farm-001').set(farmData);
    console.log('✅ Demo farm added successfully');

    // Add demo device
    console.log('📱 Adding demo device...');
    const deviceData = {
      deviceId: 'demo-sensor-001',
      deviceName: 'Demo Sensor',
      farmId: 'demo-farm-001',
      deviceType: 'ESP32',
      sensorMode: 0,
      capabilities: {
        temperature: true,
        humidity: true,
        co2: true,
        distance: true,
        ble: true
      },
      macAddress: 'AA:BB:CC:DD:EE:FF',
      status: 'offline',
      registeredAt: admin.firestore.Timestamp.now(),
      lastSeen: admin.firestore.Timestamp.now(),
      lastData: null
    };

    await db.collection('devices').doc('demo-sensor-001').set(deviceData);
    console.log('✅ Demo device added successfully');

    console.log('');
    console.log('🎯 Demo data setup complete!');
    console.log('📤 The ESP32 hardcoded display should now be able to upload data to Firebase');
    console.log('🔍 Device ID: demo-sensor-001');
    console.log('🏪 Farm: My Test Farm');

  } catch (error) {
    console.error('❌ Error adding demo data:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

addDemoData();
