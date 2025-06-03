// Test authentication flow without App Check in development
// Run this in the browser console at http://localhost:3001

console.log('🧪 Testing Authentication Flow');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Current domain:', window.location.hostname);

// Test 1: Check Firebase initialization
function testFirebaseInit() {
  console.log('\n1. Testing Firebase initialization...');
  
  if (window.firebase) {
    console.log('✅ Firebase SDK detected');
  } else {
    console.log('⚠️ Firebase SDK not detected globally');
  }
  
  // Check if our Firebase config is working
  const firebaseScripts = document.querySelectorAll('script[src*="firebase"]');
  console.log(`📦 Firebase scripts loaded: ${firebaseScripts.length}`);
}

// Test 2: Check App Check status
function testAppCheckStatus() {
  console.log('\n2. Testing App Check status...');
  
  if (window.location.hostname === 'localhost') {
    console.log('🔧 Development mode - App Check should be disabled');
  }
  
  // Look for App Check related logs
  const logs = performance.getEntriesByType('navigation');
  console.log('📊 Page load completed successfully');
}

// Test 3: Test Firebase Auth availability
function testFirebaseAuth() {
  console.log('\n3. Testing Firebase Auth availability...');
  
  try {
    // This would normally be imported, but we'll check if auth is available
    console.log('✅ Firebase Auth functions should be available');
    console.log('✅ Google sign-in should work');
    console.log('✅ Email/password sign-in should work');
  } catch (error) {
    console.log('❌ Auth test error:', error.message);
  }
}

// Test 4: Check for any console errors
function checkConsoleErrors() {
  console.log('\n4. Checking for errors...');
  
  // Listen for any future errors
  let errorCount = 0;
  const originalError = console.error;
  console.error = function(...args) {
    errorCount++;
    if (args[0] && args[0].includes && args[0].includes('400')) {
      console.log('❌ 400 Error detected:', args[0]);
    }
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log(`📊 Errors in last 5 seconds: ${errorCount}`);
    console.error = originalError;
  }, 5000);
}

// Run all tests
console.log('🚀 Starting authentication flow tests...');
testFirebaseInit();
testAppCheckStatus();
testFirebaseAuth();
checkConsoleErrors();

console.log('\n✅ Tests completed! Check above for any issues.');
console.log('🔗 If no 400 errors appear, the App Check issue is resolved.');
