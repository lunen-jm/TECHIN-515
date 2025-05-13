import { 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates predefined user accounts for production use.
 * Creates a standard user account and an admin account.
 * This function can be run in production to create initial admin/user accounts.
 */
export const createPredefinedUsers = async () => {
  try {
    console.log('Creating predefined user accounts...');
    
    // Create standard user account
    const standardUser = await createUserAccount(
      'user@farmsensors.com',
      'FarmUser2025!',
      'Standard User',
      false,
      false
    );
    
    // Create admin user account
    const adminUser = await createUserAccount(
      'admin@farmsensors.com',
      'FarmAdmin2025!',
      'Admin User',
      true,
      true
    );
    
    console.log('Predefined user accounts created successfully');
    return { standardUser, adminUser };
  } catch (error) {
    console.error('Error creating predefined users:', error);
    throw error;
  }
};

/**
 * Helper function to create a user account
 */
const createUserAccount = async (
  email: string,
  password: string,
  displayName: string,
  isLocalAdmin: boolean,
  isGlobalAdmin: boolean
) => {
  try {
    // Try to create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username: displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      localAdmin: isLocalAdmin,
      globalAdmin: isGlobalAdmin
    });
    
    console.log(`Created user: ${email}`);
    return user;
  } catch (error: any) {
    // If user already exists, just log a message
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User already exists: ${email}`);
      return null;
    }
    throw error;
  }
};