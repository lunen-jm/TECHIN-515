// Simple script to check what data exists in Firebase
import { db } from './src/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

const checkFirebaseData = async () => {
  try {
    console.log('Checking Firebase data...');
    
    // Check devices
    const devicesSnapshot = await getDocs(query(collection(db, 'devices'), limit(10)));
    console.log('Devices found:', devicesSnapshot.size);
    devicesSnapshot.forEach(doc => {
      console.log('Device:', doc.id, doc.data());
    });
    
    // Check temperature readings
    const tempSnapshot = await getDocs(query(collection(db, 'temperature_readings'), limit(5)));
    console.log('Temperature readings found:', tempSnapshot.size);
    tempSnapshot.forEach(doc => {
      console.log('Temp reading:', doc.id, doc.data());
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
};

checkFirebaseData();
