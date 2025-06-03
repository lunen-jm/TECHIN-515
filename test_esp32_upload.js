// Test script to simulate ESP32 data upload
const https = require('https');

// This is the Firebase Function URL for sensor data
const FIREBASE_URL = 'https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData';

// Use the demo device ID that we created
const DEMO_DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';

// Create test data similar to what ESP32 would send
const testData = {
  deviceId: DEMO_DEVICE_ID,
  timestamp: Date.now(), // Current timestamp
  temperature: 23.5,
  humidity: 65.2,
  co2: 420,
  distance1: 150,
  distance2: 148,
  distance_avg: 149,
  outdoor_temperature: 18.5,
  wifi_rssi: -45,
  deviceName: "Demo Sensor",
  farmName: "My Test Farm",
  sensorMode: 1,
  batteryLevel: 85,
  macAddress: "AA:BB:CC:DD:EE:FF",
  uptime: 3600,
  isConnected: true
};

console.log('🧪 Testing ESP32 Data Upload Simulation');
console.log('======================================');
console.log('📡 Target URL:', FIREBASE_URL);
console.log('📱 Device ID:', DEMO_DEVICE_ID);
console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

const postData = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n🚀 Sending HTTP POST request...');

const req = https.request(FIREBASE_URL, options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📡 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📨 Response Body:');
    console.log(data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Data upload simulation completed successfully');
      console.log('🔍 Check the web app dashboard to see if the data appears');
    } else {
      console.log('\n❌ FAILED! Upload simulation failed');
      console.log('🔍 Check the error details above');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error);
});

req.write(postData);
req.end();
