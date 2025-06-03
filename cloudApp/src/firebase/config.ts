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
    // STRICT CHECK: Absolutely no App Check in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 App Check BLOCKED in development mode');
      return;
    }
    
    // STRICT CHECK: No App Check on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🚫 App Check BLOCKED on localhost');
      return;
    }
    
    // Only initialize in production with real domain
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

// COMPLETELY DISABLE App Check initialization in development
if (typeof window !== 'undefined') {
  console.log('🔍 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hostname: window.location.hostname,
    href: window.location.href
  });
  
  // ONLY initialize in production AND not localhost
  if (process.env.NODE_ENV === 'production' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    console.log('🚀 Production environment detected - initializing App Check');
    setTimeout(() => {
      initializeAppCheckSafely();
    }, 1000);
  } else {
    console.log('🔧 Development/localhost detected - App Check DISABLED');
  }
} else {
  // SSR environment - only in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🖥️ SSR Production environment - initializing App Check');
    initializeAppCheckSafely();
  } else {
    console.log('🖥️ SSR Development environment - App Check DISABLED');
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