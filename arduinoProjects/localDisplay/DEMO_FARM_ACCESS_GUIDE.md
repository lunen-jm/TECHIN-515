# 🏡 Demo Farm Access Guide

## Overview
The "My Test Farm" demo farm has been successfully created in Firebase with the correct user permissions. Here are the test accounts that now have access to the farm.

## ✅ Test Accounts with Farm Access

### 1. Admin Account
- **Email:** `admin@farmsensors.com`
- **Password:** `password123` (default)
- **Role:** Admin/Owner
- **User ID:** `HtuMOj7VfnSSPwPWZCx7GEAr9tC3`

### 2. Standard User Account  
- **Email:** `user@farmsensors.com`
- **Password:** `password123` (default)
- **Role:** Standard User
- **User ID:** `9tYnt2BXzqUbgYU1Bp5t6tEszrm1`

### 3. Test Account
- **Email:** `test@example.com`
- **Password:** `password123` (default) 
- **Role:** User
- **User ID:** `V3ZgACoCsdN9yOYrc1xQOINg1nq1`

### 4. Personal Test Account (if using real email)
- **Email:** `jaden.a.moon@gmail.com`
- **Password:** [Your actual password]
- **Role:** User  
- **User ID:** `IB1h5MCvcNU8AFHa5OQELFWpbwH3`

## 🎯 Testing Instructions

### Step 1: Login to Web App
1. Go to your web app URL
2. Login with one of the test accounts above
3. Navigate to the farms/dashboard section

### Step 2: Verify Farm Visibility
You should now see:
- ✅ **Farm Name:** "My Test Farm"
- ✅ **Farm ID:** `cTEUlk7fSD1hQILl4OOA`
- ✅ **Device:** "Demo Sensor" 
- ✅ **Device ID:** `JK87fJjKxZ6TgtszLcBh`

### Step 3: Test ESP32 Data
- Upload the `display_hard_code.ino` to your ESP32
- Update WiFi credentials in the code
- Watch for sensor data appearing in the web app

## 🔧 Troubleshooting

### If Farm Still Not Visible:

1. **Check Login Account**
   - Ensure you're using one of the accounts listed above
   - Try `admin@farmsensors.com` first (has highest permissions)

2. **Clear Browser Cache**
   - Refresh the page (Ctrl+F5)
   - Clear browser cache and cookies
   - Try incognito/private browsing mode

3. **Check Web App Console**
   - Open browser developer tools (F12)
   - Look for JavaScript errors in console
   - Check network tab for failed API calls

4. **Verify Firebase Rules**
   - Farm access is controlled by Firestore security rules
   - Rules check `userFarms` and `farmMembers` collections
   - Both collections were created by setupDemoData function

## 📊 Database Structure Created

The setupDemoData function created these documents:

### farms/cTEUlk7fSD1hQILl4OOA
```json
{
  "name": "My Test Farm",
  "description": "Demo farm for ESP32 display testing",
  "location": "Demo Location",
  "isDemo": true,
  "devices": ["JK87fJjKxZ6TgtszLcBh"]
}
```

### devices/JK87fJjKxZ6TgtszLcBh  
```json
{
  "name": "Demo Sensor",
  "farmId": "cTEUlk7fSD1hQILl4OOA",
  "type": "environmental",
  "isDemo": true
}
```

### For Each User: userFarms/{userId}_cTEUlk7fSD1hQILl4OOA
```json
{
  "userId": "{user_id}",
  "farmId": "cTEUlk7fSD1hQILl4OOA", 
  "farmName": "My Test Farm",
  "role": "owner",
  "permissions": ["read", "write", "admin"]
}
```

## 🚀 Next Steps

1. **Login with admin@farmsensors.com**
2. **Check if "My Test Farm" appears in the dashboard**
3. **If visible:** Success! You can now test ESP32 data upload
4. **If not visible:** Check troubleshooting steps above

## 📞 Support

If the farm is still not visible after trying all test accounts, there may be an issue with:
- Web app authentication flow
- Firestore security rules
- Frontend farm loading logic

The backend Firebase setup is confirmed working - the issue would be in the web app frontend.

**Setup completed:** June 3, 2025  
**Status:** ✅ Ready for testing
