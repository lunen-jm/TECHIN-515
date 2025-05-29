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
  EEPROM.begin(EEPROM_SIZE);
  
  // Initialize hardware
  pixels.begin();
  pixels.show();
  
  #ifdef EPAPER_ENABLE
  epaper.begin();
  epaper.fillScreen(TFT_WHITE);
  #endif
  
  // Load configuration from EEPROM
  loadConfig();
  
  // Generate unique device ID if not set
  if (strlen(config.device_id) == 0) {
    generateDeviceId();
  }
  
  Serial.println("ESP32 Farm Sensor Display - Production Version");
  Serial.printf("Device ID: %s\n", config.device_id);
  Serial.printf("Sensor Mode: %s\n", config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  
  // Check if device is already configured
  if (config.configured && strlen(config.wifi_ssid) > 0) {
    Serial.println("Device configured, attempting WiFi connection...");
    if (connectToWiFi()) {
      Serial.println("Connected to WiFi successfully!");
      startSensorMode();
      return;
    } else {
      Serial.println("Failed to connect to saved WiFi, starting provisioning mode...");
    }
  }
  
  // Start provisioning mode
  startProvisioningMode();
}

void loop() {
  if (config.configured && WiFi.status() == WL_CONNECTED) {
    // Normal sensor operation mode
    sensorLoop();
  } else {
    // Provisioning mode
    dnsServer.processNextRequest();
    server.handleClient();
  }
  
  delay(10);
}

void sensorLoop() {
  unsigned long currentTime = millis();
  
  // Read sensors based on mode
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    if (config.sensor_mode == 0) {
      // BLE receiver mode - maintain BLE connection and read data
      handleBLEData();
    } else {
      // Direct sensor reading mode
      readDirectSensors();
    }
    
    // Update display
    updateDisplay();
    
    lastSensorRead = currentTime;
  }
  
  // Upload data to Firebase
  if (currentTime - lastDataUpload >= UPLOAD_INTERVAL) {
    uploadSensorData();
    lastDataUpload = currentTime;
  }
  
  // Handle BLE polling if in receiver mode
  if (config.sensor_mode == 0) {
    BLE.poll();
  }
}

void loadConfig() {
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
}

