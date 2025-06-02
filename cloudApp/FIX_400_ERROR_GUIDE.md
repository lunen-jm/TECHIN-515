# 🔧 Fix Firebase App Check 400 Error - Complete Guide

## Current Issue
You're getting a **400 Bad Request** error when Firebase App Check tries to exchange the ReCAPTCHA Enterprise token. This is typically caused by domain authorization issues.

## Step-by-Step Fix

### 1. 🌐 Google Cloud Console - ReCAPTCHA Enterprise Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `grainguard-c8c98`
3. **Navigate to**: Security > reCAPTCHA Enterprise
4. **Find your site key**: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
5. **Click on the site key** to edit it
6. **Add these domains** to "Domains":
   ```
   grainguardgix.netlify.app
   localhost
   127.0.0.1
   ```
7. **Verify settings**:
   - Integration type: `Website`
   - reCAPTCHA type: `Score-based (v3)`
   - Enable: `Use checkbox for bot detection when score is inconclusive`

### 2. 🔥 Firebase Console - App Check Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select project**: `grainguard-c8c98`
3. **Navigate to**: Build > App Check
4. **Click on "Web apps"**
5. **Verify/Add your app** with these settings:
   ```
   App nickname: grain-guard-web
   Provider: reCAPTCHA Enterprise
   Site key: 6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC
   ```

### 3. 🔐 Firebase Console - Authentication Settings

1. **Still in Firebase Console**
2. **Navigate to**: Build > Authentication > Settings
3. **Click on "Authorized domains"**
4. **Add domain**: `grainguardgix.netlify.app`
5. **Verify these domains are listed**:
   ```
   localhost
   grainguard-c8c98.firebaseapp.com
   grainguardgix.netlify.app
   ```

### 4. 💳 Google Cloud Console - Billing & APIs

1. **Check Billing**: Ensure billing is enabled for your GCP project
2. **Enable APIs**: Make sure these APIs are enabled:
   - reCAPTCHA Enterprise API
   - Firebase App Check API
   - Identity and Access Management (IAM) API

### 5. 🧪 Test the Configuration

1. **Run diagnostic script**:
   - Open your live site: https://grainguardgix.netlify.app
   - Open browser DevTools Console
   - Copy and paste the content from `diagnose-firebase-issues.js`
   - Look for any remaining errors

2. **Test authentication flow**:
   - Try to sign in with Google
   - Try to sign in with email/password
   - Check DevTools Network tab for 400/401 errors

### 6. 🔄 If Still Getting 400 Errors

If you're still getting 400 errors after the above steps:

1. **Wait 5-10 minutes** - Changes can take time to propagate
2. **Clear browser cache** and cookies for your site
3. **Try incognito/private browsing** mode
4. **Check the exact error message** in DevTools Console

### 7. 📋 Verification Checklist

Mark each item as complete:

- [ ] Domain `grainguardgix.netlify.app` added to reCAPTCHA Enterprise site
- [ ] Site key `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC` verified in Firebase App Check
- [ ] Domain added to Firebase Authentication authorized domains
- [ ] Billing enabled on GCP project
- [ ] reCAPTCHA Enterprise API enabled
- [ ] Diagnostic script runs without 400 errors
- [ ] Authentication flows work properly

## 🎯 Most Common Causes of 400 Errors

1. **Domain not authorized** in reCAPTCHA Enterprise settings
2. **Site key mismatch** between Firebase and Google Cloud Console
3. **Billing not enabled** on the Google Cloud project
4. **API not enabled** - reCAPTCHA Enterprise API
5. **Wrong reCAPTCHA type** - should be "Score-based (v3)" not "Checkbox"

## 📞 If You Need Help

If you're still stuck after following this guide:

1. Run the diagnostic script and share the console output
2. Check the Network tab in DevTools for the exact error response
3. Verify each step in the checklist above

The configuration changes should resolve the 400 error and allow Firebase App Check to work properly with your Netlify deployment.
