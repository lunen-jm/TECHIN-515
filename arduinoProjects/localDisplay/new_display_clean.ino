/*
 * ESP32 Farm Sensor Display - Complete Version with WiFi Provisioning
 * Combines WiFi provisioning, BLE sensor reading, e-paper display, and Firebase data transmission
 * Author: TECHIN-515 Team
 * Date: June 2, 2025
 */

/*
 * ESP32 Farm Sensor Display - Clean Version
 * 
 * DEVELOPMENT SETTINGS:
 * - FORCE_FACTORY_RESET_ON_BOOT: Set to true for development (clears all settings on boot)
 *   Set to false for production deployment
 * 
 * This code supports both BLE receiver mode and direct sensor mode.
 * The device will start in WiFi provisioning mode to configure settings.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <EEPROM.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_sleep.h>
#include <ArduinoBLE.h>
#include <Adafruit_NeoPixel.h>
#include "TFT_eSPI.h"
#include <Adafruit_GFX.h>

// Configuration Constants
const char* AP_SSID = "FarmSensor_Setup";
const char* AP_PASSWORD = "setup123";
const int DNS_PORT = 53;
const int WEB_PORT = 80;

// Hardware Pin Definitions
#define BUTTON_PIN_1 5
#define BUTTON_PIN_2 6
#define LED_PIN      44
#define NUM_PIXELS   2

// EEPROM addresses
#define EEPROM_SIZE 512
#define WIFI_SSID_ADDR 0
#define WIFI_PASS_ADDR 100
#define DEVICE_ID_ADDR 200
#define CONFIG_FLAG_ADDR 300
#define SENSOR_MODE_ADDR 310

// BLE Configuration (for sensor communication)
const char* SERVICE_UUID = "09279c9d-dd87-40d1-877b-00d951d18cda";
const char* CHARACTERISTIC_UUID = "a2670365-1a16-4ef5-a53e-371324f03243";

// Firebase configuration for grainguard-22f5a project
const char* FIREBASE_FUNCTION_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/registerDevice";
const char* FIREBASE_DATA_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData";

// Global objects
WebServer server(WEB_PORT);
DNSServer dnsServer;
Adafruit_NeoPixel pixels(NUM_PIXELS, LED_PIN, NEO_GRB + NEO_KHZ800);

#ifdef EPAPER_ENABLE // Only compile this code if the EPAPER_ENABLE is defined in User_Setup.h
EPaper epaper;
#endif

// Device configuration structure
struct DeviceConfig {
  char wifi_ssid[32];
  char wifi_password[64];
  char device_id[32];
  char registration_code[16];
  bool configured;  // Only true after successful Firebase registration
  bool wifi_saved;  // True when WiFi credentials are saved
  bool reg_code_saved;  // True when registration code is saved
  uint8_t sensor_mode; // 0=BLE receiver, 1=direct sensor reading
};

// Sensor data structure
struct SensorData {
  uint16_t distance1;
  uint16_t distance2;
  uint16_t distance_avg;
  uint16_t co2;
  float temperature;
  float humidity;
  float outdoor_temperature;
  unsigned long timestamp;
};

// Global variables
DeviceConfig config;
SensorData sensorData = {0};
BLEDevice peripheral;
BLECharacteristic dataChar;
unsigned long lastSensorRead = 0;
unsigned long lastDataUpload = 0;
const unsigned long SENSOR_INTERVAL = 30000; // 30 seconds
const unsigned long UPLOAD_INTERVAL = 300000; // 5 minutes

// Hardware and display variables
unsigned long lastDebounceTime1 = 0;
unsigned long lastDebounceTime2 = 0;
unsigned long debounceDelay = 20;

bool lastButton1State = HIGH;
bool lastButton2State = HIGH;
bool button1State = HIGH;
bool button2State = HIGH;
bool isConnected = LOW;

// Legacy global variables for backward compatibility
int distance1 = 0;
int distance2 = 0;
int distanceavg = 0;
int co2 = 400;
float temperature = 20.0;
float humidity = 50.0;
int max_distance = 800;

// Development Settings
#define FORCE_FACTORY_RESET_ON_BOOT true  // Set to false for production

// Global variables for error tracking
String lastError = "";
unsigned long lastErrorTime = 0;
bool debugMode = true; // Keep portal open for debugging

// Forward declarations
uint32_t Wheel(byte WheelPos);
void rainbowCycle(uint8_t wait);
void loadConfig();
void saveConfig();
void generateDeviceId();
void factoryReset();
void logError(String error);
void updateErrorStatus(String error);
String extractValue(String& json, const String& key);
void parseJSON(String json);
void startProvisioningMode();
bool connectToWiFi();
void handleRoot();
void handleWiFiConfig();
void handleDeviceRegistration();
void handleSensorMode();
void handleStatus();
void handleDebug();
void handleReset();
bool registerWithFirebase();
void startSensorMode();
void initializeBLE();
void initializeDirectSensors();
void handleBLEData();
void readDirectSensors();
void uploadSensorData();
void updateDisplay();
void updateStatusLED();

const unsigned char CO2[] PROGMEM = {
// 'CO2, 32x32px
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0xe0, 0x00, 
  0x00, 0x3f, 0xfc, 0x00, 0x00, 0x7f, 0xfe, 0x00, 0x00, 0xf8, 0x1f, 0x00, 0x01, 0xe0, 0x07, 0x80, 
  0x33, 0xc0, 0x03, 0xdc, 0x3f, 0x80, 0x01, 0xfc, 0x3f, 0x1c, 0x39, 0xfc, 0x0f, 0x1c, 0x38, 0xf0, 
  0x07, 0x1c, 0x38, 0xe0, 0x07, 0x1c, 0x38, 0xe0, 0x06, 0x00, 0x00, 0x60, 0x7f, 0xff, 0xff, 0xfe, 
  0x7f, 0xff, 0xff, 0xfe, 0x7f, 0xff, 0xff, 0xfe, 0x06, 0x01, 0x80, 0x60, 0x07, 0x01, 0x80, 0xe0, 
  0x07, 0x01, 0x80, 0xe0, 0x0f, 0x01, 0x80, 0xf0, 0x3f, 0x81, 0x80, 0xfc, 0x3f, 0x81, 0x81, 0xfc, 
  0x3b, 0xc1, 0x83, 0xcc, 0x01, 0xe1, 0x87, 0x80, 0x00, 0xf9, 0x9f, 0x00, 0x00, 0x7f, 0xfe, 0x00, 
  0x00, 0x3f, 0xfc, 0x00, 0x00, 0x07, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char TEMPERATURE[] PROGMEM = {
// 'Temperature, 32x32px
  0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xc0, 0x00, 0x00, 0x0f, 0xf0, 0x00, 0x00, 0x1f, 0xf8, 0x00, 
  0x00, 0x1e, 0x78, 0x00, 0x00, 0x1c, 0x38, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x18, 0x18, 0x00, 
  0x00, 0x18, 0x18, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x19, 0x98, 0x00, 0x00, 0x19, 0x98, 0x00, 
  0x00, 0x19, 0x98, 0x00, 0x00, 0x19, 0x98, 0x00, 0x00, 0x19, 0x98, 0x00, 0x00, 0x19, 0x98, 0x00, 
  0x00, 0x19, 0x98, 0x00, 0x00, 0x39, 0x9c, 0x00, 0x00, 0x79, 0x9e, 0x00, 0x00, 0x73, 0xcf, 0x00, 
  0x00, 0xe7, 0xe7, 0x00, 0x00, 0xef, 0xf7, 0x00, 0x00, 0xee, 0x77, 0x00, 0x00, 0xcc, 0x33, 0x00, 
  0x00, 0xee, 0x77, 0x00, 0x00, 0xef, 0xf7, 0x00, 0x00, 0xe7, 0xe7, 0x00, 0x00, 0xf3, 0xce, 0x00, 
  0x00, 0x7c, 0x3e, 0x00, 0x00, 0x3f, 0xfc, 0x00, 0x00, 0x1f, 0xf8, 0x00, 0x00, 0x07, 0xe0, 0x00
};

const unsigned char HUMIDITY[] PROGMEM = {
// 'Humidity, 32x32px
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x80, 0x00, 0x00, 0x03, 0xc0, 0x00, 0x00, 0x0f, 0xf0, 0x00, 
  0x00, 0x1f, 0xf8, 0x00, 0x00, 0x3e, 0x7c, 0x00, 0x00, 0x3c, 0x3c, 0x00, 0x00, 0x78, 0x1e, 0x00, 
  0x00, 0xf0, 0x0f, 0x00, 0x01, 0xe0, 0x07, 0x80, 0x01, 0xc0, 0x03, 0x80, 0x03, 0xc0, 0x03, 0xc0, 
  0x03, 0x80, 0x01, 0xc0, 0x07, 0x80, 0x01, 0xe0, 0x07, 0x00, 0x00, 0xe0, 0x07, 0x00, 0x00, 0xe0, 
  0x07, 0x00, 0x00, 0xe0, 0x07, 0x00, 0x00, 0xe0, 0x06, 0x00, 0x00, 0x60, 0x07, 0x00, 0x00, 0xe0, 
  0x07, 0x00, 0x00, 0xe0, 0x07, 0x00, 0x00, 0xe0, 0x07, 0x80, 0x00, 0xe0, 0x03, 0x80, 0x01, 0xc0, 
  0x03, 0xc0, 0x03, 0xc0, 0x01, 0xe0, 0x07, 0x80, 0x00, 0xf8, 0x1f, 0x00, 0x00, 0x7f, 0xfe, 0x00, 
  0x00, 0x3f, 0xfc, 0x00, 0x00, 0x07, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

const unsigned char CONNECTIVITY[] PROGMEM = {
// 'Connectivity, 32x32px
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xf8, 0x00, 0x00, 0xff, 0xff, 0x00, 
  0x03, 0xff, 0xff, 0xc0, 0x0f, 0xf0, 0x0f, 0xf0, 0x1f, 0x80, 0x01, 0xf8, 0x3e, 0x00, 0x00, 0x7c, 
  0x38, 0x0f, 0xf0, 0x1c, 0x30, 0x7f, 0xfe, 0x0c, 0x01, 0xff, 0xff, 0x80, 0x03, 0xf0, 0x0f, 0xc0, 
  0x03, 0xc0, 0x03, 0xc0, 0x03, 0x00, 0x00, 0xc0, 0x00, 0x07, 0xe0, 0x00, 0x00, 0x1f, 0xf8, 0x00, 
  0x00, 0x3f, 0xfc, 0x00, 0x00, 0x38, 0x1c, 0x00, 0x00, 0x30, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 
  0x00, 0x01, 0x80, 0x00, 0x00, 0x03, 0xc0, 0x00, 0x00, 0x03, 0xc0, 0x00, 0x00, 0x01, 0x80, 0x00, 
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

void setup() {
  Serial.begin(115200);
  delay(1000); // Allow serial to initialize
  
  Serial.println("=====================================");
  Serial.println("🌾 ESP32 Farm Sensor Display Starting");
  Serial.println("=====================================");
  Serial.println("📅 Complete Version - June 2, 2025");
  Serial.print("🔧 ESP32 Chip Model: ");
  Serial.println(ESP.getChipModel());
  Serial.print("🔧 CPU Frequency: ");
  Serial.print(ESP.getCpuFreqMHz());
  Serial.println(" MHz");
  Serial.print("🔧 Flash Size: ");
  Serial.print(ESP.getFlashChipSize() / (1024 * 1024));
  Serial.println(" MB");
  Serial.print("🔧 Free Heap: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
  Serial.println("-------------------------------------");
    // Initialize EEPROM
  Serial.print("📀 Initializing EEPROM... ");
  if (EEPROM.begin(EEPROM_SIZE)) {
    Serial.println("✅ Success");
  } else {
    Serial.println("❌ Failed");
  }
  
  // Perform factory reset if development flag is enabled
  #if FORCE_FACTORY_RESET_ON_BOOT
  Serial.println("⚠️  DEVELOPMENT MODE: Performing factory reset on boot...");
  factoryReset();
  delay(1000); // Give time for reset to complete
  #endif
  
  // Initialize hardware
  Serial.print("💡 Initializing NeoPixel LEDs... ");
  pixels.begin();
  pixels.show();
  Serial.println("✅ Success");
  
  Serial.print("🔘 Initializing buttons... ");
  pinMode(BUTTON_PIN_1, INPUT_PULLUP);
  pinMode(BUTTON_PIN_2, INPUT_PULLUP);
  Serial.println("✅ Success");
  
  #ifdef EPAPER_ENABLE
  Serial.print("🖥️  Initializing e-Paper display... ");
  epaper.begin();
  epaper.fillScreen(TFT_WHITE);
  Serial.println("✅ Success");
  #else
  Serial.println("🖥️  E-Paper display disabled in build");
  #endif
  
  // Load configuration from EEPROM
  Serial.print("⚙️  Loading device configuration... ");
  loadConfig();
  Serial.println("✅ Complete");
  
  // Generate unique device ID if not set
  if (strlen(config.device_id) == 0) {
    Serial.print("🆔 Generating unique device ID... ");
    generateDeviceId();
    Serial.println("✅ Generated");
  }
  
  Serial.println("-------------------------------------");
  Serial.println("📋 DEVICE CONFIGURATION:");  Serial.printf("   Device ID: %s\n", config.device_id);
  Serial.printf("   Sensor Mode: %s\n", config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  Serial.printf("   WiFi SSID: %s\n", strlen(config.wifi_ssid) > 0 ? config.wifi_ssid : "Not Set");
  Serial.printf("   Configured: %s\n", config.configured ? "Yes" : "No");
  Serial.println("-------------------------------------");
  
  // Check for manual factory reset (both buttons pressed during boot)
  if (digitalRead(BUTTON_PIN_1) == LOW && digitalRead(BUTTON_PIN_2) == LOW) {
    Serial.println("🔘 Both buttons pressed during boot - performing factory reset...");
    pixels.setPixelColor(0, pixels.Color(255, 0, 255)); // Magenta
    pixels.show();
    delay(2000); // Hold for 2 seconds to confirm
    if (digitalRead(BUTTON_PIN_1) == LOW && digitalRead(BUTTON_PIN_2) == LOW) {
      factoryReset();
      delay(1000);
      // Reload config after reset
      loadConfig();
      if (strlen(config.device_id) == 0) {
        generateDeviceId();
      }
    }
  }
  
  // Check if device is already configured
  if (config.configured && strlen(config.wifi_ssid) > 0) {
    Serial.println("🔄 Device is fully configured, attempting WiFi connection...");
    if (connectToWiFi()) {
      Serial.println("✅ WiFi connected successfully! Starting sensor mode...");
      startSensorMode();
      return;
    } else {
      Serial.println("❌ Failed to connect to saved WiFi, starting provisioning mode...");
    }
  } else {
    Serial.println("🛠️  Device not configured, starting provisioning mode...");
  }
  
  // Start provisioning mode
  startProvisioningMode();
}

void loop() {
  // Check if device is configured and WiFi is connected
  if (config.configured && WiFi.status() == WL_CONNECTED) {
    // Normal sensor operation mode
    sensorLoop();
  } else {
    // Provisioning mode
    dnsServer.processNextRequest();
    server.handleClient();
    
    // Debug WiFi status periodically in provisioning mode
    static unsigned long lastWiFiDebug = 0;
    unsigned long currentTime = millis();
    if (currentTime - lastWiFiDebug >= 10000) {
      Serial.printf("🛠️  Provisioning Mode → WiFi Status: %s | AP Clients: %d | Free Heap: %d\n",
                    WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected",
                    WiFi.softAPgetStationNum(),
                    ESP.getFreeHeap());
      lastWiFiDebug = currentTime;
    }
  }
  
  delay(10);
}

void sensorLoop() {
  unsigned long currentTime = millis();
  static unsigned long lastDebugTime = 0;
  
  // Debug sensor loop status every 60 seconds
  if (currentTime - lastDebugTime >= 60000) {
    Serial.printf("📊 Sensor Loop Status → Uptime: %lu min | WiFi RSSI: %d dBm | Free Heap: %d bytes\n",
                  currentTime / 60000, WiFi.RSSI(), ESP.getFreeHeap());
    lastDebugTime = currentTime;
  }
  
  // Read sensors based on mode
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    Serial.printf("⏰ Sensor read interval reached (%lu ms since last read)\n", currentTime - lastSensorRead);
    
    if (config.sensor_mode == 0) {
      // BLE receiver mode - maintain BLE connection and read data
      Serial.println("📶 Processing BLE data...");
      handleBLEData();
    } else {
      // Direct sensor reading mode
      Serial.println("🔧 Reading direct sensors...");
      readDirectSensors();
    }
    
    // Update display
    Serial.print("🖥️  Updating display... ");
    updateDisplay();
    Serial.println("✅ Display update complete");
    
    lastSensorRead = currentTime;
  }
  
  // Upload data to Firebase
  if (currentTime - lastDataUpload >= UPLOAD_INTERVAL) {
    Serial.printf("📡 Data upload interval reached (%lu ms since last upload)\n", currentTime - lastDataUpload);
    uploadSensorData();
    lastDataUpload = currentTime;
  }
  
  // Handle BLE polling if in receiver mode
  if (config.sensor_mode == 0) {
    BLE.poll();
  }
  
  // Handle button inputs for legacy compatibility
  handleButtonInputs();
}

void handleButtonInputs() {
  int reading1 = digitalRead(BUTTON_PIN_1);
  int reading2 = digitalRead(BUTTON_PIN_2);

  if (reading1 != lastButton1State) {
    lastDebounceTime1 = millis();
  }

  if ((millis() - lastDebounceTime1) > debounceDelay) {
    if (reading1 != button1State) {
      button1State = reading1;
      if (button1State == LOW) {
        Serial.println("Button1 Pressed!");
      }
    }
  }

  lastButton1State = reading1;

  if (reading2 != lastButton2State) {
    lastDebounceTime2 = millis();
  }

  if ((millis() - lastDebounceTime2) > debounceDelay) {
    if (reading2 != button2State) {
      button2State = reading2;
      if (button2State == LOW) {
        Serial.println("Button2 Pressed!");
        max_distance = distanceavg;
      }
    }
  }

  lastButton2State = reading2;
}

// Configuration Management Functions
void loadConfig() {
  Serial.print("📀 Loading configuration from EEPROM... ");
  
  // Initialize config structure to ensure clean state
  memset(&config, 0, sizeof(config));
    EEPROM.get(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.get(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.get(DEVICE_ID_ADDR, config.device_id);
  
  // Read sensor mode and validate it
  byte sensorModeValue = EEPROM.read(SENSOR_MODE_ADDR);
  if (sensorModeValue == 0 || sensorModeValue == 1) {
    config.sensor_mode = sensorModeValue;
  } else {
    // Invalid or uninitialized value, default to BLE receiver mode
    config.sensor_mode = 0;
    Serial.printf("⚠️  Invalid sensor mode value (0x%02X), defaulting to BLE mode\n", sensorModeValue);
  }
  
  // Check configuration flag
  byte flag = EEPROM.read(CONFIG_FLAG_ADDR);
  config.configured = (flag == 0xAA);
  
  // Ensure null termination
  config.wifi_ssid[31] = '\0';
  config.wifi_password[63] = '\0';
  config.device_id[31] = '\0';
  
  // Check if device ID is empty or contains invalid characters and regenerate if needed
  bool needNewId = false;
  if (strlen(config.device_id) == 0) {
    needNewId = true;
    Serial.println("⚠️  Device ID is empty");
  } else {
    // Check for non-printable characters
    for (int i = 0; i < strlen(config.device_id); i++) {
      if (config.device_id[i] < 32 || config.device_id[i] > 126) {
        needNewId = true;
        Serial.println("⚠️  Device ID contains invalid characters");
        break;
      }
    }
  }
  
  if (needNewId) {
    generateDeviceId();
    saveConfig();
  }
  
  Serial.println("✅ Configuration loaded");
}

void saveConfig() {
  Serial.print("💾 Saving configuration to EEPROM... ");
  
  EEPROM.put(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.put(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.put(DEVICE_ID_ADDR, config.device_id);
  EEPROM.write(SENSOR_MODE_ADDR, config.sensor_mode);
  EEPROM.write(CONFIG_FLAG_ADDR, config.configured ? 0xAA : 0x00);
  
  if (EEPROM.commit()) {
    Serial.println("✅ Success");
  } else {
    Serial.println("❌ Failed");
  }
}

void factoryReset() {
  Serial.println("🏭 PERFORMING FACTORY RESET...");
  Serial.println("   Clearing all EEPROM data...");
  
  // Clear all EEPROM data
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0xFF);
  }
  
  if (EEPROM.commit()) {
    Serial.println("   ✅ EEPROM cleared successfully");
  } else {
    Serial.println("   ❌ Failed to clear EEPROM");
  }
  
  // Reset configuration structure
  memset(&config, 0, sizeof(config));
  config.configured = false;
  config.sensor_mode = 0; // Default to BLE receiver mode
  
  // Clear WiFi credentials
  WiFi.disconnect(true);  // true = clear stored credentials
  Serial.println("   ✅ WiFi credentials cleared");
    Serial.println("🏭 Factory reset complete - device will start in provisioning mode");
}

void logError(String error) {
  lastError = error;
  lastErrorTime = millis();
  Serial.println("❌ ERROR: " + error);
  
  // Set LED to red to indicate error
  pixels.setPixelColor(0, pixels.Color(255, 0, 0));
  pixels.show();
}

void updateErrorStatus(String error) {
  logError(error);
  // In debug mode, we don't restart the ESP32 so the portal stays open
  if (debugMode) {
    Serial.println("🐛 DEBUG MODE: Portal will stay open for debugging");
  }
}

void generateDeviceId() {
  String macAddress = WiFi.macAddress();
  macAddress.replace(":", "");
  macAddress.toLowerCase();
  
  String deviceId = "esp32_" + macAddress.substring(6); // Use last 6 characters
  deviceId.toCharArray(config.device_id, sizeof(config.device_id));
  
  Serial.printf("Generated Device ID: %s\n", config.device_id);
}

// Helper to extract values from JSON-like strings
String extractValue(String& json, const String& key) {
  int startIndex = json.indexOf("\"" + key + "\":");
  if (startIndex == -1) return "";
  startIndex += key.length() + 3;
  int endIndex = json.indexOf(",", startIndex);
  if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
  return json.substring(startIndex, endIndex);
}

// Parse JSON string into variables
void parseJSON(String json) {
  distance1   = extractValue(json, "d1").toInt();
  distance2   = extractValue(json, "d2").toInt();
  distanceavg = (distance1+distance2)/2;
  co2         = extractValue(json, "co2").toInt();
  temperature = extractValue(json, "t").toFloat();
  humidity    = extractValue(json, "h").toFloat();

  Serial.print("📊 Parsed → D1: "); Serial.print(distance1);
  Serial.print(" | D2: "); Serial.print(distance2);
  Serial.print(" | DA: "); Serial.print(distanceavg);
  Serial.print(" | CO2: "); Serial.print(co2);
  Serial.print(" | Temp: "); Serial.print(temperature);
  Serial.print(" | Hum: "); Serial.println(humidity);
}

// WiFi Provisioning Functions
void startProvisioningMode() {
  Serial.println("=====================================");
  Serial.println("🛠️  STARTING WIFI PROVISIONING MODE");
  Serial.println("=====================================");
  
  // Set LED to indicate provisioning mode
  pixels.setPixelColor(0, pixels.Color(255, 165, 0)); // Orange
  pixels.show();
  Serial.println("💡 LED set to ORANGE (Provisioning Mode)");
  
  // Configure WiFi AP
  Serial.print("📡 Setting up WiFi Access Point... ");
  WiFi.mode(WIFI_AP);
  if (WiFi.softAP(AP_SSID, AP_PASSWORD)) {
    Serial.println("✅ Success");
    Serial.printf("   📡 SSID: %s\n", AP_SSID);
    Serial.printf("   📡 Password: %s\n", AP_PASSWORD);
    Serial.printf("   📡 IP Address: %s\n", WiFi.softAPIP().toString().c_str());
    Serial.printf("   📡 MAC Address: %s\n", WiFi.softAPmacAddress().c_str());
  } else {
    Serial.println("❌ Failed to start Access Point");
    return;
  }
  
  // Start DNS server for captive portal
  Serial.print("🌐 Starting DNS server for captive portal... ");
  if (dnsServer.start(DNS_PORT, "*", WiFi.softAPIP())) {
    Serial.println("✅ Success");
    Serial.printf("   🌐 DNS Port: %d\n", DNS_PORT);
  } else {
    Serial.println("❌ Failed to start DNS server");
  }
  
  // Setup web server routes
  Serial.print("🌍 Setting up web server routes... ");
  server.on("/", handleRoot);
  server.on("/wifi", handleWiFiConfig);
  server.on("/register", handleDeviceRegistration);  server.on("/mode", handleSensorMode);
  server.on("/status", handleStatus);
  server.on("/debug", handleDebug);
  server.on("/reset", handleReset);
  server.onNotFound(handleRoot);
  
  server.begin();
  Serial.println("✅ Web server started");
  Serial.printf("   🌍 Port: %d\n", WEB_PORT);
  
  Serial.println("=====================================");
  Serial.println("📱 PROVISIONING INSTRUCTIONS:");
  Serial.printf("   1. Connect to WiFi: %s\n", AP_SSID);
  Serial.printf("   2. Password: %s\n", AP_PASSWORD);
  Serial.println("   3. Open browser to: http://192.168.4.1");
  Serial.println("   4. Follow setup wizard");
  Serial.println("=====================================");
}

bool connectToWiFi() {
  Serial.printf("🔗 Attempting to connect to WiFi: %s\n", config.wifi_ssid);
  
  // Use dual mode to keep AP active while connecting to WiFi
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(config.wifi_ssid, config.wifi_password);
  
  int attempts = 0;
  const int maxAttempts = 20;
  
  pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow for connecting
  pixels.show();
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Blink LED while connecting
    if (attempts % 2 == 0) {
      pixels.setPixelColor(0, pixels.Color(255, 255, 0));
    } else {
      pixels.setPixelColor(0, pixels.Color(0, 0, 0));
    }
    pixels.show();
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.printf("✅ WiFi connected successfully!\n");
    Serial.printf("🌐 Access Point remains active for device registration\n");
    Serial.printf("   📡 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("   📡 RSSI: %d dBm\n", WiFi.RSSI());
    
    pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green for connected
    pixels.show();
    
    return true;
  } else {
    Serial.println();
    Serial.printf("❌ WiFi connection failed after %d attempts\n", attempts);
    Serial.printf("   📡 Status: %d\n", WiFi.status());
    
    // Return to AP mode to maintain provisioning portal
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // Red for failed
    pixels.show();
    
    return false;
  }
}

// Web Server Handler Functions
void handleRoot() {
  String html = "<!DOCTYPE html>";
  html += "<html>";
  html += "<head>";
  html += "<title>Farm Sensor Setup</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>";
  html += "body { font-family: Arial; margin: 20px; background: #f5f5f5; }";
  html += ".container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
  html += "input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }";
  html += "button { background: #4CAF50; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; margin: 5px 0; }";
  html += "button:hover { background: #45a049; }";
  html += ".status { padding: 10px; margin: 10px 0; border-radius: 4px; display: none; }";
  html += ".success { background: #d4edda; color: #155724; }";
  html += ".error { background: #f8d7da; color: #721c24; }";
  html += ".info { background: #d1ecf1; color: #0c5460; }";
  html += ".step { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }";
  html += ".step-number { background: #007bff; color: white; border-radius: 50%; padding: 5px 10px; margin-right: 10px; font-weight: bold; }";
  html += ".device-info { background: #e9ecef; padding: 10px; border-radius: 5px; margin: 10px 0; }";
  html += ".hidden { display: none; }";
  html += "</style>";
  html += "</head>";
  html += "<body>";
  html += "<div class='container'>";
  html += "<h2>🌾 Farm Sensor Setup</h2>";
  html += "<div class='device-info'>";
  html += "<strong>Device ID:</strong> " + String(config.device_id);
  html += "</div>";  html += "</div>";
  
  html += "<div class='step'>";
  html += "<span class='step-number'>1</span>";
  html += "<strong>Connect to WiFi</strong>";
  html += "<form id='wifiForm'>";
  html += "<input type='text' id='ssid' placeholder='WiFi Network Name' required>";
  html += "<input type='password' id='password' placeholder='WiFi Password' required>";
  html += "<button type='submit'>Connect to WiFi</button>";
  html += "</form>";
  html += "</div>";
    html += "<div class='step'>";
  html += "<span class='step-number'>2</span>";
  html += "<strong>Sensor Mode</strong>";
  html += "<form id='modeForm' class='hidden'>";
  html += "<select id='sensorMode' required>";
  html += "<option value='0'>BLE Receiver Mode</option>";
  html += "<option value='1'>Direct Sensor Mode</option>";
  html += "</select>";
  html += "<button type='submit'>Set Mode</button>";
  html += "</form>";
  html += "</div>";
  
  html += "<div class='step'>";
  html += "<span class='step-number'>3</span>";
  html += "<strong>Register Device</strong>";
  html += "<form id='registerForm' class='hidden'>";
  html += "<input type='text' id='regCode' placeholder='Registration Code from App' required>";
  html += "<button type='submit'>Register Device</button>";
  html += "</form>";
  html += "</div>";
  
  html += "<div id='status'></div>";
  html += "<div style='margin-top: 30px; text-align: center;'>";
  html += "<button onclick=\"location.href='/status'\" style='background: #6c757d;'>Check Status</button>";
  html += "<button onclick='toggleDebugMode()' id='debugBtn' style='background: #17a2b8; margin-left: 10px;'>Toggle Debug Mode</button>";
  html += "<button onclick=\"location.href='/reset'\" style='background: #dc3545; margin-left: 10px;'>Reset Device</button>";  html += "</div>";
  html += "</div>";
  
  // Add JavaScript section
  html += "<script>";
  html += "function showStatus(message, type) {";
  html += "var status = document.getElementById('status');";
  html += "status.textContent = message;";
  html += "status.className = 'status ' + type;";
  html += "status.style.display = 'block';";
  html += "}";
    html += "document.getElementById('wifiForm').addEventListener('submit', function(e) {";
  html += "e.preventDefault();";
  html += "var ssid = document.getElementById('ssid').value;";
  html += "var password = document.getElementById('password').value;";
  html += "showStatus('Connecting to WiFi...', 'info');";
  html += "var xhr = new XMLHttpRequest();";
  html += "xhr.open('POST', '/wifi', true);";
  html += "xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');";
  html += "xhr.onreadystatechange = function() {";
  html += "if (xhr.readyState === 4) {";
  html += "if (xhr.status === 200) {";
  html += "showStatus('WiFi connected successfully! Please proceed to step 2.', 'success');";
  html += "document.getElementById('modeForm').classList.remove('hidden');";
  html += "} else {";
  html += "showStatus('WiFi connection failed: ' + xhr.responseText, 'error');";
  html += "}";
  html += "}";
  html += "};";
  html += "xhr.onerror = function() {";
  html += "showStatus('Error: Connection failed', 'error');";
  html += "};";
  html += "xhr.send('ssid=' + encodeURIComponent(ssid) + '&password=' + encodeURIComponent(password));";
  html += "});";
    html += "document.getElementById('registerForm').addEventListener('submit', function(e) {";
  html += "e.preventDefault();";
  html += "var regCode = document.getElementById('regCode').value;";
  html += "showStatus('Registering device...', 'info');";
  html += "var xhr = new XMLHttpRequest();";
  html += "xhr.open('POST', '/register', true);";
  html += "xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');";
  html += "xhr.onreadystatechange = function() {";
  html += "if (xhr.readyState === 4) {";
  html += "if (xhr.status === 200) {";
  html += "showStatus('Setup complete! Device will restart in 5 seconds...', 'success');";
  html += "setTimeout(function() {";
  html += "location.href = '/status';";
  html += "}, 5000);";
  html += "} else {";
  html += "showStatus('Registration failed: ' + xhr.responseText, 'error');";
  html += "}";
  html += "}";
  html += "};";
  html += "xhr.onerror = function() {";
  html += "showStatus('Error: Connection failed', 'error');";
  html += "};";
  html += "xhr.send('code=' + encodeURIComponent(regCode));";
  html += "});";
    html += "document.getElementById('modeForm').addEventListener('submit', function(e) {";
  html += "e.preventDefault();";
  html += "var mode = document.getElementById('sensorMode').value;";
  html += "showStatus('Setting sensor mode...', 'info');";
  html += "var xhr = new XMLHttpRequest();";
  html += "xhr.open('POST', '/mode', true);";
  html += "xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');";
  html += "xhr.onreadystatechange = function() {";
  html += "if (xhr.readyState === 4) {";
  html += "if (xhr.status === 200) {";
  html += "showStatus('Sensor mode set successfully! Please proceed to step 3.', 'success');";
  html += "document.getElementById('registerForm').classList.remove('hidden');";
  html += "} else {";
  html += "showStatus('Mode setting failed: ' + xhr.responseText, 'error');";
  html += "}";
  html += "}";
  html += "};";
  html += "xhr.onerror = function() {";
  html += "showStatus('Error: Connection failed', 'error');";
  html += "};";
  html += "xhr.send('mode=' + encodeURIComponent(mode));";
  html += "});";
  
  html += "function toggleDebugMode() {";
  html += "var xhr = new XMLHttpRequest();";
  html += "xhr.open('POST', '/debug', true);";
  html += "xhr.onreadystatechange = function() {";
  html += "if (xhr.readyState === 4) {";
  html += "if (xhr.status === 200) {";
  html += "showStatus('Debug mode: ' + xhr.responseText, 'info');";
  html += "updateDebugButton();";
  html += "} else {";
  html += "showStatus('Error: Debug toggle failed', 'error');";
  html += "}";
  html += "}";
  html += "};";
  html += "xhr.onerror = function() {";
  html += "showStatus('Error: Connection failed', 'error');";
  html += "};";
  html += "xhr.send();";
  html += "}";
  
  html += "function updateDebugButton() {";
  html += "var btn = document.getElementById('debugBtn');";
  html += "btn.textContent = 'Debug: " + String(debugMode ? "ON" : "OFF") + "';";
  html += "}";
  
  html += "updateDebugButton();";
  html += "</script>";
  html += "</body>";
  html += "</html>";
  
  server.send(200, "text/html", html);
}

void handleWiFiConfig() {
  if (server.method() == HTTP_POST) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    Serial.printf("📡 Received WiFi config: SSID=%s\n", ssid.c_str());
    
    if (ssid.length() == 0) {
      String error = "SSID cannot be empty";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    if (ssid.length() >= 32) {
      String error = "SSID too long (max 31 characters)";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    if (password.length() >= 64) {
      String error = "Password too long (max 63 characters)";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    // Store credentials
    ssid.toCharArray(config.wifi_ssid, sizeof(config.wifi_ssid));
    password.toCharArray(config.wifi_password, sizeof(config.wifi_password));
    
    Serial.println("🔗 Testing WiFi connection...");
    pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow for testing
    pixels.show();
    
    if (connectToWiFi()) {
      config.wifi_saved = true;
      saveConfig();
      server.send(200, "text/plain", "WiFi connected successfully! IP: " + WiFi.localIP().toString());
      Serial.println("✅ WiFi configured and connected");
      lastError = ""; // Clear any previous errors
    } else {
      String error = "Failed to connect to WiFi '" + ssid + "'. Check SSID and password. WiFi Status: " + String(WiFi.status());
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      Serial.println("❌ WiFi connection test failed");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleDeviceRegistration() {
  if (server.method() == HTTP_POST) {
    String regCode = server.arg("code");
    
    Serial.printf("📝 Received registration code: %s\n", regCode.c_str());
    Serial.printf("🔧 Current sensor mode in config: %d\n", config.sensor_mode);
    
    if (regCode.length() == 0) {
      String error = "Registration code cannot be empty";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
      String error = "WiFi not connected. Please configure WiFi first.";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    regCode.toCharArray(config.registration_code, sizeof(config.registration_code));
    
    Serial.println("🔐 Attempting Firebase registration...");
    pixels.setPixelColor(0, pixels.Color(0, 0, 255)); // Blue for registering
    pixels.show();
      if (registerWithFirebase()) {
      config.reg_code_saved = true;
      saveConfig();
      
      server.send(200, "text/plain", "Device registered successfully! Setup complete. Device will restart in 5 seconds...");
      Serial.println("✅ Device registered with Firebase - Setup complete!");
      Serial.println("🔄 Restarting device in 5 seconds...");
      
      pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green for success
      pixels.show();
      
      lastError = ""; // Clear any previous errors
      
      delay(5000); // Give user time to read the success message
      ESP.restart(); // Only restart after successful registration
    } else {
      String error = "Firebase registration failed. Check registration code and network connection. Last error: " + lastError;
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      Serial.println("❌ Firebase registration failed");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleSensorMode() {
  if (server.method() == HTTP_POST) {
    String mode = server.arg("mode");
    
    Serial.printf("🔧 Setting sensor mode: %s\n", mode.c_str());
    
    if (mode != "0" && mode != "1") {
      String error = "Invalid sensor mode. Must be 0 (BLE Receiver) or 1 (Direct Sensors)";
      updateErrorStatus(error);
      server.send(400, "text/plain", error);
      return;
    }
    
    config.sensor_mode = mode.toInt();
    config.configured = true;
    
    Serial.printf("🔧 Sensor mode set to: %d\n", config.sensor_mode);
    Serial.println("💾 Saving configuration...");
    saveConfig();
    Serial.printf("🔧 Sensor mode after save: %d\n", config.sensor_mode);
      String successMsg = "Sensor mode set to: " + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
    
    server.send(200, "text/plain", successMsg + " - Please proceed to device registration (Step 3)");
    Serial.println("✅ Sensor mode configured! Ready for device registration step.");
    pixels.setPixelColor(0, pixels.Color(0, 255, 255)); // Cyan for sensor mode set
    pixels.show();
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleStatus() {
  String html = "<!DOCTYPE html><html><head><title>Device Status</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>body{font-family:Arial;margin:20px;background:#f5f5f5;}";
  html += ".container{max-width:600px;margin:0 auto;background:white;padding:20px;border-radius:8px;}";
  html += ".status-good{color:#155724;background:#d4edda;padding:10px;border-radius:5px;margin:5px 0;}";
  html += ".status-bad{color:#721c24;background:#f8d7da;padding:10px;border-radius:5px;margin:5px 0;}";
  html += ".status-warning{color:#856404;background:#fff3cd;padding:10px;border-radius:5px;margin:5px 0;}";
  html += "button{background:#007bff;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;margin:5px;}";
  html += ".refresh{background:#28a745;} .reset{background:#dc3545;}";
  html += "</style></head><body><div class='container'>";
  
  html += "<h1>🌾 Device Status</h1>";
    // Device Information
  html += "<h3>📋 Device Information</h3>";
  html += "<p><strong>Device ID:</strong> " + String(config.device_id) + "</p>";
  html += "<p><strong>MAC Address:</strong> " + WiFi.macAddress() + "</p>";
  html += "<p><strong>Chip Model:</strong> " + String(ESP.getChipModel()) + "</p>";
  html += "<p><strong>Free Heap:</strong> " + String(ESP.getFreeHeap()) + " bytes</p>";
  html += "<p><strong>Uptime:</strong> " + String(millis() / 1000) + " seconds</p>";
  
  // WiFi Status
  html += "<h3>📡 WiFi Status</h3>";
  if (WiFi.status() == WL_CONNECTED) {
    html += "<div class='status-good'>✅ Connected to: " + String(config.wifi_ssid) + "</div>";
    html += "<p><strong>IP Address:</strong> " + WiFi.localIP().toString() + "</p>";
    html += "<p><strong>Signal Strength:</strong> " + String(WiFi.RSSI()) + " dBm</p>";
  } else {
    html += "<div class='status-bad'>❌ Not Connected (Status: " + String(WiFi.status()) + ")</div>";
    html += "<p><strong>Configured SSID:</strong> " + String(config.wifi_ssid) + "</p>";
  }
  
  // Configuration Status
  html += "<h3>⚙️ Configuration Status</h3>";
  html += "<p><strong>Configured:</strong> " + String(config.configured ? "Yes" : "No") + "</p>";
  html += "<p><strong>Sensor Mode:</strong> " + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors") + "</p>";
  html += "<p><strong>WiFi Saved:</strong> " + String(config.wifi_saved ? "Yes" : "No") + "</p>";
  html += "<p><strong>Registration Saved:</strong> " + String(config.reg_code_saved ? "Yes" : "No") + "</p>";
  
  // Error Status
  html += "<h3>🚨 Error Status</h3>";
  if (lastError.length() > 0) {
    html += "<div class='status-bad'>❌ Last Error: " + lastError + "</div>";
    html += "<p><strong>Error Time:</strong> " + String((millis() - lastErrorTime) / 1000) + " seconds ago</p>";
  } else {
    html += "<div class='status-good'>✅ No recent errors</div>";
  }
  
  // Debug Mode Status
  html += "<h3>🐛 Debug Mode</h3>";
  if (debugMode) {
    html += "<div class='status-warning'>⚠️ Debug mode is ON - Portal will stay open</div>";
    html += "<p>To disable debug mode and allow normal restarts, set debugMode = false in code</p>";
  } else {
    html += "<div class='status-good'>✅ Debug mode is OFF - Normal operation</div>";
  }
    // Action Buttons
  html += "<h3>🔧 Actions</h3>";
  html += "<button class='refresh' onclick='location.reload()'>🔄 Refresh Status</button>";
  html += "<button onclick='location.href=\"/\"'>🏠 Setup Home</button>";
  html += "<button onclick='toggleDebugMode()' style='background: #17a2b8;'>🐛 Toggle Debug Mode</button>";
  html += "<button class='reset' onclick='if(confirm(\"Reset device?\")) location.href=\"/reset\"'>🔄 Factory Reset</button>";
    html += "<script>";
  html += "function toggleDebugMode() {";
  html += "  var xhr = new XMLHttpRequest();";
  html += "  xhr.open('POST', '/debug', true);";
  html += "  xhr.onreadystatechange = function() {";
  html += "    if (xhr.readyState === 4) {";
  html += "      if (xhr.status === 200) {";
  html += "        alert('Debug mode: ' + xhr.responseText);";
  html += "        location.reload();";
  html += "      } else {";
  html += "        alert('Error: Debug toggle failed');";
  html += "      }";
  html += "    }";
  html += "  };";
  html += "  xhr.send();";
  html += "}";
  html += "</script>";
  
  html += "</div></body></html>";
    server.send(200, "text/html", html);
}

void handleDebug() {
  Serial.println("🐛 Debug mode toggle requested");
  
  if (server.method() == HTTP_POST) {
    // Toggle debug mode
    debugMode = !debugMode;
    
    Serial.printf("🐛 Debug mode toggled to: %s\n", debugMode ? "ON" : "OFF");
    
    // Send response
    String response = "Debug mode ";
    response += debugMode ? "enabled" : "disabled";
    server.send(200, "text/plain", response);
    
    // Log the change
    logError("Debug mode " + String(debugMode ? "enabled" : "disabled") + " via web interface");
  } else {
    // GET request - return current debug mode status
    String status = debugMode ? "enabled" : "disabled";
    server.send(200, "text/plain", "Debug mode is " + status);
  }
}

void handleReset() {
  Serial.println("🔄 Factory reset requested");
  
  // Clear EEPROM
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  
  server.send(200, "text/html", "<h1>Device Reset</h1><p>Device configuration cleared. Restarting...</p>");
  
  delay(2000);
  ESP.restart();
}

// Firebase Registration Function
bool registerWithFirebase() {
  if (WiFi.status() != WL_CONNECTED) {
    logError("WiFi not connected, cannot register with Firebase");
    return false;
  }
  
  Serial.println("🔐 Connecting to Firebase for device registration...");
  Serial.printf("   📡 Target URL: %s\n", FIREBASE_FUNCTION_URL);
  Serial.printf("   📶 WiFi RSSI: %d dBm\n", WiFi.RSSI());
  
  HTTPClient http;
  http.begin(FIREBASE_FUNCTION_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout
    // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["registrationCode"] = config.registration_code;
  doc["deviceType"] = "farm_sensor_display";
  doc["capabilities"] = "ble_receiver,direct_sensors,display,temperature,humidity,co2,distance";
  doc["macAddress"] = WiFi.macAddress();
  doc["sensorMode"] = config.sensor_mode;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📡 Sending registration request...");
  Serial.printf("   🔧 Sensor Mode being sent: %d\n", config.sensor_mode);
  Serial.println("   Payload: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("   📡 HTTP Response: %d\n", httpResponseCode);
    Serial.println("   📡 Response: " + response);
    
    if (httpResponseCode == 200) {
      // Parse response to check success
      DynamicJsonDocument responseDoc(1024);
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error && responseDoc["success"] == true) {
        Serial.println("✅ Device registered successfully with Firebase");
        http.end();
        return true;
      } else {
        String errorMsg = "Registration failed - Server response: " + response;
        if (responseDoc["error"]) {
          errorMsg = "Registration failed - " + String(responseDoc["error"].as<const char*>());
        }
        logError(errorMsg);
      }
    } else if (httpResponseCode == 400) {
      logError("Registration failed - Invalid registration code or device data (HTTP 400)");
    } else if (httpResponseCode == 401) {
      logError("Registration failed - Unauthorized access (HTTP 401)");
    } else if (httpResponseCode == 403) {
      logError("Registration failed - Forbidden access (HTTP 403)");
    } else if (httpResponseCode == 404) {
      logError("Registration failed - Service not found (HTTP 404)");
    } else if (httpResponseCode == 500) {
      logError("Registration failed - Server error (HTTP 500)");
    } else {
      logError("Registration failed - HTTP error: " + String(httpResponseCode));
    }
  } else {
    logError("Registration failed - Network error: " + String(httpResponseCode));
  }
  
  http.end();
  return false;
}

// Sensor Mode Functions
void startSensorMode() {
  Serial.println("=====================================");
  Serial.println("🚀 STARTING SENSOR MODE");
  Serial.println("=====================================");
  
  // Set LED to indicate sensor mode
  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green
  pixels.show();
  
  if (config.sensor_mode == 0) {
    Serial.println("📶 Initializing BLE Receiver Mode...");
    initializeBLE();
  } else {
    Serial.println("🔧 Initializing Direct Sensor Mode...");
    initializeDirectSensors();
  }
  
  // Initialize display
  #ifdef EPAPER_ENABLE
  Serial.print("🖥️  Initializing display for sensor data... ");
  epaper.fillScreen(TFT_WHITE);
  epaper.setFreeFont(&FreeSans18pt7b);
  epaper.drawString("Sensor Ready", 220, 220);
  epaper.update();
  Serial.println("✅ Success");
  #endif
  
  Serial.println("✅ Sensor mode initialization complete");
  Serial.println("=====================================");
}

void initializeBLE() {
  Serial.print("📱 Initializing BLE... ");
  
  if (!BLE.begin()) {
    Serial.println("❌ Failed to initialize BLE");
    return;
  }
  
  Serial.println("✅ BLE initialized");
  Serial.printf("   📱 Service UUID: %s\n", SERVICE_UUID);
  Serial.printf("   📱 Characteristic UUID: %s\n", CHARACTERISTIC_UUID);
  
  Serial.println("🔍 Starting BLE scan for sensor devices...");
  BLE.scanForUuid(SERVICE_UUID);
  
  #ifdef EPAPER_ENABLE
  epaper.fillScreen(TFT_WHITE);
  epaper.setFreeFont(&FreeSans18pt7b);
  epaper.drawString("Scanning BLE...", 220, 220);
  epaper.update();
  #endif
}

void initializeDirectSensors() {
  Serial.println("🔧 Initializing direct sensor interfaces...");
  // Add your direct sensor initialization code here
  // This could include I2C, SPI, or analog sensor setup
  
  Serial.println("✅ Direct sensors initialized");
}

void handleBLEData() {
  // If not connected, try to connect to the sensor peripheral
  if (!peripheral) {
    rainbowCycle(10);
    
    peripheral = BLE.available();
    if (peripheral) {
      Serial.print("✅ Found BLE device: ");
      Serial.println(peripheral.localName());
      
      pixels.setPixelColor(0, pixels.Color(0, 0, 255)); // Blue for connecting
      pixels.show();
      
      BLE.stopScan();
      
      if (peripheral.connect()) {
        Serial.println("📱 Connected to peripheral");
        
        if (peripheral.discoverAttributes()) {
          Serial.println("🔍 Attributes discovered");
          
          dataChar = peripheral.characteristic(CHARACTERISTIC_UUID);
          if (dataChar) {
            Serial.println("📊 Data characteristic found");
            isConnected = HIGH;
            pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green for connected
            pixels.show();
          } else {
            Serial.println("❌ Data characteristic not found");
            peripheral.disconnect();
          }
        } else {
          Serial.println("❌ Attribute discovery failed");
          peripheral.disconnect();
        }
      } else {
        Serial.println("❌ Failed to connect to peripheral");
      }
    }
  } else {
    // Check if still connected
    if (!peripheral.connected()) {
      Serial.println("📱 BLE connection lost, reconnecting...");
      peripheral = BLEDevice();
      dataChar = BLECharacteristic();
      isConnected = LOW;
      BLE.scanForUuid(SERVICE_UUID);
      return;
    }
    
    // Read sensor data using the correct API
    if (dataChar && dataChar.canRead()) {
      uint8_t buffer[100];
      int length = dataChar.readValue(buffer, sizeof(buffer));
      if (length > 0) {
        buffer[length] = '\0';  // Null-terminate for safe conversion
        String jsonStr = String((char*)buffer);  // Convert to String
        Serial.print("📦 Received: ");
        Serial.println(jsonStr);
        parseJSON(jsonStr);
        
        // Update both legacy and new sensor data structures
        sensorData.distance1 = distance1;
        sensorData.distance2 = distance2;
        sensorData.distance_avg = distanceavg;
        sensorData.co2 = co2;
        sensorData.temperature = temperature;
        sensorData.humidity = humidity;
        sensorData.timestamp = millis();
      }
    }
  }
}

void readDirectSensors() {
  // Placeholder for direct sensor reading
  // Replace with your actual sensor reading code
  
  Serial.println("🔧 Reading direct sensors...");
  
  // Example: Read mock sensor values
  sensorData.distance1 = random(100, 800);
  sensorData.distance2 = random(100, 800);
  sensorData.distance_avg = (sensorData.distance1 + sensorData.distance2) / 2;
  sensorData.co2 = random(400, 1200);
  sensorData.temperature = random(150, 300) / 10.0; // 15.0 to 30.0°C
  sensorData.humidity = random(300, 800) / 10.0;    // 30.0 to 80.0%
  sensorData.timestamp = millis();
  
  // Update legacy variables for display compatibility
  distance1 = sensorData.distance1;
  distance2 = sensorData.distance2;
  distanceavg = sensorData.distance_avg;
  co2 = sensorData.co2;
  temperature = sensorData.temperature;
  humidity = sensorData.humidity;
  
  Serial.printf("📊 Direct Data: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                sensorData.distance1, sensorData.distance2, sensorData.distance_avg,
                sensorData.co2, sensorData.temperature, sensorData.humidity);
}

// Data Upload and Display Functions
void uploadSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected, skipping data upload");
    return;
  }
  
  Serial.println("📡 Uploading sensor data to Firebase...");
  
  HTTPClient http;
  http.begin(FIREBASE_DATA_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["timestamp"] = sensorData.timestamp;
  doc["distance1"] = sensorData.distance1;
  doc["distance2"] = sensorData.distance2;
  doc["distance_avg"] = sensorData.distance_avg;
  doc["co2"] = sensorData.co2;
  doc["temperature"] = sensorData.temperature;
  doc["humidity"] = sensorData.humidity;
  doc["sensorMode"] = config.sensor_mode;
  doc["batteryLevel"] = 85; // Placeholder - add actual battery reading
  doc["rssi"] = WiFi.RSSI();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("   📡 Data upload response: %d\n", httpResponseCode);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Sensor data uploaded successfully");
    } else {
      Serial.println("⚠️  Data upload completed with warnings");
    }
  } else {
    Serial.printf("❌ Data upload failed: %d\n", httpResponseCode);
  }
  
  http.end();
}

void updateDisplay() {
  #ifdef EPAPER_ENABLE
  // Enhanced display with modern UI
  epaper.fillScreen(TFT_WHITE);
  epaper.drawRect(20, 20, 370, 400, TFT_BLACK);
  epaper.drawLine(20, 70, 390, 70, TFT_BLACK);

  epaper.drawRect(410, 20, 370, 85, TFT_BLACK);
  epaper.drawRect(410, 125, 370, 85, TFT_BLACK);
  epaper.drawRect(410, 230, 370, 85, TFT_BLACK);
  epaper.drawRect(410, 335, 370, 85, TFT_BLACK);

  epaper.drawBitmap(430, 46, CO2, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 151, TEMPERATURE, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 256, HUMIDITY, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 361, CONNECTIVITY, 32, 32, TFT_BLACK);

  epaper.setFreeFont(&FreeSansBold12pt7b);
  epaper.drawString("CO2 (ppm)", 478, 46+6.5);
  epaper.drawString("Temp (°C)", 478, 151+6.5);
  epaper.drawString("Hum (%)", 478, 256+6.5);
  epaper.drawString("Connection", 478, 361+6.5);

  epaper.drawString(String(co2), 704, 46+6.5);
  epaper.drawString(String(temperature, 1), 704, 151+6.5);
  epaper.drawString(String(humidity, 1), 704, 256+6.5);

  epaper.setFreeFont(&FreeSansBold18pt7b);
  epaper.drawString(String(distanceavg)+"/"+String(max_distance), 32, 32);
  epaper.drawString(String(100-distanceavg*100/max_distance)+"%", 200, 32);

  epaper.fillRect(20, 70+distanceavg*350/max_distance, 370, 350-distanceavg*350/max_distance, TFT_BLACK);

  epaper.setFreeFont(&FreeSans9pt7b);
  epaper.drawString("Connection", 20, 446);
  epaper.drawString("Add Device", 295, 446);
  epaper.drawString("Calibrate", 420, 446);
  epaper.drawString("Alert", 740, 446);

  epaper.update();
  #endif
  
  // Update LED based on sensor data
  updateStatusLED();
}

void updateStatusLED() {
  // Update LED color based on sensor readings and connection status
  if (WiFi.status() != WL_CONNECTED) {
    // Red blink for no WiFi
    static bool ledState = false;
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 1000) {
      ledState = !ledState;
      pixels.setPixelColor(0, ledState ? pixels.Color(255, 0, 0) : pixels.Color(0, 0, 0));
      pixels.show();
      lastBlink = millis();
    }
  } else if (!isConnected && config.sensor_mode == 0) {
    // Yellow for WiFi connected but no BLE
    pixels.setPixelColor(0, pixels.Color(255, 255, 0));
    pixels.show();
  } else {
    // Green for all good, with intensity based on data quality
    int intensity = map(sensorData.distance_avg, 0, max_distance, 50, 255);
    intensity = constrain(intensity, 50, 255);
    pixels.setPixelColor(0, pixels.Color(0, intensity, 0));
    pixels.show();
  }
}

// Utility Functions
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if (WheelPos < 85) {
    return pixels.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else if (WheelPos < 170) {
    WheelPos -= 85;
    return pixels.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  } else {
    WheelPos -= 170;
    return pixels.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  }
}

// Rainbow animation for connecting state
int rainbowOffset = 0;
void rainbowCycle(uint8_t wait) {
  uint32_t color = Wheel(rainbowOffset & 255);
  pixels.setPixelColor(0, color);
  pixels.show();

  rainbowOffset++;
  if (rainbowOffset >= 256) rainbowOffset = 0;

  delay(wait);
}