void saveConfig() {
  EEPROM.put(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.put(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.put(DEVICE_ID_ADDR, config.device_id);
  EEPROM.write(SENSOR_MODE_ADDR, config.sensor_mode);
  EEPROM.write(CONFIG_FLAG_ADDR, 0xAA);
  EEPROM.commit();
  config.configured = true;
}

void generateDeviceId() {
  uint64_t chipid = ESP.getEfuseMac();
  snprintf(config.device_id, sizeof(config.device_id), "ESP32_%04X%04X", 
           (uint16_t)(chipid >> 32), (uint16_t)chipid);
}

void startProvisioningMode() {
  Serial.println("Starting WiFi Provisioning Mode...");
  
  // Set LED to indicate provisioning mode
  pixels.setPixelColor(0, pixels.Color(255, 165, 0)); // Orange
  pixels.show();
  
  // Configure WiFi AP
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  
  // Start DNS server for captive portal
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/wifi", handleWiFiConfig);
  server.on("/register", handleDeviceRegistration);
  server.on("/mode", handleSensorMode);
  server.on("/status", handleStatus);
  server.on("/reset", handleReset);
  server.onNotFound(handleRoot);
  
  server.begin();
  Serial.println("Web server started");
  Serial.println("Connect to WiFi network: " + String(AP_SSID));
  Serial.println("Password: " + String(AP_PASSWORD));
  Serial.println("Then open http://192.168.4.1 in your browser");
}

void startSensorMode() {
  Serial.println("Starting sensor operation mode...");
  
  // Set LED to indicate normal operation
  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green
  pixels.show();
  
  // Initialize BLE if in receiver mode
  if (config.sensor_mode == 0) {
    if (!BLE.begin()) {
      Serial.println("❌ Failed to initialize BLE");
      config.sensor_mode = 1; // Fall back to direct sensor mode
      saveConfig();
    } else {
      Serial.println("🔍 Scanning for BLE devices...");
      BLE.scanForUuid(SERVICE_UUID);
    }
  }
  
  // Initialize direct sensors if needed
  if (config.sensor_mode == 1) {
    initializeDirectSensors();
  }
  
  // Initial display update
  updateDisplay();
}

void handleBLEData() {
  // Reconnect if disconnected
  if (peripheral && !peripheral.connected()) {
    Serial.println("🔌 BLE Disconnected. Rescanning...");
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
      Serial.print("✅ Found BLE device: ");
      Serial.println(peripheral.localName());

      if (peripheral.connect()) {
        Serial.println("🔗 Connected. Discovering service...");
        pixels.setPixelColor(1, pixels.Color(0, 0, 255)); // Blue
        pixels.show();
        
        if (peripheral.discoverService(SERVICE_UUID)) {
          dataChar = peripheral.characteristic(CHARACTERISTIC_UUID);
          if (!dataChar) {
            Serial.println("❌ Failed to find characteristic");
            pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
            pixels.show();
            peripheral.disconnect();
          } else {
            Serial.println("✅ BLE Characteristic connected");
            pixels.setPixelColor(1, pixels.Color(0, 255, 0)); // Green
            pixels.show();
            dataChar.subscribe();
          }
        } else {
          Serial.println("❌ Failed to discover BLE service");
          pixels.setPixelColor(1, pixels.Color(255, 0, 0)); // Red
          pixels.show();
          peripheral.disconnect();
        }
      } else {
        Serial.println("❌ BLE Connection failed");
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
    Serial.print("📦 BLE Data Received: ");
    Serial.println(jsonStr);

    parseBLEData(jsonStr);
    sensorData.timestamp = millis();
  }
}

void readDirectSensors() {
  // TODO: Implement direct sensor reading
  // This would include:
  // - Temperature/humidity sensor (DHT22, SHT30, etc.)
  // - CO2 sensor (MH-Z19, SCD30, etc.)
  // - Distance sensors (ultrasonic, LiDAR)
  // - Outdoor temperature sensor
  
  Serial.println("📊 Reading direct sensors...");
  
  // Placeholder values - replace with actual sensor reading code
  sensorData.temperature = 22.5 + (random(-50, 50) / 10.0);
  sensorData.humidity = 65.0 + (random(-100, 100) / 10.0);
  sensorData.co2 = 400 + random(0, 200);
  sensorData.distance1 = 100 + random(0, 600);
  sensorData.distance2 = 100 + random(0, 600);
  sensorData.distance_avg = (sensorData.distance1 + sensorData.distance2) / 2;
  sensorData.outdoor_temperature = 18.0 + (random(-100, 100) / 10.0);
  sensorData.timestamp = millis();
  
  Serial.printf("📊 Sensor Data → Temp: %.1f°C | Hum: %.1f%% | CO2: %dppm | Dist: %dcm\n", 
                sensorData.temperature, sensorData.humidity, sensorData.co2, sensorData.distance_avg);
}

void initializeDirectSensors() {
  Serial.println("Initializing direct sensors...");
  // TODO: Initialize actual sensors
  // - I2C sensors
  // - Analog sensors
  // - Digital sensors
}

void parseBLEData(String json) {
  sensorData.distance1 = extractValue(json, "d1").toInt();
  sensorData.distance2 = extractValue(json, "d2").toInt();
  sensorData.distance_avg = (sensorData.distance1 + sensorData.distance2) / 2;
  sensorData.co2 = extractValue(json, "co2").toInt();
  sensorData.temperature = extractValue(json, "t").toFloat();
  sensorData.humidity = extractValue(json, "h").toFloat();
  
  Serial.printf("📊 Parsed BLE Data → D1: %d | D2: %d | DA: %d | CO2: %d | Temp: %.1f | Hum: %.1f\n", 
                sensorData.distance1, sensorData.distance2, sensorData.distance_avg, 
                sensorData.co2, sensorData.temperature, sensorData.humidity);
}

String extractValue(String& json, const String& key) {
  int startIndex = json.indexOf("\"" + key + "\":");
  if (startIndex == -1) return "";
  startIndex += key.length() + 3;
  int endIndex = json.indexOf(",", startIndex);
  if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
  return json.substring(startIndex, endIndex);
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
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📡 Cannot upload data - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(FIREBASE_DATA_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload with all sensor data
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
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📡 Uploading sensor data to Firebase...");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("📡 Upload Response: %d\n", httpResponseCode);
    if (httpResponseCode == 200) {
      Serial.println("✅ Data uploaded successfully");
      pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green flash
    } else {
      Serial.println("⚠️  Upload failed: " + response);
      pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow
    }
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // Red
  }
  
  pixels.show();
  http.end();
}

// Web server handlers
void handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Farm Sensor Setup</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #333; 
            text-align: center; 
            margin-bottom: 30px;
        }
        .device-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        }
        input, select, button { 
            width: 100%; 
            padding: 12px; 
            margin: 10px 0; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            box-sizing: border-box;
        }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            cursor: pointer; 
            font-size: 16px;
        }
        button:hover { 
            background: #0056b3; 
        }
        .step {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .step-number {
            background: #007bff;
            color: white;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            font-weight: bold;
        }
        #status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            display: none;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌾 Farm Sensor Setup</h1>
        
        <div class="device-info">
            <strong>Device ID:</strong> )" + String(config.device_id) + R"(<br>
            <strong>Current Mode:</strong> )" + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors") + R"(
        </div>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>Select Sensor Mode</strong>
            <form id="modeForm">
                <select id="sensorMode" required>
                    <option value="0" )" + String(config.sensor_mode == 0 ? "selected" : "") + R"(>BLE Receiver Mode</option>
                    <option value="1" )" + String(config.sensor_mode == 1 ? "selected" : "") + R"(>Direct Sensor Mode</option>
                </select>
                <button type="submit">Set Mode</button>
            </form>
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Connect to WiFi</strong>
            <form id="wifiForm">
                <input type="text" id="ssid" placeholder="WiFi Network Name" value=")" + String(config.wifi_ssid) + R"(" required>
                <input type="password" id="password" placeholder="WiFi Password" required>
                <button type="submit">Connect to WiFi</button>
            </form>
        </div>
        
        <div class="step">
            <span class="step-number">3</span>
            <strong>Register Device</strong>
            <form id="registerForm" style="display:none;">
                <input type="text" id="regCode" placeholder="Registration Code from App" required>
                <button type="submit">Register Device</button>
            </form>
        </div>
        
        <div id="status"></div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button onclick="location.href='/status'" style="background: #6c757d; width: 48%; margin-right: 2%;">Status</button>
            <button onclick="location.href='/reset'" style="background: #dc3545; width: 48%;">Reset</button>
        </div>
    </div>
    
    <script>
        document.getElementById('modeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const mode = document.getElementById('sensorMode').value;
            
            showStatus('Setting sensor mode...', 'info');
            
            try {
                const response = await fetch('/mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'mode=' + mode
                });
                
                const result = await response.text();
                if (response.ok) {
                    showStatus('Sensor mode updated successfully!', 'success');
                } else {
                    showStatus('Failed to update mode: ' + result, 'error');
                }
            } catch (error) {
                showStatus('Error: ' + error.message, 'error');
            }
        });
        
        document.getElementById('wifiForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const ssid = document.getElementById('ssid').value;
            const password = document.getElementById('password').value;
            
            showStatus('Connecting to WiFi...', 'info');
            
            try {
                const response = await fetch('/wifi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'ssid=' + encodeURIComponent(ssid) + '&password=' + encodeURIComponent(password)
                });
                
                const result = await response.text();
                if (response.ok) {
                    showStatus('WiFi connected successfully! Please proceed to step 3.', 'success');
                    document.getElementById('registerForm').style.display = 'block';
                } else {
                    showStatus('WiFi connection failed: ' + result, 'error');
                }
            } catch (error) {
                showStatus('Error: ' + error.message, 'error');
            }
        });
        
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const regCode = document.getElementById('regCode').value;
            
            showStatus('Registering device...', 'info');
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'code=' + encodeURIComponent(regCode)
                });
                
                const result = await response.text();
                if (response.ok) {
                    showStatus('Device registered successfully! Setup complete. Device will restart in 5 seconds...', 'success');
                    setTimeout(() => {
                        location.href = '/status';
                    }, 5000);
                } else {
                    showStatus('Registration failed: ' + result, 'error');
                }
            } catch (error) {
                showStatus('Error: ' + error.message, 'error');
            }
        });
        
        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = type;
            status.style.display = 'block';
        }
    </script>
