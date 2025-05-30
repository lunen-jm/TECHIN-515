/*
 * ESP32 Farm Sensor Display - Production Version
 * Combines WiFi provisioning, sensor reading, e-paper display, and Firebase data transmission
 * Author: TECHIN-515 Team
 * Date: May 27, 2025
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

#ifdef EPAPER_ENABLE
EPaper epaper;
#endif

// Device configuration structure
struct DeviceConfig {
  char wifi_ssid[32];
  char wifi_password[64];
  char device_id[32];
  char registration_code[16];
  bool configured;
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

// Icon bitmaps for e-paper display
const unsigned char CO2[] PROGMEM = {
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
  Serial.println("📅 Production Version - May 27, 2025");
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
  
  // Initialize hardware
  Serial.print("💡 Initializing NeoPixel LEDs... ");
  pixels.begin();
  pixels.show();
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
  Serial.println("📋 DEVICE CONFIGURATION:");
  Serial.printf("   Device ID: %s\n", config.device_id);
  Serial.printf("   Sensor Mode: %s\n", config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  Serial.printf("   WiFi SSID: %s\n", strlen(config.wifi_ssid) > 0 ? config.wifi_ssid : "Not Set");
  Serial.printf("   Configured: %s\n", config.configured ? "Yes" : "No");
  Serial.println("-------------------------------------");
  
  // Check if device is already configured
  if (config.configured && strlen(config.wifi_ssid) > 0) {
    Serial.println("🔄 Device is configured, attempting WiFi connection...");
    if (connectToWiFi()) {
      Serial.println("✅ Connected to WiFi successfully!");
      Serial.println("🚀 Starting normal sensor operation mode...");
      startSensorMode();
      return;
    } else {
      Serial.println("❌ Failed to connect to saved WiFi");
      Serial.println("🔄 Falling back to provisioning mode...");
    }
  } else {
    Serial.println("⚠️  Device not configured or missing WiFi credentials");
  }
  
  // Start provisioning mode
  Serial.println("🛠️  Starting provisioning mode...");
  startProvisioningMode();
  Serial.println("✅ Setup complete - device ready for configuration");
}

void loop() {
  static unsigned long lastLoopTime = 0;
  static unsigned long loopCounter = 0;
  unsigned long currentTime = millis();
  
  // Debug loop performance every 30 seconds
  if (currentTime - lastLoopTime >= 30000) {
    Serial.printf("🔄 Loop Performance → Iterations: %lu | Free Heap: %d bytes | Uptime: %lu ms\n", 
                  loopCounter, ESP.getFreeHeap(), currentTime);
    lastLoopTime = currentTime;
    loopCounter = 0;
  }
  loopCounter++;
  
  if (config.configured && WiFi.status() == WL_CONNECTED) {
    // Normal sensor operation mode
    sensorLoop();
  } else {
    // Provisioning mode
    dnsServer.processNextRequest();
    server.handleClient();
    
    // Debug WiFi status periodically in provisioning mode
    static unsigned long lastWiFiDebug = 0;
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
}

void loadConfig() {
  Serial.print("📀 Loading configuration from EEPROM... ");
  
  // Initialize config structure to ensure clean state
  memset(&config, 0, sizeof(config));
  
  EEPROM.get(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.get(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.get(DEVICE_ID_ADDR, config.device_id);
  config.sensor_mode = EEPROM.read(SENSOR_MODE_ADDR);
  
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
        Serial.printf("⚠️  Device ID contains invalid character at position %d (0x%02X)\n", i, config.device_id[i]);
        break;
      }
    }
  }
  
  if (needNewId) {
    Serial.println("🔄 Regenerating device ID...");
    generateDeviceId();
    saveConfig(); // Save the new device ID immediately
  }
  
  Serial.println("✅ Configuration loaded");
  Serial.printf("   📋 Config Flag: 0x%02X (%s)\n", flag, config.configured ? "Valid" : "Invalid");
  Serial.printf("   📋 Sensor Mode: %d (%s)\n", config.sensor_mode, config.sensor_mode == 0 ? "BLE" : "Direct");
  Serial.printf("   📋 WiFi SSID Length: %d\n", strlen(config.wifi_ssid));
  Serial.printf("   📋 Device ID: '%s' (Length: %d)\n", config.device_id, strlen(config.device_id));
}

void saveConfig() {
  Serial.print("💾 Saving configuration to EEPROM... ");
  
  EEPROM.put(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.put(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.put(DEVICE_ID_ADDR, config.device_id);
  EEPROM.write(SENSOR_MODE_ADDR, config.sensor_mode);
  EEPROM.write(CONFIG_FLAG_ADDR, 0xAA);
  
  if (EEPROM.commit()) {
    config.configured = true;
    Serial.println("✅ Configuration saved successfully");
    Serial.printf("   💾 SSID: %s\n", config.wifi_ssid);
    Serial.printf("   💾 Sensor Mode: %d\n", config.sensor_mode);
    Serial.printf("   💾 Device ID: %s\n", config.device_id);
  } else {
    Serial.println("❌ Failed to save configuration to EEPROM");
  }
}

void generateDeviceId() {
  Serial.print("🆔 Generating unique device ID... ");
  
  uint64_t chipid = ESP.getEfuseMac();
  snprintf(config.device_id, sizeof(config.device_id), "ESP32_%04X%04X", 
           (uint16_t)(chipid >> 32), (uint16_t)chipid);
  
  Serial.printf("✅ Generated ID: %s\n", config.device_id);
  Serial.printf("   🔧 Base MAC: %012llX\n", chipid);
}

// HTML escaping function to prevent character encoding issues
String htmlEscape(const String& str) {
  String escaped = str;
  escaped.replace("&", "&amp;");
  escaped.replace("<", "&lt;");
  escaped.replace(">", "&gt;");
  escaped.replace("\"", "&quot;");
  escaped.replace("'", "&#39;");
  return escaped;
}

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
  server.on("/register", handleDeviceRegistration);
  server.on("/mode", handleSensorMode);
  server.on("/status", handleStatus);
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

void startSensorMode() {
  Serial.println("=====================================");
  Serial.println("🚀 STARTING SENSOR OPERATION MODE");
  Serial.println("=====================================");
  
  // Set LED to indicate normal operation
  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green
  pixels.show();
  Serial.println("💡 LED set to GREEN (Normal Operation)");
  
  // Initialize BLE if in receiver mode
  if (config.sensor_mode == 0) {
    Serial.print("📶 Initializing BLE for receiver mode... ");
    if (!BLE.begin()) {
      Serial.println("❌ Failed to initialize BLE");
      Serial.println("🔄 Falling back to direct sensor mode...");
      config.sensor_mode = 1; // Fall back to direct sensor mode
      saveConfig();
    } else {
      Serial.println("✅ BLE initialized successfully");
      Serial.printf("   📶 Service UUID: %s\n", SERVICE_UUID);
      Serial.printf("   📶 Characteristic UUID: %s\n", CHARACTERISTIC_UUID);
      Serial.println("🔍 Starting BLE scan for sensor devices...");
      BLE.scanForUuid(SERVICE_UUID);
    }
  }
  
  // Initialize direct sensors if needed
  if (config.sensor_mode == 1) {
    Serial.println("🔧 Initializing direct sensor mode...");
    initializeDirectSensors();
  }
  
  // Initial display update
  Serial.print("🖥️  Performing initial display update... ");
  updateDisplay();
  Serial.println("✅ Display updated");
  
  Serial.println("=====================================");
  Serial.printf("✅ Sensor mode active: %s\n", config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  Serial.printf("⏱️  Sensor read interval: %lu ms\n", SENSOR_INTERVAL);
  Serial.printf("📡 Data upload interval: %lu ms\n", UPLOAD_INTERVAL);
  Serial.println("=====================================");
}

void handleBLEData() {
  // Reconnect if disconnected
  if (peripheral && !peripheral.connected()) {
    Serial.println("❌ BLE Connection Lost!");
    Serial.println("   🔌 Peripheral disconnected unexpectedly");
    Serial.println("   🔄 Resetting peripheral and starting new scan...");
    pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
    pixels.show();
    peripheral = BLEDevice();
    BLE.scanForUuid(SERVICE_UUID);
    return;
  }

  // If not connected, try to connect
  if (!peripheral) {
    peripheral = BLE.available();
    if (peripheral) {
      Serial.println("=====================================");
      Serial.println("📶 BLE DEVICE DISCOVERY");
      Serial.println("=====================================");
      Serial.printf("✅ Found BLE device: %s\n", peripheral.localName().c_str());
      Serial.printf("   📍 Address: %s\n", peripheral.address().c_str());
      Serial.printf("   📡 RSSI: %d dBm\n", peripheral.rssi());
      Serial.println("🔗 Attempting connection...");

      if (peripheral.connect()) {
        Serial.println("✅ BLE Connection successful!");
        Serial.println("🔍 Discovering services...");
        pixels.setPixelColor(1, pixels.Color(0, 0, 255)); // Blue
        pixels.show();
        
        if (peripheral.discoverService(SERVICE_UUID)) {
          Serial.println("✅ Service discovered successfully");
          Serial.printf("   🔧 Service UUID: %s\n", SERVICE_UUID);
          Serial.println("🔍 Looking for data characteristic...");
          
          dataChar = peripheral.characteristic(CHARACTERISTIC_UUID);
          if (!dataChar) {
            Serial.println("❌ Failed to find data characteristic");
            Serial.printf("   ❌ Expected UUID: %s\n", CHARACTERISTIC_UUID);
            pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
            pixels.show();
            peripheral.disconnect();
          } else {
            Serial.println("✅ Data characteristic found!");
            Serial.printf("   🔧 Characteristic UUID: %s\n", CHARACTERISTIC_UUID);
            Serial.printf("   📋 Properties: %s%s%s%s\n",
                          dataChar.canRead() ? "Read " : "",
                          dataChar.canWrite() ? "Write " : "",
                          dataChar.canNotify() ? "Notify " : "",
                          dataChar.canIndicate() ? "Indicate " : "");
            
            pixels.setPixelColor(1, pixels.Color(0, 255, 0)); // Green
            pixels.show();
            
            if (dataChar.canNotify()) {
              Serial.println("📡 Subscribing to notifications...");
              dataChar.subscribe();
            }
            Serial.println("=====================================");
          }
        } else {
          Serial.println("❌ Failed to discover BLE service");
          Serial.printf("   ❌ Expected service UUID: %s\n", SERVICE_UUID);
          pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
          pixels.show();
          peripheral.disconnect();
        }
      } else {
        Serial.println("❌ BLE Connection failed");
        Serial.println("   🔄 Will retry on next scan cycle");
        pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
        pixels.show();
      }
    }
    return;
  }

  // Check for new data
  if (dataChar && dataChar.valueUpdated()) {
    int length = dataChar.valueLength();
    uint8_t buffer[100];
    dataChar.readValue(buffer, length);
    buffer[length] = '\0';

    String jsonStr = String((char*)buffer);
    Serial.println("=====================================");
    Serial.println("📦 NEW BLE DATA RECEIVED");
    Serial.println("=====================================");
    Serial.printf("📊 Raw Data (%d bytes): %s\n", length, jsonStr.c_str());

    parseBLEData(jsonStr);
    sensorData.timestamp = millis();
    Serial.printf("⏰ Timestamp: %lu ms\n", sensorData.timestamp);
    Serial.println("=====================================");
  }
}

void readDirectSensors() {
  Serial.println("=====================================");
  Serial.println("🔧 READING DIRECT SENSORS");
  Serial.println("=====================================");
  
  // TODO: Implement direct sensor reading
  // This would include:
  // - Temperature/humidity sensor (DHT22, SHT30, etc.)
  // - CO2 sensor (MH-Z19, SCD30, etc.)
  // - Distance sensors (ultrasonic, LiDAR)
  // - Outdoor temperature sensor
  
  Serial.println("⚠️  Using simulated sensor data (replace with actual sensors)");
  
  // Placeholder values - replace with actual sensor reading code
  float oldTemp = sensorData.temperature;
  float oldHum = sensorData.humidity;
  uint16_t oldCO2 = sensorData.co2;
  
  sensorData.temperature = 22.5 + (random(-50, 50) / 10.0);
  sensorData.humidity = 65.0 + (random(-100, 100) / 10.0);
  sensorData.co2 = 400 + random(0, 200);
  sensorData.distance1 = 100 + random(0, 600);
  sensorData.distance2 = 100 + random(0, 600);
  sensorData.distance_avg = (sensorData.distance1 + sensorData.distance2) / 2;
  sensorData.outdoor_temperature = 18.0 + (random(-100, 100) / 10.0);
  sensorData.timestamp = millis();
  
  Serial.println("📊 SENSOR READINGS:");
  Serial.printf("   🌡️  Temperature: %.1f°C (Δ%.1f°C)\n", sensorData.temperature, sensorData.temperature - oldTemp);
  Serial.printf("   💧 Humidity: %.1f%% (Δ%.1f%%)\n", sensorData.humidity, sensorData.humidity - oldHum);
  Serial.printf("   🌬️  CO2: %d ppm (Δ%d ppm)\n", sensorData.co2, sensorData.co2 - oldCO2);
  Serial.printf("   📏 Distance 1: %d cm\n", sensorData.distance1);
  Serial.printf("   📏 Distance 2: %d cm\n", sensorData.distance2);
  Serial.printf("   📏 Distance Avg: %d cm\n", sensorData.distance_avg);
  Serial.printf("   🌡️  Outdoor Temp: %.1f°C\n", sensorData.outdoor_temperature);
  Serial.printf("   ⏰ Timestamp: %lu ms\n", sensorData.timestamp);
  
  // Calculate fill percentage
  int fillPercent = max(0, min(100, 100 - sensorData.distance_avg * 100 / 700));
  Serial.printf("   📊 Fill Level: %d%%\n", fillPercent);
  Serial.println("=====================================");
}

void initializeDirectSensors() {
  Serial.println("=====================================");
  Serial.println("🔧 INITIALIZING DIRECT SENSORS");
  Serial.println("=====================================");
  
  // TODO: Initialize actual sensors
  // - I2C sensors
  // - Analog sensors  
  // - Digital sensors
  
  Serial.println("📋 Sensor initialization checklist:");
  Serial.println("   ⚠️  Temperature/Humidity sensor (DHT22/SHT30) - Not implemented");
  Serial.println("   ⚠️  CO2 sensor (MH-Z19/SCD30) - Not implemented");
  Serial.println("   ⚠️  Distance sensors (Ultrasonic/LiDAR) - Not implemented");
  Serial.println("   ⚠️  Outdoor temperature sensor - Not implemented");
  Serial.println("   ⚠️  I2C bus initialization - Not implemented");
  Serial.println("   ⚠️  Analog input configuration - Not implemented");
  
  Serial.println("🔧 Current mode: Simulated sensor data");
  Serial.println("💡 Ready for development - add actual sensor code here");
  Serial.println("=====================================");
}

void parseBLEData(String json) {
  Serial.println("🔍 PARSING BLE JSON DATA");
  Serial.printf("   📄 Raw JSON: %s\n", json.c_str());
  
  // Store old values for comparison
  uint16_t oldD1 = sensorData.distance1;
  uint16_t oldD2 = sensorData.distance2;
  uint16_t oldCO2 = sensorData.co2;
  float oldTemp = sensorData.temperature;
  float oldHum = sensorData.humidity;
  
  sensorData.distance1 = extractValue(json, "d1").toInt();
  sensorData.distance2 = extractValue(json, "d2").toInt();
  sensorData.distance_avg = (sensorData.distance1 + sensorData.distance2) / 2;
  sensorData.co2 = extractValue(json, "co2").toInt();
  sensorData.temperature = extractValue(json, "t").toFloat();
  sensorData.humidity = extractValue(json, "h").toFloat();
  
  Serial.println("📊 PARSED VALUES:");
  Serial.printf("   📏 Distance 1: %d cm (was %d, Δ%d)\n", sensorData.distance1, oldD1, sensorData.distance1 - oldD1);
  Serial.printf("   📏 Distance 2: %d cm (was %d, Δ%d)\n", sensorData.distance2, oldD2, sensorData.distance2 - oldD2);
  Serial.printf("   📏 Distance Avg: %d cm\n", sensorData.distance_avg);
  Serial.printf("   🌬️  CO2: %d ppm (was %d, Δ%d)\n", sensorData.co2, oldCO2, sensorData.co2 - oldCO2);
  Serial.printf("   🌡️  Temperature: %.1f°C (was %.1f, Δ%.1f)\n", sensorData.temperature, oldTemp, sensorData.temperature - oldTemp);
  Serial.printf("   💧 Humidity: %.1f%% (was %.1f, Δ%.1f)\n", sensorData.humidity, oldHum, sensorData.humidity - oldHum);
  
  // Calculate and display fill level
  int fillPercent = max(0, min(100, 100 - sensorData.distance_avg * 100 / 700));
  Serial.printf("   📊 Fill Level: %d%%\n", fillPercent);
}

String extractValue(String& json, const String& key) {
  Serial.printf("🔍 Extracting key '%s' from JSON... ", key.c_str());
  
  int startIndex = json.indexOf("\"" + key + "\":");
  if (startIndex == -1) {
    Serial.println("❌ Key not found");
    return "";
  }
  
  startIndex += key.length() + 3;
  int endIndex = json.indexOf(",", startIndex);
  if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
  
  String value = json.substring(startIndex, endIndex);
  value.trim(); // Remove any whitespace
  
  Serial.printf("✅ Found: '%s'\n", value.c_str());
  return value;
}

void updateDisplay() {
  #ifdef EPAPER_ENABLE
  epaper.fillScreen(TFT_WHITE);
  
  // Main container and grain level display
  epaper.drawRect(20, 20, 370, 440, TFT_BLACK);
  epaper.drawLine(20, 70, 390, 70, TFT_BLACK);
  
  // Sensor data containers
  epaper.drawRect(410, 20, 370, 95, TFT_BLACK);   // CO2
  epaper.drawRect(410, 135, 370, 95, TFT_BLACK);  // Temperature
  epaper.drawRect(410, 250, 370, 95, TFT_BLACK);  // Humidity
  epaper.drawRect(410, 365, 370, 95, TFT_BLACK);  // Connectivity
  
  // Icons
  epaper.drawBitmap(430, 51.5, CO2, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 166.5, TEMPERATURE, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 281.5, HUMIDITY, 32, 32, TFT_BLACK);
  epaper.drawBitmap(430, 396.5, CONNECTIVITY, 32, 32, TFT_BLACK);

  // Labels
  epaper.setFreeFont(&FreeSansBold12pt7b);
  epaper.drawString("CO2 (ppm)", 478, 57);
  epaper.drawString("Temp (°C)", 478, 172);
  epaper.drawString("Hum (%)", 478, 287);
  epaper.drawString("WiFi Status", 478, 402);

  // Values
  epaper.drawString(String(sensorData.co2), 700, 57);
  epaper.drawString(String(sensorData.temperature, 1), 700, 172);
  epaper.drawString(String(sensorData.humidity, 1), 700, 287);
  epaper.drawString(WiFi.status() == WL_CONNECTED ? "Connected" : "Offline", 680, 402);

  // Grain level display
  epaper.setFreeFont(&FreeSansBold18pt7b);
  epaper.drawString(String(sensorData.distance_avg), 32, 50);
  int fillPercent = max(0, min(100, 100 - sensorData.distance_avg * 100 / 700));
  epaper.drawString(String(fillPercent) + "%", 200, 50);

  // Fill level visualization
  int fillHeight = sensorData.distance_avg * 390 / 700;
  epaper.fillRect(20, 70 + fillHeight, 370, 390 - fillHeight, TFT_BLACK);

  epaper.update();
  #endif
  
  Serial.printf("🖥️  Display updated - Fill: %d%% | Temp: %.1f°C | WiFi: %s\n", 
                100 - sensorData.distance_avg * 100 / 700, 
                sensorData.temperature,
                WiFi.status() == WL_CONNECTED ? "Connected" : "Offline");
}

void uploadSensorData() {
  Serial.println("=====================================");
  Serial.println("📡 UPLOADING SENSOR DATA TO FIREBASE");
  Serial.println("=====================================");
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Cannot upload data - WiFi not connected");
    Serial.printf("   📡 WiFi Status: %d\n", WiFi.status());
    return;
  }
  
  Serial.printf("📡 WiFi Connection Status: ✅ Connected (RSSI: %d dBm)\n", WiFi.RSSI());
  Serial.printf("📡 Target URL: %s\n", FIREBASE_DATA_URL);
  
  HTTPClient http;
  http.begin(FIREBASE_DATA_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout
  
  // Create JSON payload with all sensor data
  Serial.println("📦 Creating JSON payload...");
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["timestamp"] = sensorData.timestamp;
  doc["temperature"] = sensorData.temperature;
  doc["humidity"] = sensorData.humidity;
  doc["co2"] = sensorData.co2;
  doc["distance1"] = sensorData.distance1;
  doc["distance2"] = sensorData.distance2;
  doc["distance_avg"] = sensorData.distance_avg;
  doc["outdoor_temperature"] = sensorData.outdoor_temperature;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["uptime"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 JSON Payload:");
  Serial.println(jsonString);
  Serial.printf("📦 Payload size: %d bytes\n", jsonString.length());
  
  Serial.println("🚀 Sending HTTP POST request...");
  unsigned long uploadStart = millis();
  int httpResponseCode = http.POST(jsonString);
  unsigned long uploadTime = millis() - uploadStart;
  
  Serial.printf("⏱️  Upload took %lu ms\n", uploadTime);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("📡 HTTP Response Code: %d\n", httpResponseCode);
    Serial.printf("📡 Response: %s\n", response.c_str());
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data uploaded successfully!");
      pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green flash
    } else if (httpResponseCode >= 400 && httpResponseCode < 500) {
      Serial.println("⚠️  Client error - check payload format");
      pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow
    } else if (httpResponseCode >= 500) {
      Serial.println("⚠️  Server error - Firebase may be down");
      pixels.setPixelColor(0, pixels.Color(255, 165, 0)); // Orange
    } else {
      Serial.println("⚠️  Unexpected response code");
      pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow
    }
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    Serial.println("   Possible causes:");
    Serial.println("   - No internet connection");
    Serial.println("   - Firebase function offline");
    Serial.println("   - DNS resolution failed");
    Serial.println("   - Timeout occurred");
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // Red
  }
  
  pixels.show();
  http.end();
  Serial.println("=====================================");
}

// Web server handlers
void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Farm Sensor Setup</title>";
  html += "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh}";
  html += ".container{max-width:500px;margin:0 auto;background:white;padding:30px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}";
  html += "h1{color:#333;text-align:center;margin-bottom:30px}.device-info{background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #007bff}";
  html += "input,select,button{width:100%;padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:5px;box-sizing:border-box}";
  html += "button{background:#007bff;color:white;border:none;cursor:pointer;font-size:16px}button:hover{background:#0056b3}";
  html += ".step{background:#e9ecef;padding:15px;border-radius:5px;margin:10px 0}.step-number{background:#007bff;color:white;border-radius:50%;width:25px;height:25px;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;font-weight:bold}";
  html += "#status{margin-top:20px;padding:10px;border-radius:5px;display:none}.success{background:#d4edda;color:#155724;border:1px solid #c3e6cb}";
  html += ".error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}.info{background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb}</style></head>";
  html += "<body><div class='container'><h1>🌾 Farm Sensor Setup</h1>";
  html += "<div class='device-info'><strong>Device ID:</strong> " + htmlEscape(String(config.device_id)) + "<br><strong>Current Mode:</strong> " + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors") + "</div>";
  html += "<div class='step'><span class='step-number'>1</span><strong>Select Sensor Mode</strong><form id='modeForm'><select id='sensorMode' required>";
  html += "<option value='0'" + String(config.sensor_mode == 0 ? " selected" : "") + ">BLE Receiver Mode</option>";
  html += "<option value='1'" + String(config.sensor_mode == 1 ? " selected" : "") + ">Direct Sensor Mode</option>";
  html += "</select><button type='submit'>Set Mode</button></form></div>";
  html += "<div class='step'><span class='step-number'>2</span><strong>Connect to WiFi</strong><form id='wifiForm'>";
  html += "<input type='text' id='ssid' placeholder='WiFi Network Name' value='" + htmlEscape(String(config.wifi_ssid)) + "' required>";
  html += "<input type='password' id='password' placeholder='WiFi Password' required><button type='submit'>Connect to WiFi</button></form></div>";
  html += "<div class='step'><span class='step-number'>3</span><strong>Register Device</strong><form id='registerForm' style='display:none;'>";
  html += "<input type='text' id='regCode' placeholder='Registration Code from App' required><button type='submit'>Register Device</button></form></div>";  html += "<div id='status'></div><div style='margin-top:30px;text-align:center;'>";
  html += "<button onclick=\"location.href='/status'\" style='background:#6c757d;width:48%;margin-right:2%;'>Status</button>";
  html += "<button onclick=\"location.href='/reset'\" style='background:#dc3545;width:48%;'>Reset</button></div></div>";
  
  // Add JavaScript
  html += "<script>";
  html += "document.getElementById('modeForm').addEventListener('submit', async function(e) {";
  html += "e.preventDefault(); const mode = document.getElementById('sensorMode').value;";
  html += "showStatus('Setting sensor mode...', 'info');";
  html += "try { const response = await fetch('/mode', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'mode=' + mode });";
  html += "const result = await response.text(); if (response.ok) { showStatus('Sensor mode updated successfully!', 'success'); } else { showStatus('Failed to update mode: ' + result, 'error'); }";
  html += "} catch (error) { showStatus('Error: ' + error.message, 'error'); } });";
  
  html += "document.getElementById('wifiForm').addEventListener('submit', async function(e) {";
  html += "e.preventDefault(); const ssid = document.getElementById('ssid').value; const password = document.getElementById('password').value;";
  html += "showStatus('Connecting to WiFi...', 'info');";
  html += "try { const response = await fetch('/wifi', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'ssid=' + encodeURIComponent(ssid) + '&password=' + encodeURIComponent(password) });";
  html += "const result = await response.text(); if (response.ok) { showStatus('WiFi connected successfully! Please proceed to step 3.', 'success'); document.getElementById('registerForm').style.display = 'block'; } else { showStatus('WiFi connection failed: ' + result, 'error'); }";
  html += "} catch (error) { showStatus('Error: ' + error.message, 'error'); } });";
  
  html += "document.getElementById('registerForm').addEventListener('submit', async function(e) {";
  html += "e.preventDefault(); const regCode = document.getElementById('regCode').value;";
  html += "showStatus('Registering device...', 'info');";
  html += "try { const response = await fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'code=' + encodeURIComponent(regCode) });";
  html += "const result = await response.text(); if (response.ok) { showStatus('Device registered successfully! Setup complete. Device will restart in 5 seconds...', 'success'); setTimeout(() => { location.href = '/status'; }, 5000); } else { showStatus('Registration failed: ' + result, 'error'); }";
  html += "} catch (error) { showStatus('Error: ' + error.message, 'error'); } });";
  
  html += "function showStatus(message, type) { const status = document.getElementById('status'); status.textContent = message; status.className = type; status.style.display = 'block'; }";
  html += "</script></body></html>";
  
  server.send(200, "text/html", html);
}

void handleSensorMode() {
  Serial.println("🔧 Sensor Mode Configuration Request Received");
  
  if (server.method() == HTTP_POST) {
    String mode = server.arg("mode");
    
    Serial.printf("📋 Mode Change Request:\n");
    Serial.printf("   🔧 Current Mode: %d (%s)\n", config.sensor_mode, 
                  config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
    Serial.printf("   🔧 Requested Mode: %s\n", mode.c_str());
    
    if (mode == "0" || mode == "1") {
      uint8_t newMode = mode.toInt();
      if (newMode != config.sensor_mode) {
        config.sensor_mode = newMode;
        saveConfig();
        server.send(200, "text/plain", "Sensor mode updated");
        Serial.printf("✅ Sensor mode updated to: %d (%s)\n", 
                      config.sensor_mode, 
                      config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
      } else {
        server.send(200, "text/plain", "Sensor mode unchanged");
        Serial.println("ℹ️  Sensor mode unchanged (already set to requested value)");
      }
    } else {
      server.send(400, "text/plain", "Invalid sensor mode");
      Serial.printf("❌ Invalid sensor mode value: %s (must be 0 or 1)\n", mode.c_str());
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
    Serial.printf("❌ Invalid HTTP method for mode config: %s\n", 
                  server.method() == HTTP_GET ? "GET" : "OTHER");
  }
}

void handleWiFiConfig() {
  Serial.println("🌐 WiFi Configuration Request Received");
  
  if (server.method() == HTTP_POST) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    Serial.printf("📋 WiFi Config Details:\n");
    Serial.printf("   📡 SSID: %s (length: %d)\n", ssid.c_str(), ssid.length());
    Serial.printf("   🔑 Password: [%d chars]\n", password.length());
    
    if (ssid.length() > 0 && ssid.length() < 32) {
      ssid.toCharArray(config.wifi_ssid, sizeof(config.wifi_ssid));
      password.toCharArray(config.wifi_password, sizeof(config.wifi_password));
      
      Serial.println("🔄 Attempting WiFi connection with new credentials...");
      
      if (connectToWiFi()) {
        saveConfig();
        server.send(200, "text/plain", "WiFi connected successfully");
        Serial.println("✅ WiFi configured and saved successfully");
      } else {
        server.send(400, "text/plain", "Failed to connect to WiFi");
        Serial.println("❌ WiFi connection failed with provided credentials");
      }
    } else {
      server.send(400, "text/plain", "Invalid SSID");
      Serial.printf("❌ Invalid SSID length: %d (must be 1-31 chars)\n", ssid.length());
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
    Serial.printf("❌ Invalid HTTP method: %s\n", server.method() == HTTP_GET ? "GET" : "OTHER");
  }
}

void handleDeviceRegistration() {
  Serial.println("🔥 Device Registration Request Received");
  
  if (server.method() == HTTP_POST) {
    String regCode = server.arg("code");
    
    Serial.printf("📋 Registration Request Details:\n");
    Serial.printf("   🔑 Registration Code: %s (length: %d)\n", regCode.c_str(), regCode.length());
    Serial.printf("   🆔 Device ID: %s\n", config.device_id);
    Serial.printf("   📡 Client IP: %s\n", server.client().remoteIP().toString().c_str());
    
    if (regCode.length() > 0) {
      regCode.toCharArray(config.registration_code, sizeof(config.registration_code));
      
      Serial.println("🚀 Starting Firebase registration process...");
      
      if (registerWithFirebase()) {
        server.send(200, "text/plain", "Device registered successfully");
        Serial.println("✅ Device registration completed successfully");
        Serial.println("🔄 Preparing for device restart...");
        
        // Restart device after successful registration
        delay(2000);
        Serial.println("🔄 Restarting ESP32...");
        ESP.restart();
      } else {
        server.send(400, "text/plain", "Registration failed");
        Serial.println("❌ Device registration failed - see details above");
      }
    } else {
      server.send(400, "text/plain", "Invalid registration code");
      Serial.println("❌ Empty or invalid registration code provided");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
    Serial.printf("❌ Invalid HTTP method for registration: %s\n", 
                  server.method() == HTTP_GET ? "GET" : "OTHER");
  }
}

void handleStatus() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Device Status</title>";
  html += "<style>body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}";
  html += ".container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}";
  html += "h1{color:#333;text-align:center}.status-item{margin:15px 0;padding:10px;background:#f8f9fa;border-radius:5px}";
  html += ".label{font-weight:bold;color:#495057}.value{color:#007bff;margin-left:10px}";
  html += "button{background:#007bff;color:white;border:none;padding:10px 20px;border-radius:5px;margin:5px;cursor:pointer}";
  html += "button:hover{background:#0056b3}</style></head><body><div class='container'>";
  html += "<h1>📊 Device Status</h1>";
  html += "<div class='status-item'><span class='label'>Device ID:</span><span class='value'>" + String(config.device_id) + "</span></div>";
  html += "<div class='status-item'><span class='label'>Sensor Mode:</span><span class='value'>" + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors") + "</span></div>";
  html += "<div class='status-item'><span class='label'>WiFi SSID:</span><span class='value'>" + String(config.wifi_ssid) + "</span></div>";
  html += "<div class='status-item'><span class='label'>WiFi Status:</span><span class='value'>" + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected") + "</span></div>";
  html += "<div class='status-item'><span class='label'>IP Address:</span><span class='value'>" + WiFi.localIP().toString() + "</span></div>";
  html += "<div class='status-item'><span class='label'>Configuration:</span><span class='value'>" + String(config.configured ? "Complete" : "Incomplete") + "</span></div>";
  html += "<div class='status-item'><span class='label'>Last Temperature:</span><span class='value'>" + String(sensorData.temperature, 1) + "°C</span></div>";
  html += "<div class='status-item'><span class='label'>Last Humidity:</span><span class='value'>" + String(sensorData.humidity, 1) + "%</span></div>";
  html += "<div class='status-item'><span class='label'>Last CO2:</span><span class='value'>" + String(sensorData.co2) + " ppm</span></div>";
  html += "<div style='text-align:center;margin-top:30px;'>";
  html += "<button onclick=\"location.href='/'\">Back to Setup</button>";
  html += "<button onclick=\"location.reload()\" style='background:#28a745;'>Refresh</button>";
  html += "</div></div></body></html>";
  
  server.send(200, "text/html", html);
}

void handleReset() {
  Serial.println("=====================================");
  Serial.println("🔄 DEVICE RESET REQUEST RECEIVED");
  Serial.println("=====================================");
  Serial.printf("📋 Current Configuration:\n");
  Serial.printf("   🆔 Device ID: %s\n", config.device_id);
  Serial.printf("   📡 WiFi SSID: %s\n", config.wifi_ssid);
  Serial.printf("   🔧 Sensor Mode: %d\n", config.sensor_mode);
  Serial.printf("   ⚙️  Configured: %s\n", config.configured ? "Yes" : "No");
  
  Serial.println("🗑️  Clearing EEPROM configuration...");
  
  // Clear EEPROM
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  
  if (EEPROM.commit()) {
    Serial.println("✅ EEPROM cleared successfully");
  } else {
    Serial.println("❌ Failed to clear EEPROM");
  }
  
  server.send(200, "text/html", 
    "<html><body style='font-family: Arial; text-align: center; margin-top: 50px;'>"
    "<h1>🔄 Device Reset</h1>"
    "<p>Device configuration cleared. Restarting...</p>"
    "<p>Device will return to provisioning mode after restart.</p>"
    "</body></html>");
  
  Serial.println("📡 Reset confirmation sent to client");
  Serial.println("⏰ Waiting 2 seconds before restart...");
  delay(2000);
  
  Serial.println("🔄 Restarting ESP32 in 3... 2... 1...");
  Serial.println("=====================================");
  ESP.restart();
}

bool connectToWiFi() {
  Serial.println("=====================================");
  Serial.println("📡 CONNECTING TO WIFI");
  Serial.println("=====================================");
  Serial.printf("🔧 SSID: %s\n", config.wifi_ssid);
  Serial.printf("🔧 Password: %s\n", strlen(config.wifi_password) > 0 ? "[HIDDEN]" : "[EMPTY]");
  
  WiFi.mode(WIFI_STA);
  Serial.println("📡 WiFi mode set to Station (STA)");
  
  Serial.println("🔄 Starting WiFi connection...");
  WiFi.begin(config.wifi_ssid, config.wifi_password);
  
  int attempts = 0;
  unsigned long startTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Show detailed status every 5 attempts
    if (attempts % 5 == 0) {
      Serial.printf("\n   📊 Attempt %d/20 | Status: %d | Time: %lu ms\n", 
                    attempts, WiFi.status(), millis() - startTime);
    }
  }
  
  Serial.println(); // New line after dots
  
  if (WiFi.status() == WL_CONNECTED) {
    unsigned long connectTime = millis() - startTime;
    Serial.println("✅ WiFi connection successful!");
    Serial.printf("   📡 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("   📡 Gateway: %s\n", WiFi.gatewayIP().toString().c_str());
    Serial.printf("   📡 DNS: %s\n", WiFi.dnsIP().toString().c_str());
    Serial.printf("   📡 Subnet Mask: %s\n", WiFi.subnetMask().toString().c_str());
    Serial.printf("   📡 MAC Address: %s\n", WiFi.macAddress().c_str());
    Serial.printf("   📶 Signal Strength (RSSI): %d dBm\n", WiFi.RSSI());
    Serial.printf("   ⏱️  Connection Time: %lu ms\n", connectTime);
    Serial.printf("   🔧 Channel: %d\n", WiFi.channel());
    Serial.println("=====================================");
    return true;
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.printf("   📊 Final Status Code: %d\n", WiFi.status());
    Serial.printf("   📊 Attempts Made: %d/20\n", attempts);
    Serial.printf("   ⏱️  Total Time: %lu ms\n", millis() - startTime);
    Serial.println("   💡 Troubleshooting tips:");
    Serial.println("      - Check SSID spelling and case sensitivity");
    Serial.println("      - Verify password is correct");
    Serial.println("      - Ensure network is 2.4GHz (not 5GHz)");
    Serial.println("      - Check if MAC filtering is enabled");
    Serial.println("      - Verify network is broadcasting (not hidden)");
    Serial.println("=====================================");
    return false;
  }
}

bool registerWithFirebase() {
  Serial.println("=====================================");
  Serial.println("🔥 REGISTERING DEVICE WITH FIREBASE");
  Serial.println("=====================================");
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected, cannot register");
    Serial.printf("   📡 WiFi Status: %d\n", WiFi.status());
    return false;
  }
  
  Serial.printf("📋 Registration Details:\n");
  Serial.printf("   🆔 Device ID: %s\n", config.device_id);
  Serial.printf("   🔑 Registration Code: %s\n", config.registration_code);
  Serial.printf("   🔧 Sensor Mode: %s\n", config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  Serial.printf("   📡 Target URL: %s\n", FIREBASE_FUNCTION_URL);
  
  HTTPClient http;
  http.begin(FIREBASE_FUNCTION_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout for registration
  
  // Create JSON payload
  Serial.println("📦 Creating registration payload...");
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["registrationCode"] = config.registration_code;
  doc["deviceType"] = "farm_sensor_display";
  doc["sensorMode"] = config.sensor_mode == 0 ? "ble_receiver" : "direct_sensors";
  doc["capabilities"] = "temperature,humidity,co2,distance,outdoor_temperature,display";
  doc["firmwareVersion"] = "1.0.0";
  doc["chipModel"] = ESP.getChipModel();
  doc["macAddress"] = WiFi.macAddress();
  doc["wifiRssi"] = WiFi.RSSI();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 Registration Payload:");
  Serial.println(jsonString);
  Serial.printf("📦 Payload size: %d bytes\n", jsonString.length());
  
  Serial.println("🚀 Sending registration request...");
  unsigned long regStart = millis();
  int httpResponseCode = http.POST(jsonString);
  unsigned long regTime = millis() - regStart;
  
  Serial.printf("⏱️  Registration took %lu ms\n", regTime);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("📡 HTTP Response Code: %d\n", httpResponseCode);
    Serial.printf("📡 Response Body: %s\n", response.c_str());
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Device registration successful!");
      Serial.println("🔄 Device will restart in 2 seconds...");
      http.end();
      return true;
    } else if (httpResponseCode == 400) {
      Serial.println("❌ Registration failed - Invalid request");
      Serial.println("   💡 Check registration code format");
    } else if (httpResponseCode == 404) {
      Serial.println("❌ Registration failed - Invalid registration code");
      Serial.println("   💡 Verify code from mobile app");
    } else if (httpResponseCode == 409) {
      Serial.println("❌ Registration failed - Device already registered");
      Serial.println("   💡 Device may already be in system");
    } else {
      Serial.printf("❌ Registration failed with code: %d\n", httpResponseCode);
    }
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    Serial.println("   Possible causes:");
    Serial.println("   - No internet connection");
    Serial.println("   - Firebase function offline");
    Serial.println("   - DNS resolution failed");
    Serial.println("   - Request timeout");
  }
  
  http.end();
  Serial.println("=====================================");
  return false;
}