import { db, auth } from '../config';
import { 
  collection, doc, /* setDoc, */ getDoc, 
  getDocs, query, where, updateDoc, deleteDoc,
  orderBy, limit, Timestamp, onSnapshot
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

// New interfaces for WiFi provisioning
interface RegistrationCodeRequest {
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

interface RegistrationCodeResponse {
  registrationCode: string;
  expiresAt: any; // Firestore Timestamp
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
    // Get the current user's ID token for authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const idToken = await currentUser.getIdToken();
    
    // Make HTTP request to the Cloud Function
    const response = await fetch('https://us-central1-grainguard-22f5a.cloudfunctions.net/generateRegistrationCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result as RegistrationCodeResponse;
  } catch (error) {
    console.error('Error generating registration code:', error);
    throw new Error('Failed to generate registration code');
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
      where('expires_at', '>', Timestamp.now()),
      orderBy('expires_at', 'desc')
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
      revoked_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error revoking registration code:', error);
    throw new Error('Failed to revoke registration code');
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
      q = query(devicesCollection, where('registered_farm', '==', farmId));
    }
    
    const snapshot = await getDocs(q);
    const devices = snapshot.docs.map(doc => doc.data()) as Device[];
    
    const summary = {
      total: devices.length,
      online: devices.filter(d => d.is_active).length,
      offline: devices.filter(d => !d.is_active).length,
      lowBattery: devices.filter(d => d.low_battery).length,
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
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      device_id: doc.id,
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
      device_id: doc.id,
      ...doc.data()
    })) as Device[];
    
    const searchLower = searchTerm.toLowerCase();
    return devices.filter(device => 
      device.name.toLowerCase().includes(searchLower) ||
      device.device_id.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching devices:', error);
    throw new Error('Failed to search devices');
  }
};

/**
 * Get a single device by ID
 */
export const getDevice = async (deviceId: string): Promise<any> => {
  try {
    const deviceDoc = doc(db, 'devices', deviceId);
    const deviceSnapshot = await getDoc(deviceDoc);
    
    if (deviceSnapshot.exists()) {
      const data = deviceSnapshot.data();
      // Transform to match the UI interface format
      return {
        id: deviceSnapshot.id,
        name: data.name,
        type: data.type || data.binType || 'Unknown',
        isActive: data.isActive || data.is_active || false,
        lowBattery: data.lowBattery || data.low_battery || false,
        registeredFarm: data.registeredFarm || data.registered_farm || '',
        createdAt: data.createdAt || data.created_at || new Date(),
        userId: data.userId || data.user_id || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting device:', error);
    throw new Error('Failed to get device');
  }
};

/**
 * Real-time device status listener
 * Returns an unsubscribe function to stop listening
 */
export const subscribeToDeviceStatus = (
  deviceId: string, 
  callback: (device: any) => void
): (() => void) => {
  const deviceRef = doc(db, 'devices', deviceId);
  
  return onSnapshot(deviceRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const device = {
        id: doc.id,
        name: data.name,
        type: data.type || data.binType || 'Unknown',
        isActive: data.isActive || data.is_active || false,
        lowBattery: data.lowBattery || data.low_battery || false,
        registeredFarm: data.registeredFarm || data.registered_farm || '',
        createdAt: data.createdAt || data.created_at || new Date(),
        userId: data.userId || data.user_id || '',
        lastSeen: data.lastSeen || data.last_seen || null
      };
      callback(device);
    }
  }, (error) => {
    console.error('Error listening to device status:', error);
  });
};

/**
 * Real-time listener for all devices in a farm
 */
export const subscribeToFarmDevices = (
  farmId: string,
  callback: (devices: any[]) => void
): (() => void) => {
  const devicesQuery = query(
    collection(db, 'devices'),
    where('registered_farm', '==', farmId)
  );
  
  return onSnapshot(devicesQuery, (snapshot) => {
    const devices = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type || data.binType || 'Unknown',
        isActive: data.isActive || data.is_active || false,
        lowBattery: data.lowBattery || data.low_battery || false,
        registeredFarm: data.registeredFarm || data.registered_farm || '',
        createdAt: data.createdAt || data.created_at || new Date(),
        userId: data.userId || data.user_id || '',
        lastSeen: data.lastSeen || data.last_seen || null
      };
    });
    callback(devices);
  }, (error) => {
    console.error('Error listening to farm devices:', error);
  });
};

/**
 * Real-time listener for device count summary
 */
