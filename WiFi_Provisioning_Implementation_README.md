# ESP32 WiFi Provisioning Implementation

This folder contains the complete implementation of WiFi provisioning for ESP32 farm sensors, allowing new devices to be easily configured and registered with your Firebase-based farm monitoring system.

## Files Overview

### 1. Arduino Code (`wifi_provisioning.ino`)
- Complete ESP32 sketch with captive portal
- HTML-based setup interface
- WiFi configuration and Firebase registration
- Deep sleep functionality for power management
- Auto-restart after successful setup

### 2. Firebase Cloud Functions (`deviceRegistration.js`)
- `registerDevice` - HTTP endpoint for ESP32 device registration
- `generateRegistrationCode` - Callable function for web app
- `cleanupExpiredCodes` - Scheduled cleanup of expired codes
- `deviceHeartbeat` - Endpoint for device status updates

### 3. React Component (`DeviceProvisioning.tsx`)
- User-friendly interface for generating registration codes
- QR code generation for mobile setup
- Step-by-step setup instructions
- Real-time code expiry tracking

### 4. Device Service (`deviceService.ts`)
- TypeScript service for device management
- Registration code generation and management
- Device CRUD operations
- Status monitoring and analytics

### 5. Firebase Security Rules (`firestore.rules`)
- Secure access control for device self-registration
- User-based farm access controls
- Device authentication for data uploads
- Protected admin operations

## Setup Instructions

### 1. Arduino Setup

1. Install required libraries in Arduino IDE:
   ```
   - ESP32 board package
   - WiFi library (built-in)
   - WebServer library (built-in)
   - DNSServer library (built-in)
   - ArduinoJson library
   - HTTPClient library (built-in)
   ```

2. Update the Firebase configuration in `wifi_provisioning.ino`:
   ```cpp
   const char* FIREBASE_FUNCTION_URL = "https://us-central1-YOUR-PROJECT.cloudfunctions.net/registerDevice";
   ```

3. Flash the code to your ESP32 device

### 2. Firebase Functions Setup

1. Navigate to your Firebase functions directory:
   ```bash
   cd path/to/your/firebase/functions
   ```

2. Install dependencies:
   ```bash
   npm install firebase-functions firebase-admin
   ```

3. Copy `deviceRegistration.js` to your functions directory

4. Update `index.js` to export the new functions:
   ```javascript
   const deviceRegistration = require('./deviceRegistration');
   exports.registerDevice = deviceRegistration.registerDevice;
   exports.generateRegistrationCode = deviceRegistration.generateRegistrationCode;
   exports.cleanupExpiredCodes = deviceRegistration.cleanupExpiredCodes;
   exports.deviceHeartbeat = deviceRegistration.deviceHeartbeat;
   ```

5. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

### 3. Web App Setup

1. Copy `DeviceProvisioning.tsx` to your React components directory

2. Update your device service with the new functions from `deviceService.ts`

3. Add the component to your routing:
   ```jsx
   import DeviceProvisioning from './components/DeviceProvisioning';
   
   // In your router
   <Route path="/devices/add" component={DeviceProvisioning} />
   ```

4. Install additional dependencies:
   ```bash
   npm install qrcode.react lucide-react
   ```

### 4. Firebase Security Rules

1. Deploy the updated Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Usage Flow

### For Users (Web App):
1. Navigate to "Add Device" page
2. Select farm and enter device details
3. Click "Generate Registration Code"
4. Follow the setup instructions or scan QR code

### For ESP32 Devices:
1. Power on the device
2. Connect to `FarmSensor_Setup` WiFi network (password: `setup123`)
3. Open `http://192.168.4.1` in browser
4. Enter WiFi credentials
5. Enter registration code from web app
6. Device automatically restarts and begins operation

## Features

### Security
- 24-hour expiry on registration codes
- One-time use codes
- Secure device authentication
- Farm-based access control

### User Experience
- Mobile-friendly setup interface
- QR code for easy code sharing
- Real-time status updates
- Clear step-by-step instructions

### Device Management
- Automatic device discovery
- Battery level monitoring
- Firmware update capability
- Deep sleep power management

### Monitoring
- Device heartbeat tracking
- Status dashboard
- Alert system for offline devices
- Usage analytics

## Troubleshooting

### Common Issues:

1. **Device won't create WiFi hotspot**
   - Check ESP32 power supply
   - Verify code is flashed correctly
   - Reset device and try again

2. **Registration code invalid**
   - Check code hasn't expired (24 hours)
   - Verify code hasn't been used already
   - Generate new code if needed

3. **Device won't connect to WiFi**
   - Verify WiFi credentials are correct
   - Check WiFi signal strength
   - Ensure network supports 2.4GHz (ESP32 requirement)

4. **Firebase registration fails**
   - Check Firebase function URL is correct
   - Verify internet connectivity
   - Check Firebase project permissions

### Debug Mode:
Enable serial monitor at 115200 baud to see detailed debug information during setup.

## Customization

### Adding Sensors:
Modify the `startSensorMode()` function in the Arduino code to initialize and read your specific sensors.

### Custom Setup Interface:
Update the HTML in `handleRoot()` function to customize the captive portal interface.

### Extended Device Information:
Add fields to the device registration payload in both Arduino and Firebase function code.

## Security Considerations

- Registration codes expire after 24 hours
- Device authentication prevents unauthorized data uploads
- Firebase rules enforce farm-based access control
- HTTPS used for all communications
- Sensitive credentials stored securely

## Power Management

The ESP32 enters deep sleep between sensor readings to conserve battery:
- Default: 5-minute reading interval
- Configurable via Firebase device settings
- Wake-up triggers: timer, external interrupt
- Battery level monitoring and low-battery alerts

## Next Steps

1. Test the complete flow with a real ESP32 device
2. Add sensor initialization code for your specific hardware
3. Customize the web interface to match your design
4. Set up monitoring and alerting for device status
5. Consider adding OTA (Over-The-Air) firmware update capability

For support or questions, refer to the main project documentation or create an issue in the repository.
