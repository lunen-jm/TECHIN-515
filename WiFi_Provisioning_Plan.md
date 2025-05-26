# ESP32 WiFi Provisioning & Device Registration Plan

## Overview

This document outlines a comprehensive plan for implementing WiFi provisioning and device registration for ESP32 sensors in your farm monitoring system. The solution will allow users to easily connect new ESP32 devices to their WiFi network and register them in the Firebase database through your web application.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32 Device  │    │   Web App       │    │   Firebase DB   │
│                 │    │                 │    │                 │
│ • AP Mode       │◄──►│ • Device Setup  │◄──►│ • Device Mgmt   │
│ • WiFi Client   │    │ • Provisioning  │    │ • User Auth     │
│ • HTTP Server   │    │ • Registration  │    │ • Data Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Phase 1: ESP32 Captive Portal Setup

### 1.1 ESP32 Software Architecture

**Core Components:**
- **WiFi Manager**: Handles AP mode and station mode switching
- **Captive Portal**: Serves configuration web interface
- **Device Registration**: Communicates with Firebase via REST API
- **Sensor Manager**: Handles all sensor readings
- **Deep Sleep Manager**: Power management for battery operation

**Required Libraries:**
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <esp_sleep.h>
```

### 1.2 Provisioning Flow

1. **First Boot**: ESP32 starts in AP mode with unique SSID
2. **Captive Portal**: User connects to ESP32 hotspot
3. **Configuration**: User enters WiFi credentials and device info
4. **Registration**: Device registers itself with Firebase
5. **Normal Operation**: Device switches to client mode and begins data transmission

### 1.3 ESP32 Code Structure

```cpp
// Main provisioning states
enum ProvisioningState {
  STATE_AP_MODE,
  STATE_CONNECTING,
  STATE_REGISTERING,
  STATE_OPERATIONAL,
  STATE_ERROR
};

// Device configuration structure
struct DeviceConfig {
  char wifi_ssid[32];
  char wifi_password[64];
  char device_name[32];
  char user_id[64];
  char farm_id[64];
  char device_type[32];
  bool is_configured;
};
```

### 1.4 Captive Portal HTML Interface

The ESP32 will serve a simple but effective configuration page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Farm Sensor Setup</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; 
                    padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; 
                       border-radius: 4px; box-sizing: border-box; }
        button { background: #4CAF50; color: white; padding: 12px; border: none; 
                border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🚜 Farm Sensor Setup</h2>
        <form id="configForm">
            <h3>WiFi Configuration</h3>
            <select id="ssid" name="ssid" required></select>
            <input type="password" id="password" name="password" placeholder="WiFi Password" required>
            
            <h3>Device Information</h3>
            <input type="text" id="deviceName" name="deviceName" placeholder="Device Name (e.g., Grain Bin #1)" required>
            <select id="deviceType" name="deviceType" required>
                <option value="">Select Device Type</option>
                <option value="Wheat">Wheat Storage</option>
                <option value="Corn">Corn Storage</option>
                <option value="Soybean">Soybean Storage</option>
                <option value="Rice">Rice Storage</option>
                <option value="Barley">Barley Storage</option>
                <option value="Oats">Oats Storage</option>
                <option value="Other">Other</option>
            </select>
            
            <h3>Registration</h3>
            <input type="text" id="registrationCode" name="registrationCode" 
                   placeholder="Registration Code (from web app)" required>
            
            <button type="submit">Configure Device</button>
        </form>
        <div id="status"></div>
    </div>
    
    <script>
        // JavaScript for handling form submission and status updates
        // Will communicate with ESP32 endpoints
    </script>
</body>
</html>
```

## Phase 2: Web App Device Registration System

### 2.1 Registration Code Generation

Add a new component to your web app for generating temporary registration codes:

**New Firebase Collection: `registration_codes`**
```javascript
{
  code: "ABC123XYZ",
  userId: "user_id_here",
  farmId: "farm_id_here", 
  expiresAt: timestamp,
  isUsed: false,
  createdAt: timestamp
}
```

