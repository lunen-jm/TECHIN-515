# Arduino Projects - ESP32 Farm Sensor System

This folder contains the ESP32 code for the farm sensor monitoring system. The devices collect environmental data and send it to Firebase for processing and display in the web application.

## Project Structure

### `/localDisplay/`
- **`display_code.ino`** - Production ESP32 code with WiFi provisioning, sensor reading, and data upload
- **`515display.ino`** - Legacy display code (deprecated)

### `/wifi_provisioning/`
- **`wifi_provisioning.ino`** - Standalone WiFi provisioning implementation for testing

### `/sensors/`
- Additional sensor-specific code and utilities

## Data Flow Architecture

### 1. ESP32 Data Collection
The ESP32 devices collect sensor data and format it as JSON:

```json
{
  "deviceId": "ESP32_XXXXXX",
  "timestamp": 1234567890,
  "temperature": 25.5,
  "humidity": 60.2,
  "co2": 400,
  "distance1": 150.0,
  "distance2": 152.0,
  "distance_avg": 151.0,
  "outdoor_temperature": 22.0,
  "wifi_rssi": -45
}
```

### 2. Firebase Cloud Function Processing
Data is sent to the `sensorData` Cloud Function which:
- Validates the device is registered
- Stores data in separate Firestore collections for each sensor type:
  - `temperature_readings` - Indoor temperature values
  - `humidity_readings` - Humidity percentage values
  - `co2_readings` - CO2 concentration values
  - `lidar_readings` - Distance measurements (grain level)
  - `outdoor_temp_readings` - Outdoor temperature values
- Updates device status and farm summaries

### 3. Web Application Display
The React web app reads from the separate collections to display:
- Real-time sensor readings
- Historical data charts
- Grain level monitoring
- Device status tracking

## Device Modes

### BLE Receiver Mode (`sensor_mode = 0`)
- Receives data from external BLE sensors
- Acts as a gateway for remote sensor networks
- Useful for sensors placed in hard-to-reach locations

### Direct Sensor Mode (`sensor_mode = 1`)
- Reads sensors directly connected to the ESP32
- DHT22 for temperature/humidity
- MH-Z19 for CO2
- SR04 ultrasonic sensors for distance/grain level
- DS18B20 for outdoor temperature

## WiFi Provisioning

Devices support automatic WiFi provisioning:
1. **First Boot**: Creates AP mode for configuration
2. **Web Interface**: Allows users to select WiFi network and enter credentials
3. **Device Registration**: Automatically registers with Firebase
4. **Normal Operation**: Connects to configured WiFi and begins sensor readings

## Hardware Requirements

- **ESP32 Development Board** (ESP32-WROOM-32)
- **e-Paper Display** (optional, for local status display)
- **Sensors** (depending on mode):
  - DHT22 (temperature/humidity)
  - MH-Z19B (CO2)
  - HC-SR04 (ultrasonic distance)
  - DS18B20 (outdoor temperature)
- **NeoPixel** (status LED)

## Configuration

Device configuration is stored in EEPROM and includes:
- Device ID (auto-generated)
- WiFi credentials
- Sensor mode selection
- Farm association
- Upload intervals

## Data Validation & Error Handling

- **Network Connectivity**: Automatic reconnection on WiFi loss
- **Sensor Validation**: Checks for valid sensor readings before upload
- **Retry Logic**: Attempts data upload with exponential backoff
- **Status Monitoring**: Visual feedback via NeoPixel and display

## Development Notes

### Key Constants
```cpp
#define FIREBASE_DATA_URL "https://us-central1-your-project.cloudfunctions.net/sensorData"
#define SENSOR_INTERVAL 60000  // 1 minute between readings
#define UPLOAD_INTERVAL 300000 // 5 minutes between uploads
```

### Data Structure Compatibility
The ESP32 JSON format is designed to match the Firebase Cloud Function expectations. Any changes to the data structure should be coordinated between:
1. ESP32 JSON payload format
2. Cloud Function parameter extraction
3. Firestore collection schemas
4. Web app data reading logic

## Troubleshooting

### Common Issues
- **WiFi Connection**: Check provisioning mode, verify credentials
- **Sensor Readings**: Validate wiring and power supply
- **Data Upload**: Verify Firebase function URL and device registration
- **Display Issues**: Check e-paper connection and SPI configuration

### Debug Output
Enable serial monitoring at 115200 baud for detailed logging of:
- WiFi connection status
- Sensor reading values
- Firebase upload responses
- Error messages and stack traces