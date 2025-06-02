// Firebase App Check Diagnostic Script
// Run this in browser console on grainguardgix.netlify.app

console.log('🔍 Firebase App Check Diagnostic Script');
console.log('=====================================');

// 1. Check if ReCAPTCHA Enterprise is loaded
console.log('1. ReCAPTCHA Enterprise Script Status:');
if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
  console.log('✅ ReCAPTCHA Enterprise is loaded');
  console.log('   Site key from script:', window.location.hostname);
} else {
  console.log('❌ ReCAPTCHA Enterprise not loaded');
  console.log('   Check if the script tag is present in HTML');
}

// 2. Check current domain
console.log('\n2. Current Domain Information:');
console.log('   Current domain:', window.location.hostname);
console.log('   Full URL:', window.location.href);
console.log('   Protocol:', window.location.protocol);

// 3. Check Firebase configuration
console.log('\n3. Firebase Configuration Check:');
try {
  const firebaseConfig = {
    // Your config should be visible here if imported properly
  };
  console.log('✅ Firebase config accessible');
} catch (error) {
  console.log('❌ Firebase config error:', error);
}

// 4. Test ReCAPTCHA Enterprise token generation
console.log('\n4. Testing ReCAPTCHA Enterprise Token Generation:');
async function testRecaptchaToken() {
  if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
    try {
      const token = await grecaptcha.enterprise.execute('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC', {
        action: 'test'
      });
      console.log('✅ ReCAPTCHA token generated successfully');
      console.log('   Token length:', token.length);
      console.log('   Token prefix:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.log('❌ ReCAPTCHA token generation failed:', error);
      return null;
    }
  } else {
    console.log('❌ ReCAPTCHA Enterprise not available');
    return null;
  }
}

// 5. Test Firebase App Check token exchange
async function testFirebaseAppCheck() {
  console.log('\n5. Testing Firebase App Check Token Exchange:');
  
  try {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js');
    
    const firebaseConfig = {
      apiKey: "AIzaSyBx6w1lNM_5POh0O3VNtNTSt_QqDLLkLnU",
      authDomain: "grainguard-c8c98.firebaseapp.com",
      projectId: "grainguard-c8c98",
      storageBucket: "grainguard-c8c98.appspot.com",
      messagingSenderId: "59349064432",
      appId: "1:59349064432:web:24d4a6bd7cd95749da2b88"
    };
    
    const app = initializeApp(firebaseConfig);
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC'),
      isTokenAutoRefreshEnabled: false
    });
    
    console.log('✅ Firebase App Check initialized for testing');
    
    // Try to get a token
    const { getToken } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js');
    const appCheckTokenResponse = await getToken(appCheck);
    console.log('✅ Firebase App Check token obtained successfully');
    console.log('   Token length:', appCheckTokenResponse.token.length);
    
  } catch (error) {
    console.log('❌ Firebase App Check test failed:', error);
    console.log('   Error details:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🔧 400 Error Troubleshooting:');
      console.log('   1. Check if domain is authorized in Google Cloud Console > reCAPTCHA Enterprise');
      console.log('   2. Verify site key matches in Firebase Console > App Check');
      console.log('   3. Ensure reCAPTCHA Enterprise API is enabled');
      console.log('   4. Check if billing is enabled for the GCP project');
    }
  }
}

// 6. Check network requests
console.log('\n6. Network Request Monitoring:');
console.log('   Open Network tab in DevTools and look for:');
console.log('   - Requests to www.google.com/recaptcha/enterprise/anchor');
console.log('   - Requests to www.google.com/recaptcha/enterprise/reload');
console.log('   - Requests to firebaseappcheck.googleapis.com');

// Run the tests
(async () => {
  await testRecaptchaToken();
  await testFirebaseAppCheck();
  
  console.log('\n🎯 Next Steps if Issues Found:');
  console.log('1. Google Cloud Console > reCAPTCHA Enterprise:');
  console.log('   - Add domain: grainguardgix.netlify.app');
  console.log('   - Verify site key: 6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC');
  console.log('');
  console.log('2. Firebase Console > App Check:');
  console.log('   - Verify site key matches');
  console.log('   - Check if App Check is enabled for your project');
  console.log('');
  console.log('3. Firebase Console > Authentication > Settings:');
  console.log('   - Add grainguardgix.netlify.app to authorized domains');
})();
