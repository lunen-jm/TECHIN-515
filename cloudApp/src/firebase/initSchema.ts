import { db } from './config';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * Initialize the Firestore database schema
 * This function creates the necessary collection structure for your application
 * Call this function once when setting up a new Firebase project
 */
export const initializeSchema = async () => {
  try {
    console.log('Initializing Firestore schema...');
    
    // Create top-level collection paths
    // In Firestore, collections are created automatically when you add documents
    const collections = [
      'users',
      'devices',
      'farms',
      'farmDevices',
      'humidity_readings',
      'co2_readings',
      'temperature_readings',
      'lidar_readings',
      'outdoor_temp_readings',
      'alerts'
    ];
    
    // Log collections being prepared
    for (const collPath of collections) {
      console.log(`Preparing collection: ${collPath}`);
    }
    
    // Create a dummy document to ensure collections are created
    const dummyDoc = {
      created: new Date(),
      description: 'Schema initialization document',
      _delete: true  // Flag to indicate this document can be deleted
    };
    
    // Create dummy documents in each collection
    const initPromises = collections.map(async (collPath) => {
      const docRef = doc(collection(db, collPath), 'schema_init');
      await setDoc(docRef, dummyDoc);
      console.log(`Created initialization document in ${collPath}`);
    });
    
    await Promise.all(initPromises);
    
    console.log('Schema initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  }
};

/**
 * Function to execute when initializing the application
 * This will check if the database is properly set up
 */
export const checkDatabaseSetup = async () => {
  // This function could be extended to check for existing data
  // and initialize only if needed
  console.log('Checking database setup...');
  return true;
};