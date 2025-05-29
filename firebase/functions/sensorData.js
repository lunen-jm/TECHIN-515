const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already done)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function for receiving sensor data from ESP32 devices
 * Called by ESP32 devices to upload sensor readings
 */
exports.sensorData = functions.https.onRequest(async (req, res) => {
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
    const {
      deviceId,
      timestamp,
      temperature,
      humidity,
      co2,
      distance1,
      distance2,
      distance_avg,
      outdoor_temperature,
      wifi_rssi
    } = req.body;

    // Validate required fields
    if (!deviceId || !timestamp) {
      res.status(400).json({ 
        error: 'Missing required fields: deviceId and timestamp' 
      });
      return;
    }

    console.log(`Sensor data received from device: ${deviceId}`);

    // Verify device exists and is registered
    const deviceDoc = await db.collection('devices').doc(deviceId).get();
    
    if (!deviceDoc.exists) {
      console.log(`Unknown device: ${deviceId}`);
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const deviceData = deviceDoc.data();
    const farmId = deviceData.farmId;

    // Prepare sensor data document
    const sensorReading = {
      deviceId: deviceId,
      farmId: farmId,
      timestamp: admin.firestore.Timestamp.fromMillis(timestamp),
      receivedAt: admin.firestore.Timestamp.now(),
      data: {
        temperature: temperature || null,
        humidity: humidity || null,
        co2: co2 || null,
        distance1: distance1 || null,
        distance2: distance2 || null,
        distance_avg: distance_avg || null,
        outdoor_temperature: outdoor_temperature || null,
        wifi_rssi: wifi_rssi || null
      }
    };

    // Calculate grain level percentage if distance data is available
    if (distance_avg !== null && distance_avg !== undefined) {
      // Assuming 700cm is empty, 0cm is full
      const fillPercent = Math.max(0, Math.min(100, 100 - (distance_avg * 100 / 700)));
      sensorReading.data.grain_level_percent = fillPercent;
    }    // Store individual sensor readings in separate collections
    const batch = db.batch();
    const readingTimestamp = sensorReading.timestamp;
    
    // Base reading data for all collections
    const baseReading = {
      deviceId: deviceId,
      farmId: farmId,
      timestamp: readingTimestamp,
      receivedAt: sensorReading.receivedAt
    };

    // Temperature reading
    if (temperature !== null && temperature !== undefined) {
      const tempRef = db.collection('temperature_readings').doc();
      batch.set(tempRef, {
        ...baseReading,
        value: temperature
      });
    }

    // Humidity reading
    if (humidity !== null && humidity !== undefined) {
      const humidityRef = db.collection('humidity_readings').doc();
      batch.set(humidityRef, {
        ...baseReading,
        value: humidity
      });
    }

    // CO2 reading
    if (co2 !== null && co2 !== undefined) {
      const co2Ref = db.collection('co2_readings').doc();
      batch.set(co2Ref, {
        ...baseReading,
        value: co2
      });
    }    // LIDAR/Distance readings
    if (distance_avg !== null && distance_avg !== undefined) {
      const lidarRef = db.collection('lidar_readings').doc();
      batch.set(lidarRef, {
        ...baseReading,
        value: distance_avg
      });
    }

    // Outdoor temperature reading
    if (outdoor_temperature !== null && outdoor_temperature !== undefined) {
      const outdoorTempRef = db.collection('outdoor_temp_readings').doc();
      batch.set(outdoorTempRef, {
        ...baseReading,
        value: outdoor_temperature
      });
    }

    // Store aggregated reading in sensorData collection for device status
    const sensorDataRef = db.collection('sensorData').doc();
    batch.set(sensorDataRef, sensorReading);

    // Commit all writes atomically
    await batch.commit();

    // Update device's last seen timestamp and latest data
    await db.collection('devices').doc(deviceId).update({
      lastSeen: admin.firestore.Timestamp.now(),
      lastData: sensorReading.data,
      status: 'online'
    });

    // Update farm's latest sensor reading summary
    await updateFarmSummary(farmId, deviceId, sensorReading.data);

    console.log(`Sensor data stored successfully for device: ${deviceId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Sensor data received successfully',
      deviceId: deviceId,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Update farm summary with latest sensor data
 */
async function updateFarmSummary(farmId, deviceId, sensorData) {
  try {
    const farmRef = db.collection('farms').doc(farmId);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      console.log(`Farm not found: ${farmId}`);
      return;
    }

    // Update farm's device summary
    const updateData = {
      [`deviceSummary.${deviceId}`]: {
        lastUpdate: admin.firestore.Timestamp.now(),
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        co2: sensorData.co2,
        grain_level_percent: sensorData.grain_level_percent,
        status: 'online'
      }
    };

    await farmRef.update(updateData);
    console.log(`Farm summary updated for device: ${deviceId}`);

  } catch (error) {
    console.error('Error updating farm summary:', error);
  }
}
