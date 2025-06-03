// Quick Firebase App Check Status Test
// Run this in browser console at http://localhost:3000

console.log('🧪 Firebase App Check Status Verification');
console.log('==========================================');

// Environment Info
console.log('\n📊 Environment Information:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Current domain:', window.location.hostname);
console.log('- Port:', window.location.port);
console.log('- Full URL:', window.location.href);

// Test Firebase initialization
console.log('\n🔥 Firebase Status:');
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase SDK loaded globally');
} else {
  console.log('⚠️ Firebase SDK not available globally (expected in modern React apps)');
}

// App Check Status
console.log('\n🛡️ App Check Status:');
if (window.location.hostname === 'localhost') {
  console.log('✅ Development mode detected - App Check should be DISABLED');
} else {
  console.log('🚀 Production mode - App Check should be ENABLED');
}

// Listen for any 400 errors for 10 seconds
console.log('\n🔍 Monitoring for 400 errors (10 seconds)...');
let errorCount = 0;
let appCheckErrors = 0;

const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  errorCount++;
  const message = args.join(' ');
  if (message.includes('400') || message.includes('App Check') || message.includes('appCheck')) {
    appCheckErrors++;
    console.log(`❌ FIREBASE/APP CHECK ERROR DETECTED: ${message}`);
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('App Check') || message.includes('appCheck')) {
    console.log(`⚠️ FIREBASE/APP CHECK WARNING: ${message}`);
  }
  originalWarn.apply(console, args);
};

// Network monitoring
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    if (response.status === 400 && args[0] && args[0].includes && args[0].includes('identitytoolkit')) {
      console.log(`❌ NETWORK 400 ERROR: ${args[0]}`);
      appCheckErrors++;
    }
    return response;
  });
};

// Results after 10 seconds
setTimeout(() => {
  console.log('\n📋 VERIFICATION RESULTS:');
  console.log('========================');
  
  if (appCheckErrors === 0) {
    console.log('🎉 SUCCESS: No Firebase App Check 400 errors detected!');
    console.log('✅ App Check fix is working correctly');
    console.log('✅ Development environment is clean');
  } else {
    console.log(`❌ FAILURE: ${appCheckErrors} App Check errors detected`);
    console.log('❓ App Check fix may need additional work');
  }
  
  console.log(`📊 Total errors monitored: ${errorCount}`);
  console.log(`🛡️ App Check related errors: ${appCheckErrors}`);
  
  // Restore original functions
  console.error = originalError;
  console.warn = originalWarn;
  window.fetch = originalFetch;
  
  console.log('\n🧪 Verification complete!');
  
}, 10000);

console.log('✅ Monitoring started... Results will appear in 10 seconds');
