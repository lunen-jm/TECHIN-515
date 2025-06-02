// Firebase App Check Quick Test
// Copy and paste this in your browser console at https://grainguardgix.netlify.app

console.log('🔧 Firebase App Check Quick Test');
console.log('Current domain:', window.location.hostname);

// Test ReCAPTCHA Enterprise token generation
async function testRecaptcha() {
  console.log('\n1. Testing ReCAPTCHA Enterprise...');
  
  if (typeof grecaptcha === 'undefined') {
    console.log('❌ ReCAPTCHA not loaded yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
    try {
      console.log('✅ ReCAPTCHA Enterprise available');
      const token = await grecaptcha.enterprise.execute('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC', {
        action: 'test'
      });
      console.log('✅ ReCAPTCHA token generated:', token.substring(0, 50) + '...');
      return token;
    } catch (error) {
      console.log('❌ ReCAPTCHA token generation failed:', error.message);
      if (error.message.includes('not allowed')) {
        console.log('🔧 Domain not authorized! Add grainguardgix.netlify.app to Google Cloud Console > reCAPTCHA Enterprise');
      }
      return null;
    }
  } else {
    console.log('❌ ReCAPTCHA Enterprise not available');
    return null;
  }
}

// Test Firebase App Check
async function testAppCheck() {
  console.log('\n2. Testing Firebase App Check...');
  
  try {
    // Check if Firebase is already initialized
    if (typeof window.firebase !== 'undefined' || document.querySelector('[src*="firebase"]')) {
      console.log('✅ Firebase scripts detected');
    }
    
    // Make a direct test request to Firebase App Check
    const response = await fetch('https://firebaseappcheck.googleapis.com/v1/projects/grainguard-22f5a/apps/1:23433283193:web:e120d9b1ce4fa22e1f76a8:exchangeRecaptchaEnterpriseToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'recaptcha_enterprise_token': await testRecaptcha()
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 400) {
      console.log('❌ 400 Error - Domain authorization issue');
      console.log('🔧 Fix: Add grainguardgix.netlify.app to Google Cloud Console > reCAPTCHA Enterprise');
    } else if (response.status === 200) {
      console.log('✅ App Check token exchange successful');
    } else {
      console.log('⚠️ Unexpected status:', response.status);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.log('❌ App Check test failed:', error.message);
  }
}

// Run the tests
testRecaptcha().then(testAppCheck);

console.log('\n📋 If you see 400 errors, follow these steps:');
console.log('1. Go to Google Cloud Console > reCAPTCHA Enterprise');
console.log('2. Find site key: 6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC');
console.log('3. Add domain: grainguardgix.netlify.app');
console.log('4. Save and wait 5-10 minutes for propagation');
