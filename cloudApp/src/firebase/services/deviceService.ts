import { db } from '../config';
import { 
  collection, doc, setDoc, getDoc, 
  getDocs, query, where, updateDoc, deleteDoc 
} from 'firebase/firestore';

// Types
interface Device {
  device_id: string;
  name: string;
  registered_farm: string;
  type: string;
  is_active: boolean;
  low_battery: boolean;
  user_id: string;
}

// Add a new device or update an existing one
export const addDevice = async (deviceData: Device) => {
  try {
    const deviceRef = doc(db, 'devices', deviceData.device_id);
    await setDoc(deviceRef, {
      name: deviceData.name,
      registeredFarm: deviceData.registered_farm,
      type: deviceData.type,
      createdAt: new Date(),
      isActive: deviceData.is_active,
      lowBattery: deviceData.low_battery,
      userId: deviceData.user_id
    });
    return deviceData.device_id;
  } catch (error) {
    console.error("Error adding device:", error);
    throw error;
  }
};

// Get a device by ID
export const getDevice = async (deviceId: string) => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    const deviceSnapshot = await getDoc(deviceRef);
    
    if (deviceSnapshot.exists()) {
      return { id: deviceSnapshot.id, ...deviceSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting device:", error);
    throw error;
  }
};

// Get all devices for a user
export const getUserDevices = async (userId: string) => {
  try {
    const devicesQuery = query(
      collection(db, 'devices'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(devicesQuery);
    const devices: any[] = [];
    
    querySnapshot.forEach((doc) => {
      devices.push({ id: doc.id, ...doc.data() });
    });
    
    return devices;
  } catch (error) {
    console.error("Error getting user devices:", error);
    throw error;
  }
};

// Update device
export const updateDevice = async (deviceId: string, deviceData: Partial<Device>) => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    
    // Convert snake_case to camelCase for Firestore
    const firestoreData: Record<string, any> = {};
    if (deviceData.name) firestoreData.name = deviceData.name;
    if (deviceData.registered_farm) firestoreData.registeredFarm = deviceData.registered_farm;
    if (deviceData.type) firestoreData.type = deviceData.type;
    if (deviceData.is_active !== undefined) firestoreData.isActive = deviceData.is_active;
    if (deviceData.low_battery !== undefined) firestoreData.lowBattery = deviceData.low_battery;
    
    await updateDoc(deviceRef, firestoreData);
    return deviceId;
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
};

// Delete device
export const deleteDevice = async (deviceId: string) => {
  try {
    await deleteDoc(doc(db, 'devices', deviceId));
    return true;
  } catch (error) {
    console.error("Error deleting device:", error);
    throw error;
  }
};