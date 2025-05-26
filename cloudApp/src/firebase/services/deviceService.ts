import { db, functions } from '../config';
import { 
  collection, doc, /* setDoc, */ getDoc, 
  getDocs, query, where, updateDoc, /* deleteDoc, */
  orderBy, limit, Timestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

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
    const generateCode = httpsCallable(functions, 'generateRegistrationCode');
    const result = await generateCode(request);
    return result.data as RegistrationCodeResponse;
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