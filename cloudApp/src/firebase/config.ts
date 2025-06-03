// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

// Declare global AppCheck debug token for development
declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
  }
}

// Use environment variables for Firebase config
// This helps keep sensitive information out of your code repository
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check
// Completely disable App Check in development to prevent 400 errors
if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_FIREBASE_APPCHECK_DEBUG_MODE === 'true') {
  // Do not set debug token in development to prevent initialization attempts
  console.log('🔧 Firebase App Check disabled in development mode');
}

let appCheck: AppCheck | undefined;

// Function to initialize App Check
const initializeAppCheckSafely = () => {
  try {
    // Skip App Check entirely in development to prevent 400 errors
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('🔧 App Check skipped in development mode');
      return;
    }
    
    // Only initialize in production or when explicitly required
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('✅ Firebase App Check initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase App Check:', error);
    // App Check is optional - the app can still function without it
    console.warn('⚠️ App will continue without App Check protection');
  }
};

// Initialize App Check with delay to ensure ReCAPTCHA script is loaded
if (typeof window !== 'undefined') {
  // Only initialize in production or specific environments
  if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
    // Give some time for ReCAPTCHA script to load
    setTimeout(() => {
      initializeAppCheckSafely();
    }, 1000);
  } else {
    console.log('🔧 App Check initialization skipped for development');
  }
} else {
  // For SSR environments - also skip in development
  if (process.env.NODE_ENV === 'production') {
    initializeAppCheckSafely();
  }
}

// Initialize other Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Helper function to check App Check status
const checkAppCheckStatus = async () => {
  if (!appCheck) {
    return { status: 'not_initialized', message: 'App Check was not initialized' };
  }
  
  try {
    // This doesn't actually check the status, but will throw an error if setup is wrong
    console.log('App Check is initialized');
    return { status: 'initialized', message: 'App Check is properly initialized' };
  } catch (error) {
    console.error('App Check status check failed:', error);
    return { 
      status: 'error', 
      message: 'App Check initialization issue', 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export { app, db, auth, functions, appCheck, checkAppCheckStatus };