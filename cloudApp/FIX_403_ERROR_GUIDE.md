# 🔧 Fix 403 Forbidden Error - Firebase App Check API

## ✅ Progress Made
- ✅ ReCAPTCHA Enterprise is working (tokens generated successfully)
- ✅ Domain authorization is working (no more 400 errors)
- ❌ 403 Forbidden error indicates API access issue

## 🎯 Root Cause
The 403 error "Method doesn't allow unregistered callers" means:
1. Firebase App Check API is not enabled
2. Billing is not enabled on the Google Cloud project
3. API quotas or permissions are not configured

## 🔧 Step-by-Step Fix

### 1. 🌐 Enable Firebase App Check API
1. **Go to**: https://console.cloud.google.com/apis/library
2. **Select project**: `grainguard-22f5a`
3. **Search for**: "Firebase App Check API"
4. **Click**: "Firebase App Check API"
5. **Click**: "Enable" button

### 2. 💳 Verify Billing is Enabled
1. **Go to**: https://console.cloud.google.com/billing
2. **Select project**: `grainguard-22f5a`
3. **Verify**: Billing account is linked and active
4. **If not enabled**: Link a billing account

### 3. 🔑 Enable Additional Required APIs
Go to https://console.cloud.google.com/apis/library and enable:
- ✅ Firebase App Check API
- ✅ reCAPTCHA Enterprise API (already working)
- ✅ Identity and Access Management (IAM) API
- ✅ Cloud Resource Manager API

### 4. 🎛️ Firebase Console - App Check Configuration
1. **Go to**: https://console.firebase.google.com/project/grainguard-22f5a/appcheck
2. **Click**: "Get started" or "Configure"
3. **For Web apps**:
   - Provider: reCAPTCHA Enterprise
   - Site key: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
4. **Enable enforcement** for:
   - Firestore Database
   - Cloud Functions (if used)
   - Firebase Authentication

### 5. 🔄 Alternative: Update Your Code to Use Proper SDK
Instead of making direct API calls, use the Firebase SDK properly:

```javascript
// Better test that uses the actual Firebase SDK
async function testFirebaseSDK() {
  console.log('🧪 Testing Firebase SDK App Check...');
  
  try {
    // Import Firebase modules (if not already imported)
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js');
      const firebaseConfig = {
      apiKey: "YOUR_API_KEY_HERE",
      authDomain: "grainguard-22f5a.firebaseapp.com",
      projectId: "grainguard-22f5a",
      storageBucket: "grainguard-22f5a.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    
    const app = initializeApp(firebaseConfig, 'test-app');
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC'),
      isTokenAutoRefreshEnabled: false
    });
    
    console.log('✅ Firebase App Check initialized');
    
    // Get App Check token using proper SDK
    const appCheckTokenResponse = await getToken(appCheck, false);
    console.log('✅ App Check token obtained via SDK:', appCheckTokenResponse.token.substring(0, 50) + '...');
    
    return true;
  } catch (error) {
    console.log('❌ Firebase SDK test failed:', error.message);
    return false;
  }
}

// Run the SDK test
testFirebaseSDK();
```

### 6. 🧪 Quick Verification Steps

After enabling the APIs:

1. **Wait 5-10 minutes** for API enablement to propagate
2. **Clear browser cache** and refresh your site
3. **Run the improved test** (code above) in browser console
4. **Check Firebase Console** - App Check should show active tokens

## 🎯 Expected Results After Fix

- ✅ **No 403 errors** in DevTools Console
- ✅ **Firebase App Check tokens** generated successfully
- ✅ **Authentication flows** work properly
- ✅ **App protection** is active

## 📋 Quick Checklist

- [ ] Firebase App Check API enabled in Google Cloud Console
- [ ] Billing account linked and active
- [ ] Required APIs enabled (IAM, Cloud Resource Manager)
- [ ] App Check configured in Firebase Console
- [ ] Waited 5-10 minutes for propagation
- [ ] Tested with SDK-based approach
- [ ] Authentication flows working

## 🆘 If Still Having Issues

1. **Check API quotas** in Google Cloud Console
2. **Verify project permissions** (Owner/Editor role)
3. **Try the SDK-based test** instead of direct API calls
4. **Check Firebase Console logs** for more details

---

**The 403 error is primarily an API enablement and billing issue - much easier to fix than the original 400 error!**