### 2.2 Web App Components

**New React Component: `DeviceProvisioning.tsx`**
```tsx
import React, { useState } from 'react';
import { Button, TextField, Card, Typography, Box } from '@mui/material';

const DeviceProvisioning: React.FC = () => {
  const [registrationCode, setRegistrationCode] = useState('');
  
  const generateCode = async () => {
    // Generate 9-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 11).toUpperCase();
    
    // Save to Firebase with expiration (24 hours)
    await addDoc(collection(db, 'registration_codes'), {
      code,
      userId: currentUser.uid,
      farmId: selectedFarmId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
      createdAt: new Date()
    });
    
    setRegistrationCode(code);
  };

  return (
    <Card sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Add New Device
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Generate a registration code to connect a new ESP32 sensor device.
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={generateCode}
        fullWidth
        sx={{ mb: 2 }}
      >
        Generate Registration Code
      </Button>
      
      {registrationCode && (
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="success.contrastText">
            {registrationCode}
          </Typography>
          <Typography variant="body2" color="success.contrastText">
            Code expires in 24 hours
          </Typography>
        </Box>
      )}
    </Card>
  );
};
```

### 2.3 Device Registration API Endpoint

Since Firebase doesn't support direct REST API calls from ESP32 easily, create a cloud function or use your web app as a proxy:

**Firebase Cloud Function: `registerDevice`**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.registerDevice = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  try {
    const { registrationCode, deviceName, deviceType, macAddress } = req.body;
    
    // Validate registration code
    const codeDoc = await admin.firestore()
      .collection('registration_codes')
      .where('code', '==', registrationCode)
      .where('isUsed', '==', false)
      .where('expiresAt', '>', new Date())
      .limit(1)
      .get();
    
    if (codeDoc.empty) {
      return res.status(400).json({ error: 'Invalid or expired registration code' });
    }
    
    const codeData = codeDoc.docs[0].data();
    
    // Create device with MAC address as device ID
    const deviceId = `esp32_${macAddress.replace(/:/g, '').toLowerCase()}`;
    
    await admin.firestore().collection('devices').doc(deviceId).set({
      name: deviceName,
      type: deviceType,
      registeredFarm: codeData.farmId,
      userId: codeData.userId,
      macAddress: macAddress,
      isActive: true,
      lowBattery: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      registrationCode: registrationCode
    });
    
    // Mark code as used
    await codeDoc.docs[0].ref.update({ isUsed: true });
    
    // Add device to farm
    await admin.firestore().collection('farmDevices').add({
      farmId: codeData.farmId,
      deviceId: deviceId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ 
      success: true, 
      deviceId: deviceId,
      message: 'Device registered successfully' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Phase 3: ESP32 Implementation Details

### 3.1 Main Arduino Sketch Structure

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// Configuration
const char* AP_SSID = "FarmSensor-Setup";
const char* AP_PASSWORD = "configure";
const char* FIREBASE_FUNCTION_URL = "https://your-region-your-project.cloudfunctions.net/registerDevice";

// Global objects
WebServer server(80);
DNSServer dnsServer;
Preferences preferences;
DeviceConfig config;

void setup() {
  Serial.begin(115200);
  
  // Load configuration from flash
  loadConfig();
  
  if (!config.is_configured) {
    startProvisioningMode();
  } else {
    startNormalOperation();
  }
}

void loop() {
  switch (currentState) {
    case STATE_AP_MODE:
      dnsServer.processNextRequest();
      server.handleClient();
      break;
      
    case STATE_OPERATIONAL:
      handleSensorReadings();
      break;
      
    case STATE_ERROR:
      handleError();
      break;
  }
  
  delay(100);
}

void startProvisioningMode() {
  Serial.println("Starting provisioning mode...");
  
  // Create unique AP name with MAC address
  String apName = "FarmSensor-" + WiFi.macAddress().substring(12);
  apName.replace(":", "");
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(apName.c_str(), AP_PASSWORD);
  
  // Start DNS server for captive portal
  dnsServer.start(53, "*", WiFi.softAPIP());
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/scan", handleWifiScan);
  server.on("/configure", HTTP_POST, handleConfigure);
  server.on("/status", handleStatus);
  server.onNotFound(handleNotFound);
  
  server.begin();
  currentState = STATE_AP_MODE;
}

void handleConfigure() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");
  String deviceName = server.arg("deviceName");
  String deviceType = server.arg("deviceType");
  String registrationCode = server.arg("registrationCode");
  
  // Save WiFi credentials
  strcpy(config.wifi_ssid, ssid.c_str());
  strcpy(config.wifi_password, password.c_str());
  strcpy(config.device_name, deviceName.c_str());
  strcpy(config.device_type, deviceType.c_str());
  
  // Try to connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(config.wifi_ssid, config.wifi_password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    // Register device with Firebase
    if (registerWithFirebase(registrationCode)) {
      config.is_configured = true;
      saveConfig();
      server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Device configured successfully\"}");
      delay(2000);
      ESP.restart();
    } else {
      server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Registration failed\"}");
    }
  } else {
    server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"WiFi connection failed\"}");
  }
}