export const subscribeToDeviceStatusSummary = (
  farmId: string | null,
  callback: (summary: {total: number, online: number, offline: number, lowBattery: number}) => void
): (() => void) => {
  let devicesQuery;
  
  if (farmId) {
    devicesQuery = query(
      collection(db, 'devices'),
      where('registered_farm', '==', farmId)
    );
  } else {
    devicesQuery = collection(db, 'devices');
  }
  
  return onSnapshot(devicesQuery, (snapshot) => {
    const devices = snapshot.docs.map(doc => doc.data()) as Device[];
    
    const summary = {
      total: devices.length,
      online: devices.filter(d => d.is_active).length,
      offline: devices.filter(d => !d.is_active).length,
      lowBattery: devices.filter(d => d.low_battery).length,
    };
    
    callback(summary);
  }, (error) => {
    console.error('Error listening to device status summary:', error);
  });
};

/**
 * Update device configuration/settings
 */
export const updateDevice = async (deviceId: string, updates: Partial<any>): Promise<void> => {
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
 * Delete/deregister a device
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
 * Update device settings specifically
 */
export const updateDeviceSettings = async (
  deviceId: string, 
  settings: {
    readingInterval?: number;
    transmissionInterval?: number;
    sleepMode?: boolean;
    alertThresholds?: {
      temperature?: { min?: number; max?: number };
      humidity?: { min?: number; max?: number };
      co2?: { max?: number };
      batteryLevel?: { min?: number };
    };
  }
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
 * Update device calibration values
 */
export const updateDeviceCalibration = async (
  deviceId: string, 
  calibration: {
    temperature?: { offset?: number; scale?: number };
    humidity?: { offset?: number; scale?: number };
    co2?: { offset?: number; scale?: number };
    lidar?: { offset?: number; scale?: number };
  }
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
 * Bulk update multiple devices
 */
export const bulkUpdateDevices = async (
  deviceIds: string[], 
  updates: Partial<any>
): Promise<void> => {
  try {
    const updatePromises = deviceIds.map(deviceId => 
      updateDevice(deviceId, updates)
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error bulk updating devices:', error);
    throw new Error('Failed to bulk update devices');
  }
};

/**
 * Bulk delete multiple devices
 */
export const bulkDeleteDevices = async (deviceIds: string[]): Promise<void> => {
  try {
    const deletePromises = deviceIds.map(deviceId => deleteDevice(deviceId));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error bulk deleting devices:', error);
    throw new Error('Failed to bulk delete devices');
  }
};

/**
 * Get device diagnostics and troubleshooting info
 */
export const getDeviceDiagnostics = async (deviceId: string): Promise<any> => {
  try {
    const device = await getDevice(deviceId);
    if (!device) throw new Error('Device not found');

    // Get recent sensor readings to check for data flow
    const readingsQuery = query(
      collection(db, 'readings'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const readingsSnapshot = await getDocs(readingsQuery);
    const recentReadings = readingsSnapshot.docs.map(doc => doc.data());

    // Calculate diagnostic metrics
    const now = Date.now();
    const lastReading = recentReadings[0];
    const lastSeenTime = lastReading?.timestamp?.toMillis?.() || 0;
    const timeSinceLastReading = now - lastSeenTime;

    const diagnostics = {
      device,
      connectivity: {
        isOnline: device.isActive,
        lastSeen: device.lastSeen || lastReading?.timestamp,
        timeSinceLastReading: timeSinceLastReading,
        connectionStatus: timeSinceLastReading < 600000 ? 'Good' : // 10 minutes
                          timeSinceLastReading < 3600000 ? 'Fair' : // 1 hour
                          'Poor'
      },
      dataFlow: {
        recentReadingsCount: recentReadings.length,
        dataQuality: recentReadings.length > 5 ? 'Good' : 
                    recentReadings.length > 2 ? 'Fair' : 'Poor',
        hasTemperature: recentReadings.some(r => r.temperature !== undefined),
        hasHumidity: recentReadings.some(r => r.humidity !== undefined),
        hasCO2: recentReadings.some(r => r.co2 !== undefined),
        hasLidar: recentReadings.some(r => r.lidar !== undefined)
      },
      hardware: {
        batteryLevel: device.batteryLevel || 'Unknown',
        batteryStatus: device.lowBattery ? 'Low' : 'Good',
        firmwareVersion: device.firmwareVersion || 'Unknown'      },
      recommendations: [] as string[]
    };

    // Generate recommendations
    if (diagnostics.connectivity.connectionStatus === 'Poor') {
      diagnostics.recommendations.push('Check device power and WiFi connection');
    }
    if (diagnostics.hardware.batteryStatus === 'Low') {
      diagnostics.recommendations.push('Replace or recharge device battery');
    }
    if (diagnostics.dataFlow.dataQuality === 'Poor') {
      diagnostics.recommendations.push('Check sensor connections and calibration');
    }

    return diagnostics;
  } catch (error) {
    console.error('Error getting device diagnostics:', error);
    throw new Error('Failed to get device diagnostics');
  }
};