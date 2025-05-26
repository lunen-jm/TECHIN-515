// Quick test script to add sample sensor data
// This would be run in the browser console or as a test function

import { 
  addTemperatureReading, 
  addHumidityReading, 
  addCO2Reading, 
  addLidarReading, 
  addOutdoorTempReading 
} from '../firebase/services/readingsService';

export const addTestData = async () => {
  const deviceId = 'test-device-1';
  const now = new Date();
  
  console.log('Adding test sensor data for device:', deviceId);
  
  try {
    // Add a few readings for each sensor type
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // hourly intervals
      
      await addTemperatureReading({
        device_id: deviceId,
        temperature_value: 20 + Math.random() * 10,
        timestamp
      });
      
      await addHumidityReading({
        device_id: deviceId,
        humidity_value: 40 + Math.random() * 40,
        timestamp
      });
      
      await addCO2Reading({
        device_id: deviceId,
        co2_value: 400 + Math.random() * 800,
        timestamp
      });
      
      await addLidarReading({
        device_id: deviceId,
        distance_value: 50 + Math.random() * 150,
        timestamp
      });
      
      await addOutdoorTempReading({
        device_id: deviceId,
        outdoor_temp_value: 5 + Math.random() * 20,
        timestamp
      });
    }
    
    console.log('Test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
};
