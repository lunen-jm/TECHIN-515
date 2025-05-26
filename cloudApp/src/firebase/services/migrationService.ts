import { db } from '../config';
import { 
  collection, getDocs, query, where, addDoc, updateDoc, doc 
} from 'firebase/firestore';

/**
 * Migration utility to convert existing single-user farms to multi-user farms
 * This function should be run once to migrate existing data
 */
export const migrateFarmsToMultiUser = async () => {
  try {
    console.log('Starting farm migration to multi-user system...');
    
    // Get all existing farms
    const farmsSnapshot = await getDocs(collection(db, 'farms'));
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const farmDoc of farmsSnapshot.docs) {
      const farmData = farmDoc.data();
      const farmId = farmDoc.id;
      
      // Check if this farm already has memberships
      const membershipsQuery = query(
        collection(db, 'farmMembers'),
        where('farmId', '==', farmId)
      );
      
      const existingMemberships = await getDocs(membershipsQuery);
      
      if (!existingMemberships.empty) {
        console.log(`Farm ${farmId} already has memberships, skipping...`);
        skippedCount++;
        continue;
      }
      
      // Create owner membership for the existing userId
      if (farmData.userId) {
        await addDoc(collection(db, 'farmMembers'), {
          farmId: farmId,
          userId: farmData.userId,
          role: 'owner',
          addedAt: new Date(),
          addedBy: farmData.userId
        });
        
        // Update farm document to include createdBy field
        await updateDoc(doc(db, 'farms', farmId), {
          createdBy: farmData.userId,
          createdAt: farmData.createdAt || new Date()
        });
        
        console.log(`Migrated farm ${farmId} for user ${farmData.userId}`);
        migratedCount++;
      } else {
        console.warn(`Farm ${farmId} has no userId, skipping...`);
        skippedCount++;
      }
    }
    
    console.log(`Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    return { migratedCount, skippedCount };
    
  } catch (error) {
    console.error('Error during farm migration:', error);
    throw error;
  }
};

/**
 * Create a test farm and add it to a specific user's account
 */
export const createTestFarmForUser = async (userId: string) => {
  try {
    const { createFarmWithMembership } = await import('./farmService');
    
    const testFarmData = {
      name: 'Sample Grain Storage Farm',
      description: 'A demonstration farm with sample grain storage facilities. This farm includes multiple grain silos for wheat, corn, and barley storage.',
      user_id: userId
    };
    
    const farmId = await createFarmWithMembership(testFarmData);
    console.log(`Created test farm ${farmId} for user ${userId}`);
    
    return farmId;
  } catch (error) {
    console.error('Error creating test farm:', error);
    throw error;
  }
};

/**
 * Utility to check if a user has any farms
 */
export const checkUserHasFarms = async (userId: string): Promise<boolean> => {
  try {
    const membershipsQuery = query(
      collection(db, 'farmMembers'),
      where('userId', '==', userId)
    );
    
    const memberships = await getDocs(membershipsQuery);
    return !memberships.empty;
  } catch (error) {
    console.error('Error checking user farms:', error);
    return false;
  }
};
