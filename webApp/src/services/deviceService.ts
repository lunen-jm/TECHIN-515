import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';

export interface Device {
  id: string;
  name: string;
  type: string;
  farmId: string;
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  };
  capabilities: string[];
  status: 'online' | 'offline' | 'error';
  batteryLevel: number;
  lastSeen: Timestamp;
  createdAt: Timestamp;
  registeredBy: string;
  firmwareVersion: string;
  settings: {
    readingInterval: number;
    transmissionInterval: number;
    sleepMode: boolean;
  };
  calibration: {
    temperature: { offset: number; scale: number };
    humidity: { offset: number; scale: number };
    soilMoisture: { min: number; max: number };
  };
}

export interface RegistrationCodeRequest {
  farmId: string;
  deviceName: string;
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  };
}

export interface RegistrationCodeResponse {
  registrationCode: string;
  expiresAt: Timestamp;
  deviceName: string;
  farmName: string;
}

/**
 * Generate a registration code for device provisioning
 */
export const generateRegistrationCode = async (
  request: RegistrationCodeRequest
): Promise<RegistrationCodeResponse> => {
  try {
    const generateCode = httpsCallable(functions, 'generateRegistrationCode');
    const result = await generateCode(request);
    return result.data as RegistrationCodeResponse;
  } catch (error) {
    console.error('Error generating registration code:', error);
    throw new Error('Failed to generate registration code');
  }
};

/**
 * Get all devices for the current user's farms
 */
export const getDevices = async (): Promise<Device[]> => {
  try {
    const devicesCollection = collection(db, 'devices');
    const snapshot = await getDocs(query(devicesCollection, orderBy('createdAt', 'desc')));
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Device[];
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw new Error('Failed to fetch devices');
  }
};

/**
 * Get devices for a specific farm
 */
export const getDevicesByFarm = async (farmId: string): Promise<Device[]> => {
  try {
    const devicesCollection = collection(db, 'devices');
    const q = query(
      devicesCollection, 
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Device[];
  } catch (error) {
    console.error('Error fetching devices by farm:', error);
    throw new Error('Failed to fetch devices for farm');
  }
};

/**
 * Get a single device by ID
 */
export const getDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    const deviceDoc = await getDoc(doc(db, 'devices', deviceId));
    
    if (!deviceDoc.exists()) {
      return null;
    }
    
    return {
      id: deviceDoc.id,
      ...deviceDoc.data()
    } as Device;
  } catch (error) {
    console.error('Error fetching device:', error);
    throw new Error('Failed to fetch device');
  }
};

/**
 * Update device information
 */
export const updateDevice = async (deviceId: string, updates: Partial<Device>): Promise<void> => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await updateDoc(deviceRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating device:', error);
    throw new Error('Failed to update device');
  }
};

/**
 * Delete a device
 */
export const deleteDevice = async (deviceId: string): Promise<void> => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error('Error deleting device:', error);
    throw new Error('Failed to delete device');
  }
};

/**
 * Update device settings
 */
export const updateDeviceSettings = async (
  deviceId: string, 
  settings: Partial<Device['settings']>
): Promise<void> => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await updateDoc(deviceRef, {
      settings: settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating device settings:', error);
    throw new Error('Failed to update device settings');
  }
};

/**
 * Update device calibration
 */
export const updateDeviceCalibration = async (
  deviceId: string, 
  calibration: Partial<Device['calibration']>
): Promise<void> => {
  try {
    const deviceRef = doc(db, 'devices', deviceId);
    await updateDoc(deviceRef, {
      calibration: calibration,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating device calibration:', error);
    throw new Error('Failed to update device calibration');
  }
};

/**
 * Get device status summary for dashboard
 */
export const getDeviceStatusSummary = async (farmId?: string) => {
  try {
    const devicesCollection = collection(db, 'devices');
    let q = query(devicesCollection);
    
    if (farmId) {
      q = query(devicesCollection, where('farmId', '==', farmId));
    }
    
    const snapshot = await getDocs(q);
    const devices = snapshot.docs.map(doc => doc.data()) as Device[];
    
    const summary = {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      error: devices.filter(d => d.status === 'error').length,
      lowBattery: devices.filter(d => d.batteryLevel < 20).length,
      averageBattery: devices.length > 0 
        ? Math.round(devices.reduce((sum, d) => sum + d.batteryLevel, 0) / devices.length)
        : 0
    };
    
    return summary;
  } catch (error) {
    console.error('Error fetching device status summary:', error);
    throw new Error('Failed to fetch device status summary');
  }
};

/**
 * Get recently added devices
 */
export const getRecentDevices = async (limitCount: number = 5): Promise<Device[]> => {
  try {
    const devicesCollection = collection(db, 'devices');
    const q = query(
      devicesCollection, 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Device[];
  } catch (error) {
    console.error('Error fetching recent devices:', error);
    throw new Error('Failed to fetch recent devices');
  }
};

/**
 * Search devices by name or location
 */
export const searchDevices = async (searchTerm: string): Promise<Device[]> => {
  try {
    const devicesCollection = collection(db, 'devices');
    const snapshot = await getDocs(devicesCollection);
    
    const devices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Device[];
    
    const searchLower = searchTerm.toLowerCase();
    return devices.filter(device => 
      device.name.toLowerCase().includes(searchLower) ||
      device.location.name.toLowerCase().includes(searchLower) ||
      device.id.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching devices:', error);
    throw new Error('Failed to search devices');
  }
};

/**
 * Get active registration codes (for admin view)
 */
export const getActiveRegistrationCodes = async () => {
  try {
    const codesCollection = collection(db, 'registrationCodes');
    const q = query(
      codesCollection,
      where('used', '==', false),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching active registration codes:', error);
    throw new Error('Failed to fetch active registration codes');
  }
};

/**
 * Revoke a registration code
 */
export const revokeRegistrationCode = async (codeId: string): Promise<void> => {
  try {
    const codeRef = doc(db, 'registrationCodes', codeId);
    await updateDoc(codeRef, {
      used: true,
      revokedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error revoking registration code:', error);
    throw new Error('Failed to revoke registration code');
  }
};
