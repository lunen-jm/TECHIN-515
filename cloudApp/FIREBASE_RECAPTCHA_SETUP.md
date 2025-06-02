# Firebase ReCAPTCHA Enterprise Setup Guide

## Overview
This guide provides step-by-step instructions to fix ReCAPTCHA v3 401 errors, Firebase App Check 400 errors, and OAuth domain authorization issues for the Netlify-deployed farm monitoring app at `grainguardgix.netlify.app`.

## Current Configuration
- **ReCAPTCHA Enterprise Site Key**: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
- **Production Domain**: `grainguardgix.netlify.app`
- **Development Domain**: `localhost:3000`

## Required Configuration Steps

### 1. Google Cloud Console - ReCAPTCHA Enterprise Setup

#### Step 1.1: Navigate to Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from the project dropdown
3. In the search bar, type "reCAPTCHA Enterprise" and select it

#### Step 1.2: Configure ReCAPTCHA Site Key
1. Find the reCAPTCHA key: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
2. Click on the key to edit its configuration
3. In the **Domains** section, ensure these domains are added:
   - `grainguardgix.netlify.app`
   - `localhost` (for development)
   - `127.0.0.1` (for local development)
4. Save the changes

#### Step 1.3: Verify Integration Type
1. Ensure the integration type is set to **Website**
2. Confirm the reCAPTCHA type is **Score-based (v3)**

### 2. Firebase Console - Authentication Configuration

#### Step 2.1: Navigate to Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**

#### Step 2.2: Add Authorized Domains
1. Click **Add domain**
2. Add the following domains:
   - `grainguardgix.netlify.app`
   - `localhost` (if not already present)
3. Save the configuration

#### Step 2.3: Configure OAuth Providers
1. Go to **Authentication** → **Sign-in method**
2. For **Google** provider:
   - Ensure it's enabled
   - Verify authorized domains include `grainguardgix.netlify.app`

### 3. Firebase Console - App Check Configuration

#### Step 3.1: Navigate to App Check
1. In Firebase Console, go to **App Check**
2. Select your web app

#### Step 3.2: Configure reCAPTCHA Provider
1. Verify **reCAPTCHA Enterprise** is selected as the provider
2. Confirm the site key is: `6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC`
3. Ensure the provider is **Enabled**

#### Step 3.3: Verify Enforcement
1. Check that App Check enforcement is enabled for:
   - Firestore Database
   - Cloud Functions (if applicable)
2. For development, you can temporarily disable enforcement or use debug tokens

### 4. Netlify Configuration (if needed)

#### Step 4.1: Environment Variables
Ensure your Netlify deployment has the correct environment variables:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_APPCHECK_DEBUG_MODE=false
```

## Code Changes Made

### Updated Files:
1. **`public/index.html`** - Updated to use ReCAPTCHA Enterprise API
2. **`src/firebase/config.ts`** - Updated App Check with new site key
3. **`src/services/recaptchaService.ts`** - New service for generating ReCAPTCHA tokens
4. **`src/firebase/services/authService.ts`** - Added ReCAPTCHA token generation to auth flows
5. **`src/components/modals/DeviceSettingsModal.tsx`** - Added ReCAPTCHA protection to device operations

### ReCAPTCHA Actions Implemented:
- `LOGIN` - For email/password authentication
- `REGISTER` - For user registration
- `GOOGLE_SIGNIN` - For Google OAuth
- `FORGOT_PASSWORD` - For password reset
- `DEVICE_UPDATE` - For device information updates
- `DEVICE_SETTINGS` - For device settings changes
- `DEVICE_CALIBRATION` - For device calibration updates

## Testing the Configuration

### Step 1: Deploy and Test
1. Deploy your app to Netlify
2. Open browser developer tools
3. Navigate to `https://grainguardgix.netlify.app`

### Step 2: Monitor Console Logs
Look for these success messages:
```
Firebase App Check initialized successfully
ReCAPTCHA token generated for action: LOGIN
```

### Step 3: Check for Errors
Verify these errors are resolved:
- ❌ ReCAPTCHA v3 401 errors
- ❌ Firebase App Check 400 errors  
- ❌ OAuth domain authorization errors

## Expected Results

After completing these configuration steps:

✅ **ReCAPTCHA Enterprise** will generate tokens successfully for all protected actions
✅ **Firebase App Check** will accept tokens and provide valid App Check tokens
✅ **Authentication flows** (email/password, Google OAuth) will work without domain errors
✅ **Device operations** will be protected with ReCAPTCHA verification

## Troubleshooting

### Common Issues:

1. **ReCAPTCHA 401 Errors**
   - Verify domain is added to ReCAPTCHA site configuration
   - Check that the correct site key is being used

2. **App Check 400 Errors**
   - Ensure App Check is properly configured with the correct provider
   - Verify the site key matches between App Check and ReCAPTCHA Enterprise

3. **OAuth Domain Errors**
   - Confirm domain is added to Firebase Authentication authorized domains
   - Check Google OAuth provider configuration

### Debug Mode
For development testing, you can enable App Check debug mode:
```javascript
// In development environment
window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
```

## Security Notes
- ReCAPTCHA tokens are now generated for all critical user actions
- Device management operations are protected against automated abuse
- Firebase App Check provides additional security layer for API calls
- All authentication flows include ReCAPTCHA verification

## Next Steps
1. Complete the Firebase Console configuration steps above
2. Deploy the updated code to Netlify
3. Test all authentication and device management flows
4. Monitor Firebase Console for any remaining errors
5. Consider implementing additional ReCAPTCHA protection for other sensitive operations
