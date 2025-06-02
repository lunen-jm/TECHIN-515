# RECAPTCHA ENTERPRISE 401 ERROR FIX

## 🔴 **ERROR ENCOUNTERED:**
```
recaptcha__en.js:930 POST https://www.google.com/recaptcha/enterprise/pat?k=6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC 401 (Unauthorized)

config.ts:44 Error initializing Firebase App Check: TypeError: n.ready is not a function
```

## ✅ **ROOT CAUSE:**
1. **Wrong Provider Type**: Using `ReCaptchaV3Provider` instead of `ReCaptchaEnterpriseProvider`
2. **Script Loading Race Condition**: App Check initializing before ReCAPTCHA Enterprise script fully loads
3. **Domain Authorization**: Site key not authorized for `grainguardgix.netlify.app` domain

## 🔧 **FIXES APPLIED:**

### 1. **Updated Firebase Config** (`src/firebase/config.ts`)
- ✅ Changed from `ReCaptchaV3Provider` to `ReCaptchaEnterpriseProvider`
- ✅ Added delayed initialization to ensure ReCAPTCHA script loads first
- ✅ Added better error handling to prevent app crashes

### 2. **Updated HTML Script Loading** (`public/index.html`)
- ✅ Added `async defer` attributes to ReCAPTCHA Enterprise script
- ✅ Ensures proper non-blocking script loading

### 3. **Key Changes Made:**
```typescript
// OLD (INCORRECT):
import { ReCaptchaV3Provider } from 'firebase/app-check';
provider: new ReCaptchaV3Provider('site-key')

// NEW (CORRECT):
import { ReCaptchaEnterpriseProvider } from 'firebase/app-check';
provider: new ReCaptchaEnterpriseProvider('site-key')
```

## 🚨 **REMAINING REQUIRED ACTIONS:**

### **CRITICAL - Firebase Console Configuration:**

1. **Google Cloud Console** → ReCAPTCHA Enterprise:
   - ✅ Site key: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
   - ❌ **MISSING**: Add `grainguardgix.netlify.app` to authorized domains
   - ❌ **MISSING**: Add `localhost:3000` for development testing

2. **Firebase Console** → App Check:
   - ✅ Verify ReCAPTCHA Enterprise provider is configured
   - ❌ **MISSING**: Ensure site key matches the one in code

3. **Firebase Console** → Authentication → Settings:
   - ❌ **MISSING**: Add `grainguardgix.netlify.app` to authorized domains

## 🎯 **NEXT STEPS:**

1. **Deploy updated code** to Netlify (build is ready ✅)
2. **Configure domain authorization** in Google Cloud Console (CRITICAL ⚠️)
3. **Test authentication** after domain configuration
4. **Monitor console** for any remaining errors

## 📋 **Expected Result After Domain Fix:**
- ✅ No more 401 Unauthorized errors
- ✅ ReCAPTCHA Enterprise loads properly
- ✅ Firebase App Check initializes successfully
- ✅ Authentication flows work correctly

The code fixes are complete. The remaining 401 error will resolve once domain authorization is configured in Google Cloud Console.
