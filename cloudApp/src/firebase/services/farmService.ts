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
  user_id: string; // Keep for backward compatibility
  createdBy?: string; // New field for creator
  createdAt?: any;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  size?: string;
  farmType?: string;
}

interface FarmMember {
  membershipId?: string;
  farmId: string;
  userId: string;
  role: 'owner' | 'admin' | 'viewer';
  addedAt?: any;
  addedBy?: string;
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
      const data = farmSnapshot.data();
      return { 
        id: farmSnapshot.id, 
        name: data.name,
        description: data.description,
        location: data.location,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        size: data.size,
        farmType: data.farmType,
        userId: data.userId || data.user_id, // Handle both old and new field names
        createdAt: data.createdAt,
        createdBy: data.createdBy
      };
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
    if (farmData.name !== undefined) firestoreData.name = farmData.name;
    if (farmData.description !== undefined) firestoreData.description = farmData.description;
    if (farmData.location !== undefined) firestoreData.location = farmData.location;
    if (farmData.contactPhone !== undefined) firestoreData.contactPhone = farmData.contactPhone;
    if (farmData.contactEmail !== undefined) firestoreData.contactEmail = farmData.contactEmail;
    if (farmData.size !== undefined) firestoreData.size = farmData.size;
    if (farmData.farmType !== undefined) firestoreData.farmType = farmData.farmType;
    
    await updateDoc(farmRef, firestoreData);
    return farmId;
  } catch (error) {
    console.error("Error updating farm:", error);
    throw error;
  }
};

export const deleteFarm = async (farmId: string) => {
  try {
    // Delete all farm members
    const membersQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', farmId)
    );
    const membersSnapshot = await getDocs(membersQuery);
    const deleteMemberPromises = membersSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteMemberPromises);

    // Delete all farm devices associations
    const devicesQuery = query(
      collection(db, 'farmDevices'),
      where('farmId', '==', farmId)
    );
    const devicesSnapshot = await getDocs(devicesQuery);
    const deleteDevicePromises = devicesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteDevicePromises);

    // Finally delete the farm itself
    await deleteDoc(doc(db, 'farms', farmId));

    console.log(`Farm ${farmId} and all associated data deleted successfully`);
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

// Alias for getUserFarms to match the expected function name
export const getFarms = getUserFarms;

// Farm member operations
export const addFarmMember = async (memberData: FarmMember) => {
  try {
    // Check if membership already exists
    const membershipQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', memberData.farmId),
      where('userId', '==', memberData.userId)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (!querySnapshot.empty) {
      // Membership already exists
      return querySnapshot.docs[0].id;
    }
    
    // Create new membership
    const docRef = await addDoc(collection(db, 'farmMembers'), {
      farmId: memberData.farmId,
      userId: memberData.userId,
      role: memberData.role,
      addedAt: new Date(),
      addedBy: memberData.addedBy || null
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding farm member:", error);
    throw error;
  }
};

export const removeFarmMember = async (membershipId: string) => {
  try {
    await deleteDoc(doc(db, 'farmMembers', membershipId));
    return true;
  } catch (error) {
    console.error("Error removing farm member:", error);
    throw error;
  }
};

export const updateFarmMember = async (membershipId: string, role: 'owner' | 'admin' | 'viewer') => {
  try {
    const memberRef = doc(db, 'farmMembers', membershipId);
    await updateDoc(memberRef, { role });
    return membershipId;
  } catch (error) {
    console.error("Error updating farm member:", error);
    throw error;
  }
};

export const getFarmMembers = async (farmId: string) => {
  try {
    const membersQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(membersQuery);
    const members: any[] = [];
    
    querySnapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });
    
    return members;
  } catch (error) {
    console.error("Error getting farm members:", error);
    throw error;
  }
};

// =======================
// FARM MEMBERSHIP OPERATIONS (Multi-User Support)
// =======================

/**
 * Add a user to a farm with specified role
 */
export const addUserToFarm = async (farmId: string, userId: string, role: 'owner' | 'admin' | 'viewer', addedBy: string) => {
  try {
    // Check if membership already exists
    const existingQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', farmId),
      where('userId', '==', userId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('User is already a member of this farm');
    }

    // Add the membership
    const membershipData = {
      farmId,
      userId,
      role,
      addedAt: new Date(),
      addedBy
    };

    const docRef = await addDoc(collection(db, 'farmMembers'), membershipData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding user to farm:", error);
    throw error;
  }
};

/**
 * Remove a user from a farm
 */
export const removeUserFromFarm = async (farmId: string, userId: string) => {
  try {
    const membershipQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', farmId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (querySnapshot.empty) {
      throw new Error('User is not a member of this farm');
    }

    // Delete the membership
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error("Error removing user from farm:", error);
    throw error;
  }
};

/**
 * Get all farms that a user has access to (replaces getUserFarms)
 */
export const getUserAccessibleFarms = async (userId: string) => {
  try {
    // Get all farm memberships for this user
    const membershipsQuery = query(
      collection(db, 'farmMembers'),
      where('userId', '==', userId)
    );
    
    const membershipsSnapshot = await getDocs(membershipsQuery);
    
    // Get farm IDs from memberships
    const membershipFarmIds = membershipsSnapshot.docs.map(doc => doc.data().farmId);
    
    // Fetch farm details for membership-based farms
    const farmPromises = membershipFarmIds.map(farmId => getFarm(farmId));
    const membershipFarms = await Promise.all(farmPromises);
    
    // Filter out null results and add membership info
    const validMembershipFarms = membershipFarms.filter(farm => farm !== null).map((farm, index) => {
      const membership = membershipsSnapshot.docs[index].data();
      return {
        ...farm,
        userRole: membership.role,
        memberSince: membership.addedAt
      };
    });

    // Also get legacy farms (farms created before multi-user system)
    const legacyFarmsQuery = query(
      collection(db, 'farms'),
      where('userId', '==', userId)
    );
    
    const legacyFarmsSnapshot = await getDocs(legacyFarmsQuery);
    const legacyFarms = legacyFarmsSnapshot.docs
      .filter(doc => !membershipFarmIds.includes(doc.id)) // Exclude farms already in memberships
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'owner', // Legacy farms are owned by the user
        memberSince: doc.data().createdAt
      }));

    // Combine membership farms and legacy farms
    return [...validMembershipFarms, ...legacyFarms];
  } catch (error) {
    console.error("Error getting user accessible farms:", error);
    throw error;
  }
};

/**
 * Update farm creation to also create initial membership
 */
export const createFarmWithMembership = async (farmData: Farm) => {
  try {
    // Create the farm
    const farmId = await createFarm(farmData);
    
    // Add the creator as owner
    await addUserToFarm(farmId, farmData.user_id, 'owner', farmData.user_id);
    
    return farmId;
  } catch (error) {
    console.error("Error creating farm with membership:", error);
    throw error;
  }
};

/**
 * Check if a user has access to a farm and their role
 */
export const getUserFarmRole = async (farmId: string, userId: string): Promise<string | null> => {
  try {
    // First check for modern farm membership
    const membershipQuery = query(
      collection(db, 'farmMembers'),
      where('farmId', '==', farmId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role;
    }
    
    // If no membership found, check for legacy farm ownership
    const farmDoc = await getDoc(doc(db, 'farms', farmId));
    if (farmDoc.exists()) {
      const farmData = farmDoc.data();
      if (farmData.userId === userId || farmData.user_id === userId) {
        return 'owner'; // Legacy farms are owned by the original creator
      }
    }
    
    return null; // User has no access
  } catch (error) {
    console.error("Error checking user farm role:", error);
    throw error;
  }
};