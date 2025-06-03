// Test script to send realistic ESP32 data for real-time testing
const https = require('https');

const FIREBASE_URL = 'https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData';
const DEMO_DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';

function uploadData(testData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(FIREBASE_URL, options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function uploadTestData() {
  console.log('🔄 Uploading current sensor data for real-time testing...');
  console.log('======================================================');

  // Create current realistic data
  const currentTime = Date.now();
  const testData = {
    deviceId: DEMO_DEVICE_ID,
    timestamp: currentTime,
    temperature: 22.8,  // Realistic indoor temperature
    humidity: 58.3,     // Good humidity level
    co2: 485,          // Normal CO2 level
    distance1: 142,     // Distance sensor 1
    distance2: 138,     // Distance sensor 2  
    distance_avg: 140,  // Average distance (grain level)
    outdoor_temperature: 16.2, // Outdoor temp
    wifi_rssi: -42,
    deviceName: "Demo Sensor",
    farmName: "My Test Farm",
    sensorMode: 1,
    batteryLevel: 87,
    macAddress: "AA:BB:CC:DD:EE:FF",
    uptime: Date.now() / 1000,
    isConnected: true
  };

  try {
    console.log('📊 Uploading data:', {
      timestamp: new Date(currentTime).toLocaleString(),
      temperature: testData.temperature + '°C',
      humidity: testData.humidity + '%', 
      co2: testData.co2 + ' ppm',
      distance_avg: testData.distance_avg + ' cm',
      outdoor_temperature: testData.outdoor_temperature + '°C'
    });

    const result = await uploadData(testData);
    console.log('✅ Upload successful:', result.data);
    
    // Calculate fill percentage for verification
    const fillPercent = Math.max(0, Math.min(100, 100 - (testData.distance_avg * 100 / 700)));
    console.log(`📦 Calculated Fill Level: ${fillPercent.toFixed(1)}%`);
    
    console.log('\n🌐 Next Steps:');
    console.log('1. Open the web app: https://grain-guard-dashboard.netlify.app');
    console.log('2. Navigate to the Demo Device detail page');
    console.log('3. Check if the Silo Card and Sensor Stats show updated values');
    console.log('4. Verify the historical charts have new data points');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

// Run the test
uploadTestData();
