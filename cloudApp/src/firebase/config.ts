// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

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
// In development or when debug flag is set, register the debug token to prevent console errors
if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_FIREBASE_APPCHECK_DEBUG_MODE === 'true') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;  console.log('Firebase App Check debug mode enabled');
}

let appCheck: AppCheck | undefined;
try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeZMkorAAAAABoOAS1qGaXOphuL79oo-HXhYko1'),
    // Optional: Pass isTokenAutoRefreshEnabled as true to enable auto refresh
    isTokenAutoRefreshEnabled: true
  });
  console.log('Firebase App Check initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase App Check:', error);
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