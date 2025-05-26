import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const seedSensorData = async (deviceId: string = 'test-device', userId: string = 'test-user') => {
  console.log('🌱 Starting sensor data seeding...');
  
  const now = new Date();
  const hoursToGenerate = 48; // Generate 48 hours of data
  
  try {
    // Generate temperature data (20-35°C)
    console.log('📊 Seeding temperature data...');
    for (let i = hoursToGenerate - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseTemp = 25 + Math.sin(i / 12) * 5; // Daily temperature cycle
      const value = baseTemp + (Math.random() - 0.5) * 4; // Add some noise
      
      await addDoc(collection(db, 'temperature_readings'), {
        deviceId,
        value: Math.round(value * 10) / 10,
        timestamp: Timestamp.fromDate(timestamp),
        userId
      });
    }
    
    // Generate humidity data (40-80%)
    console.log('💧 Seeding humidity data...');
    for (let i = hoursToGenerate - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseHumidity = 60 + Math.sin((i + 6) / 12) * 15; // Inverse of temperature cycle
      const value = baseHumidity + (Math.random() - 0.5) * 10;
      
      await addDoc(collection(db, 'humidity_readings'), {
        deviceId,
        value: Math.max(20, Math.min(90, Math.round(value * 10) / 10)), // Clamp between 20-90%
        timestamp: Timestamp.fromDate(timestamp),
        userId
      });
    }
    
    // Generate CO2 data (400-1200 ppm)
    console.log('🫁 Seeding CO2 data...');
    for (let i = hoursToGenerate - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseCO2 = 600 + Math.sin(i / 8) * 200; // Vary over time
      const value = baseCO2 + (Math.random() - 0.5) * 100;
      
      await addDoc(collection(db, 'co2_readings'), {
        deviceId,
        value: Math.max(350, Math.min(1500, Math.round(value))), // Clamp between 350-1500 ppm
        timestamp: Timestamp.fromDate(timestamp),
        userId
      });
    }
    
    // Generate lidar/fill level data (50-300 cm)
    console.log('📏 Seeding lidar data...');
    let currentLevel = 150; // Start at 150cm
    for (let i = hoursToGenerate - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      // Simulate grain being consumed slowly
      currentLevel += (Math.random() - 0.3) * 2; // Slight downward trend
      currentLevel = Math.max(50, Math.min(300, currentLevel)); // Keep in bounds
      
      await addDoc(collection(db, 'lidar_readings'), {
        deviceId,
        value: Math.round(currentLevel * 10) / 10,
        timestamp: Timestamp.fromDate(timestamp),
        userId
      });
    }
    
    // Generate outdoor temperature data (5-25°C)
    console.log('🌡️ Seeding outdoor temperature data...');
    for (let i = hoursToGenerate - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseOutdoorTemp = 15 + Math.sin(i / 12) * 8; // Daily cycle
      const value = baseOutdoorTemp + (Math.random() - 0.5) * 6;
      
      await addDoc(collection(db, 'outdoor_temp_readings'), {
        deviceId,
        value: Math.round(value * 10) / 10,
        timestamp: Timestamp.fromDate(timestamp),
        userId
      });
    }
    
    console.log('✅ Sensor data seeding completed successfully!');
    console.log(`📈 Generated ${hoursToGenerate} readings for each sensor type`);
    console.log(`🏷️ Device ID: ${deviceId}`);
    
    return {
      success: true,
      message: `Successfully seeded ${hoursToGenerate * 5} sensor readings`,
      deviceId,
      hoursGenerated: hoursToGenerate
    };
    
  } catch (error) {
    console.error('❌ Error seeding sensor data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Seed data for multiple devices
export const seedMultipleDevices = async (deviceIds: string[], userId: string = 'test-user') => {
  console.log(`🌱 Seeding data for ${deviceIds.length} devices...`);
  
  const results = [];
  for (const deviceId of deviceIds) {
    console.log(`\n📱 Seeding device: ${deviceId}`);
    const result = await seedSensorData(deviceId, userId);
    results.push({ deviceId, ...result });
  }
  
  return results;
};
