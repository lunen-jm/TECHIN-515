import { db } from '../config';
import { 
  collection, addDoc, doc, setDoc, getDoc, 
  getDocs, query, where, updateDoc, deleteDoc 
} from 'firebase/firestore';

// Types
interface Farm {
  farm_id?: string;
  name: string;
  description: string;
  user_id: string;
}

interface DeviceMembership {
  membership_id?: string;
  farm_id: string;
  device_id: string;
}

// Farm operations
export const createFarm = async (farmData: Farm) => {
  try {
    let farmRef;
    
    if (farmData.farm_id) {
      // Use provided ID
      farmRef = doc(db, 'farms', farmData.farm_id);
      await setDoc(farmRef, {
        name: farmData.name,
        description: farmData.description,
        userId: farmData.user_id,
        createdAt: new Date()
      });
      return farmData.farm_id;
    } else {
      // Auto-generate ID
      const docRef = await addDoc(collection(db, 'farms'), {
        name: farmData.name,
        description: farmData.description,
        userId: farmData.user_id,
        createdAt: new Date()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error creating farm:", error);
    throw error;
  }
};

export const getFarm = async (farmId: string) => {
  try {
    const farmRef = doc(db, 'farms', farmId);
    const farmSnapshot = await getDoc(farmRef);
    
    if (farmSnapshot.exists()) {
      return { id: farmSnapshot.id, ...farmSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting farm:", error);
    throw error;
  }
};

export const getUserFarms = async (userId: string) => {
  try {
    const farmsQuery = query(
      collection(db, 'farms'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(farmsQuery);
    const farms: any[] = [];
    
    querySnapshot.forEach((doc) => {
      farms.push({ id: doc.id, ...doc.data() });
    });
    
    return farms;
  } catch (error) {
    console.error("Error getting user farms:", error);
    throw error;
  }
};

export const updateFarm = async (farmId: string, farmData: Partial<Farm>) => {
  try {
    const farmRef = doc(db, 'farms', farmId);
    
    const firestoreData: Record<string, any> = {};
    if (farmData.name) firestoreData.name = farmData.name;
    if (farmData.description) firestoreData.description = farmData.description;
    
    await updateDoc(farmRef, firestoreData);
    return farmId;
  } catch (error) {
    console.error("Error updating farm:", error);
    throw error;
  }
};

export const deleteFarm = async (farmId: string) => {
  try {
    await deleteDoc(doc(db, 'farms', farmId));
    
    // Also delete all device memberships for this farm
    const membershipsQuery = query(
      collection(db, 'farmDevices'), 
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(membershipsQuery);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error("Error deleting farm:", error);
    throw error;
  }
};

// Device membership operations
export const addDeviceToFarm = async (membershipData: DeviceMembership) => {
  try {
    // Check if membership already exists to prevent duplicates
    const membershipQuery = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', membershipData.farm_id),
      where('deviceId', '==', membershipData.device_id)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (!querySnapshot.empty) {
      // Membership already exists
      return querySnapshot.docs[0].id;
    }
    
    // Create new membership
    const docRef = await addDoc(collection(db, 'farmDevices'), {
      farmId: membershipData.farm_id,
      deviceId: membershipData.device_id,
      createdAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding device to farm:", error);
    throw error;
  }
};

export const removeDeviceFromFarm = async (farmId: string, deviceId: string) => {
  try {
    const membershipQuery = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', farmId),
      where('deviceId', '==', deviceId)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (querySnapshot.empty) {
      return false; // No membership found
    }
    
    // Delete the membership document
    await deleteDoc(querySnapshot.docs[0].ref);
    
    return true;
  } catch (error) {
    console.error("Error removing device from farm:", error);
    throw error;
  }
};

export const getFarmDevices = async (farmId: string) => {
  try {
    const membershipQuery = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    const deviceIds: string[] = [];
    
    querySnapshot.forEach((doc) => {
      deviceIds.push(doc.data().deviceId);
    });
    
    // For a complete application, you might want to fetch the actual device data here
    return deviceIds;
  } catch (error) {
    console.error("Error getting farm devices:", error);
    throw error;
  }
};