bool registerWithFirebase(String registrationCode) {
  HTTPClient http;
  http.begin(FIREBASE_FUNCTION_URL);
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(1024);
  doc["registrationCode"] = registrationCode;
  doc["deviceName"] = config.device_name;
  doc["deviceType"] = config.device_type;
  doc["macAddress"] = WiFi.macAddress();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument responseDoc(1024);
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"] == true) {
      strcpy(config.device_id, responseDoc["deviceId"]);
      return true;
    }
  }
  
  http.end();
  return false;
}
```

### 3.2 Sensor Data Transmission

```cpp
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    reconnectWiFi();
    return;
  }
  
  // Read sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  float co2 = readCO2();
  float lidar = readLidar();
  float outdoorTemp = readOutdoorTemperature();
  
  // Send to Firebase via your web app's API or Cloud Function
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["timestamp"] = getTimestamp();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["co2"] = co2;
  doc["lidar"] = lidar;
  doc["outdoorTemp"] = outdoorTemp;
  doc["batteryLevel"] = readBatteryLevel();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  HTTPClient http;
  http.begin("https://your-region-your-project.cloudfunctions.net/receiveSensorData");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    Serial.println("Data sent successfully");
  } else {
    Serial.println("Failed to send data");
  }
  
  http.end();
}
```

## Phase 4: Power Management & Deep Sleep

### 4.1 Battery Optimization

```cpp
void enterDeepSleep() {
  // Configure wake up every 15 minutes
  esp_sleep_enable_timer_wakeup(15 * 60 * 1000000); // 15 minutes in microseconds
  
  // Disable WiFi and Bluetooth
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  btStop();
  
  // Configure wake up pin for manual wake (optional)
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_33, 0);
  
  Serial.println("Going to sleep...");
  Serial.flush();
  
  esp_deep_sleep_start();
}

