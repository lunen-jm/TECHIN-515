import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Register a new user with email and password
export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username: displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      localAdmin: false,
      globalAdmin: false
    });
    
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        username: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        localAdmin: false,
        globalAdmin: false
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Create a test user for development purposes
export const createTestUser = async () => {
  const testEmail = "test@example.com";
  const testPassword = "Test123!";
  const testName = "Test User";
  
  try {
    // Check if the user already exists
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log("Test user already exists:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      // If login fails, user doesn't exist, so create one
      console.log("Creating new test user...");
      const user = await registerWithEmail(testEmail, testPassword, testName);
      
      // Make this user an admin for testing purposes
      await setDoc(doc(db, 'users', user.uid), {
        username: testName,
        email: testEmail,
        createdAt: serverTimestamp(),
        localAdmin: true,
        globalAdmin: true
      }, { merge: true });
      
      console.log("Test user created successfully:", user);
      return user;
    }
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
};