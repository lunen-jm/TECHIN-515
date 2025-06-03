import { auth, db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

/**
 * Migration helper to sync existing Firebase users with Auth0
 * This should be run once during the migration process
 */
export const migrateFirebaseUsersToAuth0 = async () => {
  try {
    console.log('Starting Firebase to Auth0 migration...');
    
    // Get all existing users from Firestore
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const migrationResults = {
      total: usersSnapshot.size,
      migrated: 0,
      skipped: 0,
      errors: 0
    };

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        // Skip users that already have auth0Id
        if (userData.auth0Id) {
          console.log(`User ${userId} already has Auth0 ID, skipping`);
          migrationResults.skipped++;
          continue;
        }

        // Create Auth0 user via Management API (you'll need to implement this)
        const auth0User = await createAuth0User({
          email: userData.email,
          name: userData.username,
          // Add custom claims for existing roles
          app_metadata: {
            localAdmin: userData.localAdmin || false,
            globalAdmin: userData.globalAdmin || false,
            firebaseUserId: userId
          }
        });

        // Update Firestore document with Auth0 ID
        await updateDoc(doc(db, 'users', userId), {
          auth0Id: auth0User.user_id,
          migrationDate: new Date(),
          migrationSource: 'firebase'
        });

        console.log(`Migrated user ${userId} to Auth0: ${auth0User.user_id}`);
        migrationResults.migrated++;

      } catch (error) {
        console.error(`Error migrating user ${userId}:`, error);
        migrationResults.errors++;
      }
    }

    console.log('Migration completed:', migrationResults);
    return migrationResults;

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Create Auth0 user via Management API
 * This requires Auth0 Management API credentials
 */
const createAuth0User = async (userData: any) => {
  const managementToken = await getAuth0ManagementToken();
  
  const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managementToken}`
    },
    body: JSON.stringify({
      connection: 'Username-Password-Authentication', // Your Auth0 database connection
      email: userData.email,
      name: userData.name,
      app_metadata: userData.app_metadata,
      email_verified: true, // Since they're existing users
      password: generateTemporaryPassword() // They'll need to reset on first login
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create Auth0 user: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get Auth0 Management API token
 */
const getAuth0ManagementToken = async (): Promise<string> => {
  const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.REACT_APP_AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.REACT_APP_AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });

  const data = await response.json();
  return data.access_token;
};

/**
 * Generate temporary password for migrated users
 */
const generateTemporaryPassword = (): string => {
  return Math.random().toString(36).slice(-12) + 'A1!';
};

/**
 * Send password reset emails to migrated users
 */
export const sendPasswordResetToMigratedUsers = async () => {
  // Implementation would use Auth0 Management API to trigger password reset emails
  console.log('This would send password reset emails to all migrated users');
};