</body>
</html>
)";
  
  server.send(200, "text/html", html);
}

void handleSensorMode() {
  if (server.method() == HTTP_POST) {
    String mode = server.arg("mode");
    
    if (mode == "0" || mode == "1") {
      config.sensor_mode = mode.toInt();
      saveConfig();
      server.send(200, "text/plain", "Sensor mode updated");
      Serial.printf("Sensor mode updated to: %s\n", mode == "0" ? "BLE Receiver" : "Direct Sensors");
    } else {
      server.send(400, "text/plain", "Invalid sensor mode");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleWiFiConfig() {
  if (server.method() == HTTP_POST) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    if (ssid.length() > 0 && ssid.length() < 32) {
      ssid.toCharArray(config.wifi_ssid, sizeof(config.wifi_ssid));
      password.toCharArray(config.wifi_password, sizeof(config.wifi_password));
      
      Serial.printf("Attempting to connect to WiFi: %s\n", config.wifi_ssid);
      
      if (connectToWiFi()) {
        saveConfig();
        server.send(200, "text/plain", "WiFi connected successfully");
        Serial.println("WiFi connected and saved");
      } else {
        server.send(400, "text/plain", "Failed to connect to WiFi");
        Serial.println("WiFi connection failed");
      }
    } else {
      server.send(400, "text/plain", "Invalid SSID");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleDeviceRegistration() {
  if (server.method() == HTTP_POST) {
    String regCode = server.arg("code");
    
    if (regCode.length() > 0) {
      regCode.toCharArray(config.registration_code, sizeof(config.registration_code));
      
      Serial.printf("Attempting device registration with code: %s\n", config.registration_code);
      
      if (registerWithFirebase()) {
        server.send(200, "text/plain", "Device registered successfully");
        Serial.println("Device registered successfully");
        
        // Restart device after successful registration
        delay(2000);
        ESP.restart();
      } else {
        server.send(400, "text/plain", "Registration failed");
        Serial.println("Device registration failed");
      }
    } else {
      server.send(400, "text/plain", "Invalid registration code");
    }
  } else {
    server.send(405, "text/plain", "Method not allowed");
  }
}

void handleStatus() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #333; text-align: center; }
        .status-item { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .label { font-weight: bold; color: #495057; }
        .value { color: #007bff; margin-left: 10px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Device Status</h1>
        <div class="status-item">
            <span class="label">Device ID:</span>
            <span class="value">)" + String(config.device_id) + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">Sensor Mode:</span>
            <span class="value">)" + String(config.sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors") + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">WiFi SSID:</span>
            <span class="value">)" + String(config.wifi_ssid) + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">WiFi Status:</span>
            <span class="value">)" + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected") + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">IP Address:</span>
            <span class="value">)" + WiFi.localIP().toString() + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">Configuration:</span>
            <span class="value">)" + String(config.configured ? "Complete" : "Incomplete") + R"(</span>
        </div>
        <div class="status-item">
            <span class="label">Last Temperature:</span>
            <span class="value">)" + String(sensorData.temperature, 1) + R"(°C</span>
        </div>
        <div class="status-item">
            <span class="label">Last Humidity:</span>
            <span class="value">)" + String(sensorData.humidity, 1) + R"(%</span>
        </div>
        <div class="status-item">
            <span class="label">Last CO2:</span>
            <span class="value">)" + String(sensorData.co2) + R"( ppm</span>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.href='/'">Back to Setup</button>
            <button onclick="location.reload()" style="background: #28a745;">Refresh</button>
        </div>
    </div>
</body>
</html>
)";
  
  server.send(200, "text/html", html);
}

