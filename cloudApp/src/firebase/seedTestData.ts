import { db } from './config';
import { 
  collection, doc, setDoc, addDoc, Timestamp, query, where, getDocs, deleteDoc
} from 'firebase/firestore';
import { addDeviceToFarm } from './services/farmService';

// Function to generate random number within a range
const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Function to generate a random crop type
const getRandomCrop = () => {
  const crops = ['Wheat', 'Corn', 'Soybean', 'Rice', 'Barley', 'Oats'];
  return crops[Math.floor(Math.random() * crops.length)];
};

// Generate test data
export const seedTestData = async () => {
  try {
    console.log('Starting to seed test data...');
    
    // Create a test farm
    const farmId = 'farm-test-1';
    
    // First, clean up any existing device associations for this farm
    console.log('Cleaning up existing device associations...');
    const existingMemberships = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', farmId)
    );
    
    const membershipSnapshot = await getDocs(existingMemberships);
    const deletePromises = membershipSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${membershipSnapshot.size} existing device associations`);
    
    // Now create/update the farm
    await setDoc(doc(db, 'farms', farmId), {
      name: 'Test Farm',
      description: 'A test farm with sample devices and readings',
      userId: 'test-user-1',
      createdAt: Timestamp.now()
    });
    console.log('Created test farm');
    
    // Create 6 test devices
    const deviceIds = [];
    const binTypes = ['Wheat', 'Corn', 'Soybean', 'Rice', 'Barley', 'Oats'];
    
    for (let i = 0; i < 6; i++) {
      const deviceId = `device-test-${i + 1}`;
      deviceIds.push(deviceId);
      
      await setDoc(doc(db, 'devices', deviceId), {
        name: `Test Device ${i + 1}`,
        registeredFarm: farmId,
        binType: binTypes[i],
        type: binTypes[i],  // Use the crop type as the device type for better UI display
        createdAt: Timestamp.now(),
        isActive: Math.random() > 0.2,  // 80% chance of being active
        lowBattery: Math.random() > 0.7,  // 30% chance of low battery
        userId: 'test-user-1'
      });
      
      // Create a fresh device-farm association
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
          value: getRandomNumber(40, 80)
        });
        
        // CO2 readings (350-2000 ppm)
        await addDoc(collection(db, 'co2_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(350, 2000)
        });
        
        // Temperature readings (15-35 °C)
        await addDoc(collection(db, 'temperature_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(15, 35)
        });
        
        // LiDAR readings (10-200 cm)
        await addDoc(collection(db, 'lidar_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(10, 200)
        });
        
        // Outdoor temperature readings (10-30 °C)
        await addDoc(collection(db, 'outdoor_temp_readings'), {
          deviceId: deviceId,
          timestamp: Timestamp.fromDate(timestamp),
          value: getRandomNumber(10, 30)
        });
        
        recordsCreated += 5; // 5 reading types per iteration
      }
      
      // Create a test alert for each device
      await addDoc(collection(db, 'alerts'), {
        deviceId: deviceId,
        type: Math.random() > 0.5 ? 'High Temperature' : 'High Humidity',
        message: 'This is a test alert',
        createdAt: Timestamp.now(),
        isResolved: Math.random() > 0.7 // 30% chance of being resolved
      });
      recordsCreated += 1;
    }
    
    console.log(`Created ${recordsCreated} test readings`);
    console.log('Test data seeding complete!');
    return true;
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
};