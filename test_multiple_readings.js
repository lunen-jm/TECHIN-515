// Test script to simulate multiple ESP32 sensor readings with varying data
const https = require('https');

const FIREBASE_URL = 'https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData';
const DEMO_DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';

// Function to generate realistic sensor data with some variation
function generateSensorData(baseTimestamp, index) {
  return {
    deviceId: DEMO_DEVICE_ID,
    timestamp: baseTimestamp + (index * 60000), // 1 minute intervals
    temperature: 22 + Math.random() * 4, // 22-26°C
    humidity: 60 + Math.random() * 20, // 60-80%
    co2: 400 + Math.random() * 50, // 400-450 ppm
    distance1: 145 + Math.random() * 10, // 145-155 cm
    distance2: 143 + Math.random() * 10, // 143-153 cm
    distance_avg: 144 + Math.random() * 10, // 144-154 cm
    outdoor_temperature: 15 + Math.random() * 10, // 15-25°C
    wifi_rssi: -40 - Math.random() * 20, // -40 to -60 dBm
    deviceName: "Demo Sensor",
    farmName: "My Test Farm",
    sensorMode: 1,
    batteryLevel: 80 + Math.random() * 20, // 80-100%
    macAddress: "AA:BB:CC:DD:EE:FF",
    uptime: 3600 + (index * 60), // Increasing uptime
    isConnected: true
  };
}

// Function to send a single reading
function sendReading(data, index, total) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(FIREBASE_URL, options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Reading ${index + 1}/${total} - Status: ${res.statusCode} - Temp: ${data.temperature.toFixed(1)}°C, Humidity: ${data.humidity.toFixed(1)}%, Distance: ${data.distance_avg.toFixed(1)}cm`);
        if (res.statusCode === 200) {
          resolve(responseBody);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main function to send multiple readings
async function sendMultipleReadings() {
  console.log('🧪 Testing Multiple ESP32 Sensor Readings');
  console.log('==========================================');
  console.log('📡 Target URL:', FIREBASE_URL);
  console.log('📱 Device ID:', DEMO_DEVICE_ID);
  
  const baseTimestamp = Date.now() - (5 * 60000); // Start 5 minutes ago
  const numReadings = 6; // Send 6 readings with 1-minute intervals
  
  console.log(`🚀 Sending ${numReadings} sensor readings...`);
  
  for (let i = 0; i < numReadings; i++) {
    try {
      const sensorData = generateSensorData(baseTimestamp, i);
      await sendReading(sensorData, i, numReadings);
      
      // Small delay between requests
      if (i < numReadings - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Error sending reading ${i + 1}:`, error.message);
    }
  }
  
  console.log('\n✅ Multiple readings test completed!');
  console.log('🔍 Check the web app dashboard to see the sensor data and charts');
  console.log('📈 You should now see:');
  console.log('   - Recent readings in the device silo card');
  console.log('   - Updated sensor stats');
  console.log('   - Data points in the history charts');
}

// Run the test
sendMultipleReadings().catch(console.error);