void handleWakeUp() {
  // Check wake up reason
  esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
  
  switch (wakeup_reason) {
    case ESP_SLEEP_WAKEUP_TIMER:
      Serial.println("Woken up by timer");
      break;
    case ESP_SLEEP_WAKEUP_EXT0:
      Serial.println("Woken up by external signal");
      break;
    default:
      Serial.println("Not a deep sleep wake up");
      break;
  }
}
```

## Phase 5: Web App Integration

### 5.1 Device Management Interface

Add to your existing React app:

```tsx
// DeviceManagement.tsx
const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState([]);
  const [showProvisioning, setShowProvisioning] = useState(false);
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowProvisioning(true)}
        >
          Add New Device
        </Button>
      </Box>
      
      {showProvisioning && (
        <DeviceProvisioning onClose={() => setShowProvisioning(false)} />
      )}
      
      <Grid container spacing={3}>
        {devices.map(device => (
          <Grid item xs={12} md={6} lg={4} key={device.id}>
            <DeviceCard device={device} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
```

### 5.2 Real-time Device Status

```tsx
// Add to your existing DeviceCard component
const [deviceStatus, setDeviceStatus] = useState('unknown');

useEffect(() => {
  // Listen for real-time updates
  const unsubscribe = onSnapshot(
    doc(db, 'devices', device.id),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setDeviceStatus(data.isActive ? 'online' : 'offline');
      }
    }
  );
  
  return () => unsubscribe();
}, [device.id]);
```

## Phase 6: Security Considerations

### 6.1 Authentication & Authorization

1. **Registration Codes**: Time-limited (24 hours) and single-use
2. **Device Authentication**: Use MAC address + registration code validation
3. **Data Transmission**: Use HTTPS for all communications
4. **Firebase Rules**: Restrict device creation to authenticated users

### 6.2 Firebase Security Rules Update

```javascript
// Add to your existing Firestore rules
match /registration_codes/{codeId} {
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  allow read, update: if request.auth != null && 
                         resource.data.userId == request.auth.uid;
}

match /devices/{deviceId} {
  allow read: if true;
  allow create: if true; // Allow devices to self-register
  allow update: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
}
```

## Phase 7: Testing & Deployment

### 7.1 Testing Checklist

- [ ] ESP32 AP mode starts correctly
- [ ] Captive portal loads on mobile devices
- [ ] WiFi scanning works
- [ ] Device registration succeeds
- [ ] Sensor data transmission works
- [ ] Deep sleep and wake up functions
- [ ] Battery level monitoring
- [ ] Error handling and recovery
- [ ] Web app integration
- [ ] Real-time updates

### 7.2 Deployment Steps

1. **Prepare ESP32 firmware** with your WiFi credentials fallback
2. **Deploy Firebase Cloud Functions** for device registration
3. **Update web app** with device management components
4. **Update Firebase security rules**
5. **Test complete flow** from provisioning to data transmission
6. **Create user documentation** for device setup process

## Phase 8: User Experience Flow

### 8.1 Complete User Journey

1. **User logs into web app**
2. **Generates registration code** in Device Management section
3. **Powers on new ESP32 device**
4. **Connects to device WiFi hotspot** (FarmSensor-XXXXXX)
5. **Browser redirects to captive portal**
6. **Enters WiFi credentials, device name, and registration code**
7. **Device connects to WiFi and registers with Firebase**
8. **Device appears in web app** within 30 seconds
9. **Device begins sending sensor data** every 15 minutes

### 8.2 Error Handling

- **Invalid registration code**: Clear error message with link to generate new code
- **WiFi connection failure**: Option to try different network or re-enter credentials
- **Registration timeout**: Automatic retry with exponential backoff
- **Sensor failures**: Alert system in web app with diagnostic information

## Cost & Hardware Considerations

### Components per Device:
- ESP32-WROOM-32: ~$3-5
- Temperature/Humidity sensor (DHT22): ~$2-3
- CO2 sensor (MH-Z19): ~$15-20
- LiDAR sensor (VL53L0X): ~$5-8
- Outdoor temperature sensor: ~$2-3
- Battery management: ~$5-10
- Enclosure: ~$10-15

**Total per device: ~$42-64**

### Power Consumption:
- Active mode: ~240mA
- Deep sleep: ~10µA
- With 15-minute intervals: ~6-12 months battery life (3000mAh Li-ion)

## Future Enhancements

1. **OTA Updates**: Implement over-the-air firmware updates
2. **Mesh Networking**: ESP-NOW for devices without direct WiFi access
3. **Edge Processing**: Local data processing and anomaly detection
4. **Mobile App**: Dedicated mobile app for field technicians
5. **Advanced Analytics**: Machine learning for predictive maintenance

This comprehensive plan provides a robust foundation for WiFi provisioning and device management in your farm sensor network. The modular approach allows for gradual implementation and testing of each component.
