import { db } from '../firebase/config';
import { 
  collection, doc, setDoc, addDoc, Timestamp, query, where, getDocs, deleteDoc
} from 'firebase/firestore';
import { createFarmWithMembership } from '../firebase/services/farmService';

// Function to generate random number within a range
const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Create test farm and devices for a specific user
export const createTestFarmForUser = async (userId: string) => {
  try {
    console.log('Creating test farm for user:', userId);
    
    // First, clean up any existing device associations for this farm
    console.log('Cleaning up existing device associations...');
    const testFarmId = `test-farm-${userId}`;
    const existingMemberships = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', testFarmId)
    );
    
    const membershipSnapshot = await getDocs(existingMemberships);
    const deletePromises = membershipSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${membershipSnapshot.size} existing device associations`);
      // Create the test farm using multi-user system
    const farmData = {
      name: 'My Test Farm',
      description: 'A sample farm with test devices and sensor readings',
      location: 'Test Location',
      contactPhone: '123-456-7890',
      contactEmail: 'test@example.com',
      size: '100 acres',
      farmType: 'Grain Farm',
      user_id: userId
    };
    
    const farmId = await createFarmWithMembership(farmData);
    console.log('Created test farm with multi-user support');
    
    // Create 6 test devices
    const deviceIds = [];
    const binTypes = ['Wheat', 'Corn', 'Soybean', 'Rice', 'Barley', 'Oats'];
    
    for (let i = 0; i < 6; i++) {
      const deviceId = `test-device-${userId}-${i + 1}`;
      deviceIds.push(deviceId);
      
      await setDoc(doc(db, 'devices', deviceId), {
        name: `${binTypes[i]} Sensor ${i + 1}`,
        registeredFarm: farmId,
        binType: binTypes[i],
        type: binTypes[i],
        createdAt: Timestamp.now(),
        isActive: Math.random() > 0.2,  // 80% chance of being active
        lowBattery: Math.random() > 0.7,  // 30% chance of low battery
        userId: userId
      });
      
      // Create device-farm association
      await addDoc(collection(db, 'farmDevices'), {
        farmId: farmId,
        deviceId: deviceId,
        createdAt: Timestamp.now()
      });
    }
    console.log('Created 6 test devices');
    
    // Generate 30 readings for each device and each sensor type
    const now = new Date();
    let recordsCreated = 0;
    
    for (const deviceId of deviceIds) {
      // For each device, create 30 readings of each type
      for (let j = 0; j < 30; j++) {
        const timestamp = new Date(now.getTime() - (j * 1000)); // 1 second apart
        
        // Humidity readings (40-80%)
        await addDoc(collection(db, 'humidity_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(40, 80),
          userId: userId
        });
        
        // CO2 readings (350-2000 ppm)
        await addDoc(collection(db, 'co2_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(350, 2000),
          userId: userId
        });
        
        // Temperature readings (15-35 °C)
        await addDoc(collection(db, 'temperature_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(15, 35),
          userId: userId
        });
        
        // LiDAR readings (10-200 cm)
        await addDoc(collection(db, 'lidar_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(10, 200),
          userId: userId
        });
        
        // Outdoor temperature readings (10-30 °C)
        await addDoc(collection(db, 'outdoor_temp_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(10, 30),
          userId: userId
        });
        
        recordsCreated += 5; // 5 reading types per iteration
      }
      
      // Create a test alert for each device
      await addDoc(collection(db, 'alerts'), {
        deviceId: deviceId,
        type: Math.random() > 0.5 ? 'High Temperature' : 'High Humidity',
        message: 'This is a test alert for your device',
        createdAt: Timestamp.now(),
        isResolved: Math.random() > 0.7, // 30% chance of being resolved
        userId: userId
      });
      recordsCreated += 1;
    }
    
    console.log(`Created ${recordsCreated} test records`);
    console.log('Test farm creation complete!');
    
    return {
      success: true,
      farmId,
      deviceIds,
      recordsCreated,
      message: `Successfully created test farm "${farmId}" with ${deviceIds.length} devices and ${recordsCreated} sensor readings`
    };
    
  } catch (error) {
    console.error('Error creating test farm:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
