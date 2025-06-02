# Firebase ReCAPTCHA Enterprise Setup Guide

## 🎯 **THE ACTUAL SOLUTION**

Your ReCAPTCHA issues are **configuration problems in Firebase Console**, not code issues. Your code is correctly set up!

## ✅ **What's Working Correctly**

1. **Firebase App Check** is properly configured in your code
2. **ReCAPTCHA Enterprise script** is loaded in HTML
3. **Authentication services** work correctly
4. **Site key** is properly configured: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`

## 🔧 **Required Configuration Fixes**

### **1. Google Cloud Console - ReCAPTCHA Domain Authorization**

**Fix the 401 ReCAPTCHA errors:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your ReCAPTCHA Enterprise key: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
5. Click to edit the key
6. In **Domains** section, add:
   ```
   grainguardgix.netlify.app
   localhost
   127.0.0.1
   ```
7. Save changes

### **2. Firebase Console - Authentication Domains**

**Fix OAuth domain authorization:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:
   ```
   grainguardgix.netlify.app
   ```
5. Save changes

### **3. Firebase Console - App Check Configuration**

**Verify App Check setup:**

1. In Firebase Console, go to **App Check**
2. Ensure your web app is registered
3. Confirm ReCAPTCHA Enterprise provider is set with key: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
4. Verify domain `grainguardgix.netlify.app` is authorized

## 🚫 **What You DON'T Need**

- ❌ **Manual ReCAPTCHA token generation** in forms
- ❌ **Additional ReCAPTCHA API calls** in components
- ❌ **Custom token verification** on frontend
- ❌ **Code changes** for basic functionality

## 📋 **Testing Checklist**

After configuration changes:

- [ ] ReCAPTCHA 401 errors resolved
- [ ] Firebase App Check 400 errors resolved  
- [ ] Google OAuth works on production domain
- [ ] Email authentication works
- [ ] Device registration functions properly

## 🔍 **Manual Token Verification (Optional)**

If you want to test ReCAPTCHA tokens manually:

1. **Generate token in browser console:**
   ```javascript
   await window.grecaptcha.enterprise.execute('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC', {action: 'LOGIN'})
   ```

2. **Update `request.json` with the actual token**

3. **Send verification request:**
   ```bash
   curl -X POST "https://recaptchaenterprise.googleapis.com/v1/projects/YOUR_PROJECT_ID/assessments?key=YOUR_API_KEY" \
        -H "Content-Type: application/json" \
        -d @request.json
   ```

## 🎉 **Expected Result**

After fixing the console configurations:
- ✅ No more 401 ReCAPTCHA errors
- ✅ No more 400 App Check errors  
- ✅ Authentication works on production
- ✅ Firebase App Check generates tokens automatically
- ✅ Your farm monitoring app works properly on `grainguardgix.netlify.app`

## 📝 **Summary**

**The issue is domain authorization in Firebase/Google Cloud Console, not your code.**

Your Firebase App Check automatically handles ReCAPTCHA tokens for all Firebase API calls. You just need to authorize your production domain in the console settings.
