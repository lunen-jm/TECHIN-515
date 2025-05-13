import { db } from '../config';
import { 
  collection, addDoc,
  getDocs, query, where, orderBy, limit
} from 'firebase/firestore';

// Types for each reading
interface BaseReading {
  device_id: string;
  timestamp?: Date;
}

interface HumidityReading extends BaseReading {
  humidity_value: number;
}

interface CO2Reading extends BaseReading {
  co2_value: number;
}

interface TemperatureReading extends BaseReading {
  temperature_value: number;
}

interface LidarReading extends BaseReading {
  distance_value: number;
}

interface OutdoorTempReading extends BaseReading {
  outdoor_temp_value: number;
}

// Humidity readings
export const addHumidityReading = async (readingData: HumidityReading) => {
  try {
    const result = await addDoc(collection(db, 'humidity_readings'), {
      deviceId: readingData.device_id,
      timestamp: readingData.timestamp || new Date(),
      value: readingData.humidity_value
    });
    return result.id;
  } catch (error) {
    console.error("Error adding humidity reading:", error);
    throw error;
  }
};

export const getHumidityReadings = async (deviceId: string, limit_count = 100) => {
  try {
    const readingsQuery = query(
      collection(db, 'humidity_readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(readingsQuery);
    const readings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() });
    });
    
    return readings;
  } catch (error) {
    console.error("Error getting humidity readings:", error);
    throw error;
  }
};

// CO2 readings
export const addCO2Reading = async (readingData: CO2Reading) => {
  try {
    const result = await addDoc(collection(db, 'co2_readings'), {
      deviceId: readingData.device_id,
      timestamp: readingData.timestamp || new Date(),
      value: readingData.co2_value
    });
    return result.id;
  } catch (error) {
    console.error("Error adding CO2 reading:", error);
    throw error;
  }
};

export const getCO2Readings = async (deviceId: string, limit_count = 100) => {
  try {
    const readingsQuery = query(
      collection(db, 'co2_readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(readingsQuery);
    const readings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() });
    });
    
    return readings;
  } catch (error) {
    console.error("Error getting CO2 readings:", error);
    throw error;
  }
};

// Temperature readings
export const addTemperatureReading = async (readingData: TemperatureReading) => {
  try {
    const result = await addDoc(collection(db, 'temperature_readings'), {
      deviceId: readingData.device_id,
      timestamp: readingData.timestamp || new Date(),
      value: readingData.temperature_value
    });
    return result.id;
  } catch (error) {
    console.error("Error adding temperature reading:", error);
    throw error;
  }
};

export const getTemperatureReadings = async (deviceId: string, limit_count = 100) => {
  try {
    const readingsQuery = query(
      collection(db, 'temperature_readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(readingsQuery);
    const readings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() });
    });
    
    return readings;
  } catch (error) {
    console.error("Error getting temperature readings:", error);
    throw error;
  }
};

// Lidar readings
export const addLidarReading = async (readingData: LidarReading) => {
  try {
    const result = await addDoc(collection(db, 'lidar_readings'), {
      deviceId: readingData.device_id,
      timestamp: readingData.timestamp || new Date(),
      value: readingData.distance_value
    });
    return result.id;
  } catch (error) {
    console.error("Error adding lidar reading:", error);
    throw error;
  }
};

export const getLidarReadings = async (deviceId: string, limit_count = 100) => {
  try {
    const readingsQuery = query(
      collection(db, 'lidar_readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(readingsQuery);
    const readings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() });
    });
    
    return readings;
  } catch (error) {
    console.error("Error getting lidar readings:", error);
    throw error;
  }
};

// Outdoor temperature readings
export const addOutdoorTempReading = async (readingData: OutdoorTempReading) => {
  try {
    const result = await addDoc(collection(db, 'outdoor_temp_readings'), {
      deviceId: readingData.device_id,
      timestamp: readingData.timestamp || new Date(),
      value: readingData.outdoor_temp_value
    });
    return result.id;
  } catch (error) {
    console.error("Error adding outdoor temperature reading:", error);
    throw error;
  }
};

export const getOutdoorTempReadings = async (deviceId: string, limit_count = 100) => {
  try {
    const readingsQuery = query(
      collection(db, 'outdoor_temp_readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(readingsQuery);
    const readings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() });
    });
    
    return readings;
  } catch (error) {
    console.error("Error getting outdoor temperature readings:", error);
    throw error;
  }
};