void handleReset() {
  // Clear EEPROM
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  
  server.send(200, "text/html", 
    "<html><body style='font-family: Arial; text-align: center; margin-top: 50px;'>"
    "<h1>🔄 Device Reset</h1>"
    "<p>Device configuration cleared. Restarting...</p>"
    "</body></html>");
  
  delay(2000);
  ESP.restart();
}

bool connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(config.wifi_ssid, config.wifi_password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected! IP address: ");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    Serial.println();
    Serial.println("WiFi connection failed");
    return false;
  }
}

bool registerWithFirebase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot register");
    return false;
  }
  
  HTTPClient http;
  http.begin(FIREBASE_FUNCTION_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = config.device_id;
  doc["registrationCode"] = config.registration_code;
  doc["deviceType"] = "farm_sensor_display";
  doc["sensorMode"] = config.sensor_mode == 0 ? "ble_receiver" : "direct_sensors";
  doc["capabilities"] = "temperature,humidity,co2,distance,outdoor_temperature,display";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending registration request...");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("HTTP Response: %d\n", httpResponseCode);
    Serial.println(response);
    
    if (httpResponseCode == 200) {
      http.end();
      return true;
    }
  } else {
    Serial.printf("HTTP Error: %d\n", httpResponseCode);
  }
  
  http.end();
  return false;
}