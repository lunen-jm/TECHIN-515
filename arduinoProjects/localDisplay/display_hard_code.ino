/*
 * ESP32 Farm Sensor Display - Hardcoded Version
 * Pre-configured to connect to "My Test Farm" with device name "Demo Sensor"
 * Automatically uploads sensor data to Firebase without device registration
 * Author: TECHIN-515 Team
 * Date: June 2, 2025
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_sleep.h>
#include <ArduinoBLE.h>
#include <Adafruit_NeoPixel.h>
#include "TFT_eSPI.h"
#include <Adafruit_GFX.h>

// HARDCODED CONFIGURATION
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // CHANGE THIS TO YOUR WIFI
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // CHANGE THIS TO YOUR WIFI PASSWORD
const char* DEVICE_ID = "JK87fJjKxZ6TgtszLcBh";  // Firebase device document ID
const char* DEVICE_NAME = "Demo Sensor";
const char* FARM_NAME = "My Test Farm";

// Hardware Pin Definitions
#define BUTTON_PIN_1 5
#define BUTTON_PIN_2 6
#define LED_PIN      44
#define NUM_PIXELS   2

// BLE Configuration (for sensor communication)
const char* SERVICE_UUID = "09279c9d-dd87-40d1-877b-00d951d18cda";
const char* CHARACTERISTIC_UUID = "a2670365-1a16-4ef5-a53e-371324f03243";

// Firebase configuration for grainguard-22f5a project
const char* FIREBASE_DATA_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData";

// Global objects
Adafruit_NeoPixel pixels(NUM_PIXELS, LED_PIN, NEO_GRB + NEO_KHZ800);

// TFT Display object - use TFT_eSPI directly
TFT_eSPI tft = TFT_eSPI();

#ifdef EPAPER_ENABLE // Only compile this code if the EPAPER_ENABLE is defined in User_Setup.h
EPaper epaper;
#endif

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
SensorData sensorData = {0};
BLEDevice peripheral;
BLECharacteristic dataChar;
unsigned long lastSensorRead = 0;
unsigned long lastDataUpload = 0;
const unsigned long SENSOR_INTERVAL = 30000; // 30 seconds
const unsigned long UPLOAD_INTERVAL = 60000; // 1 minute for testing (was 5 minutes)

// Hardware and display variables
unsigned long lastDebounceTime1 = 0;
unsigned long lastDebounceTime2 = 0;
unsigned long debounceDelay = 20;

bool lastButton1State = HIGH;
bool lastButton2State = HIGH;
bool button1State = HIGH;
bool button2State = HIGH;
bool isConnected = LOW;
bool wifiConnected = false;

// Legacy global variables for backward compatibility
int distance1 = 0;
int distance2 = 0;
int distanceavg = 0;
int co2 = 400;
float temperature = 20.0;
float humidity = 50.0;
int max_distance = 800;

// Sensor mode: 0=BLE receiver, 1=direct sensor reading
uint8_t sensor_mode = 0; // Default to BLE receiver mode

// Error tracking
String lastError = "";
unsigned long lastErrorTime = 0;

// Forward declarations
uint32_t Wheel(byte WheelPos);
void rainbowCycle(uint8_t wait);
void logError(String error);
String extractValue(String& json, const String& key);
void parseJSON(String json);
bool connectToWiFi();
void initializeBLE();
void initializeDirectSensors();
void handleBLEData();
void readDirectSensors();
void uploadSensorData();
void updateDisplay();
void updateStatusLED();

// Icon bitmaps for display
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
  Serial.println("🌾 ESP32 Farm Sensor Display - HARDCODED");
  Serial.println("=====================================");
  Serial.println("📅 Demo Version - June 2, 2025");
  Serial.printf("🏪 Farm: %s\n", FARM_NAME);
  Serial.printf("📱 Device: %s (%s)\n", DEVICE_NAME, DEVICE_ID);
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
  Serial.println("🖥️  E-Paper display not available, using TFT display");
  tft.begin();
  tft.setRotation(3); // Landscape orientation
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("Display Initialized", 10, 10);
  Serial.println("✅ TFT Display initialized");
  #endif
  
  Serial.println("-------------------------------------");
  Serial.println("📋 HARDCODED CONFIGURATION:");
  Serial.printf("   Device ID: %s\n", DEVICE_ID);
  Serial.printf("   Device Name: %s\n", DEVICE_NAME);
  Serial.printf("   Farm Name: %s\n", FARM_NAME);
  Serial.printf("   Sensor Mode: %s\n", sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
  Serial.printf("   WiFi Network: %s\n", WIFI_SSID);
  Serial.println("-------------------------------------");
  
  // Start WiFi connection
  Serial.println("🔄 Connecting to WiFi...");
  pixels.setPixelColor(0, pixels.Color(255, 255, 0)); // Yellow for connecting
  pixels.show();
  
  if (connectToWiFi()) {
    Serial.println("✅ WiFi connected successfully");
    wifiConnected = true;
    pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green for connected
    pixels.show();
    
    // Show connection info on display    #ifdef EPAPER_ENABLE
    epaper.fillScreen(TFT_WHITE);
    epaper.setFreeFont(&FreeSans18pt7b);
    epaper.drawString("WiFi Connected", 200, 200);
    epaper.setFreeFont(&FreeSans12pt7b);
    epaper.drawString(WiFi.localIP().toString(), 200, 240);
    epaper.update();
    #else
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_GREEN, TFT_BLACK);
    tft.setTextSize(2);
    tft.drawString("WiFi Connected", 10, 50);
    tft.setTextSize(1);
    tft.drawString("IP: " + WiFi.localIP().toString(), 10, 90);
    #endif
    
    delay(2000); // Show connection status
    
    // Start sensor mode
    startSensorMode();
  } else {
    Serial.println("❌ WiFi connection failed - continuing with offline mode");
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // Red for failed
    pixels.show();
      #ifdef EPAPER_ENABLE
    epaper.fillScreen(TFT_WHITE);
    epaper.setFreeFont(&FreeSans18pt7b);
    epaper.drawString("WiFi Failed", 200, 200);
    epaper.setFreeFont(&FreeSans12pt7b);
    epaper.drawString("Offline Mode", 200, 240);
    epaper.update();
    #else
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_RED, TFT_BLACK);
    tft.setTextSize(2);
    tft.drawString("WiFi Failed", 10, 50);
    tft.setTextSize(1);
    tft.drawString("Offline Mode", 10, 90);
    #endif
    
    // Still start sensor mode for local operation
    startSensorMode();
  }
  
  Serial.println("✅ Setup complete - entering main loop");
  Serial.println("=====================================");
}

void loop() {
  // Handle button inputs
  bool reading1 = digitalRead(BUTTON_PIN_1);
  bool reading2 = digitalRead(BUTTON_PIN_2);
  
  if (reading1 != lastButton1State) {
    lastDebounceTime1 = millis();
  }
  if (reading2 != lastButton2State) {
    lastDebounceTime2 = millis();
  }
  
  if ((millis() - lastDebounceTime1) > debounceDelay) {
    if (reading1 != button1State) {
      button1State = reading1;
      if (button1State == LOW) {
        Serial.println("🔘 Button 1 pressed - toggling sensor mode");
        sensor_mode = sensor_mode == 0 ? 1 : 0;
        Serial.printf("   🔧 New sensor mode: %s\n", sensor_mode == 0 ? "BLE Receiver" : "Direct Sensors");
        startSensorMode(); // Reinitialize with new mode
      }
    }
  }
  
  if ((millis() - lastDebounceTime2) > debounceDelay) {
    if (reading2 != button2State) {
      button2State = reading2;
      if (button2State == LOW) {
        Serial.println("🔘 Button 2 pressed - forcing data upload");
        if (wifiConnected) {
          uploadSensorData();
        } else {
          Serial.println("❌ Cannot upload - WiFi not connected");
        }
      }
    }
  }
  
  lastButton1State = reading1;
  lastButton2State = reading2;
  // Read sensor data based on mode
  if (millis() - lastSensorRead > SENSOR_INTERVAL) {
    Serial.printf("⏰ Sensor read interval reached (mode: %s)\n", sensor_mode == 0 ? "BLE" : "Direct");
    Serial.printf("   📊 Current sensor values before read: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                  distance1, distance2, distanceavg, co2, temperature, humidity);
    
    if (sensor_mode == 0) {
      handleBLEData(); // BLE receiver mode
    } else {
      readDirectSensors(); // Direct sensor mode
    }
    lastSensorRead = millis();
    
    Serial.printf("   📊 Sensor values after read: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                  distance1, distance2, distanceavg, co2, temperature, humidity);
    
    // Update display with new data
    Serial.println("🔄 Updating display after sensor read...");
    updateDisplay();
  }
  
  // Upload data to Firebase periodically
  if (wifiConnected && (millis() - lastDataUpload > UPLOAD_INTERVAL)) {
    uploadSensorData();
    lastDataUpload = millis();
  }
  
  // Update status LED
  updateStatusLED();
  
  // Small delay to prevent overwhelming the system
  delay(100);
}

// WiFi connection function
bool connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  const int maxAttempts = 30; // 30 seconds timeout
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(1000);
    attempts++;
    Serial.print(".");
    
    // Animate LED while connecting
    static int colorPhase = 0;
    pixels.setPixelColor(0, Wheel(colorPhase));
    pixels.show();
    colorPhase = (colorPhase + 8) % 256;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("   📡 Connected to: %s\n", WIFI_SSID);
    Serial.printf("   📍 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("   📶 Signal Strength: %d dBm\n", WiFi.RSSI());
    return true;
  } else {
    Serial.printf("   ❌ Failed to connect to: %s\n", WIFI_SSID);
    Serial.printf("   ❌ WiFi Status: %d\n", WiFi.status());
    return false;
  }
}

// Error logging function
void logError(String error) {
  lastError = error;
  lastErrorTime = millis();
  Serial.println("❌ ERROR: " + error);
}

// Helper to extract values from JSON-like strings (matches original implementation)
String extractValue(String& json, const String& key) {
  int startIndex = json.indexOf("\"" + key + "\":");
  if (startIndex == -1) return "";
  startIndex += key.length() + 3;
  int endIndex = json.indexOf(",", startIndex);
  if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
  return json.substring(startIndex, endIndex);
}

// JSON parsing function for BLE data (updated to match original format)
void parseJSON(String json) {
  Serial.println("🔍 Raw JSON received: " + json);
  
  // Try both parsing methods for compatibility
  
  // Method 1: Original custom parsing (for d1, d2, t, h format)
  String d1_str = extractValue(json, "d1");
  String d2_str = extractValue(json, "d2");
  String co2_str = extractValue(json, "co2");
  String t_str = extractValue(json, "t");
  String h_str = extractValue(json, "h");
  
  if (d1_str.length() > 0) {
    // Original format found
    distance1 = d1_str.toInt();
    distance2 = d2_str.toInt();
    distanceavg = (distance1 + distance2) / 2;
    co2 = co2_str.toInt();
    temperature = t_str.toFloat();
    humidity = h_str.toFloat();
    
    Serial.printf("📦 Original format parsed: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                  distance1, distance2, distanceavg, co2, temperature, humidity);
  } else {
    // Method 2: ArduinoJson parsing (for full field names)
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, json);
    
    if (error) {
      logError("JSON parsing failed: " + String(error.c_str()));
      Serial.println("🔍 Trying manual key extraction...");
      
      // Fallback: try to extract any numeric values we can find
      int firstNum = json.indexOf(':');
      if (firstNum != -1) {
        String valueStr = json.substring(firstNum + 1);
        distance1 = valueStr.toInt();
        if (distance1 > 0) {
          distance2 = distance1 + random(-50, 50); // Mock second sensor
          distanceavg = (distance1 + distance2) / 2;
          Serial.printf("📦 Fallback parsing: D1=%d, D2=%d, Avg=%d\n", distance1, distance2, distanceavg);
        }
      }
      return;
    }
    
    // Extract values with defaults for full field names
    distance1 = doc["distance1"] | distance1; // Keep existing if not found
    distance2 = doc["distance2"] | distance2;
    distanceavg = doc["distance_avg"] | doc["distanceavg"] | ((distance1 + distance2) / 2);
    co2 = doc["co2"] | co2;
    temperature = doc["temperature"] | temperature;
    humidity = doc["humidity"] | humidity;
    
    Serial.printf("📦 ArduinoJson parsed: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                  distance1, distance2, distanceavg, co2, temperature, humidity);
  }
  
  // Update sensor data structure
  sensorData.distance1 = distance1;
  sensorData.distance2 = distance2;
  sensorData.distance_avg = distanceavg;
  sensorData.co2 = co2;
  sensorData.temperature = temperature;
  sensorData.humidity = humidity;
  sensorData.timestamp = millis();
}

// Sensor Mode Functions
void startSensorMode() {
  Serial.println("=====================================");
  Serial.println("🚀 STARTING SENSOR MODE");
  Serial.println("=====================================");
  
  // Set LED to indicate sensor mode
  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green
  pixels.show();
  
  if (sensor_mode == 0) {
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
  #else
  Serial.print("🖥️  Updating TFT display for sensor mode... ");
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("Sensor Ready", 10, 50);
  tft.setTextSize(1);
  String modeText = sensor_mode == 0 ? "BLE Receiver Mode" : "Direct Sensor Mode";
  tft.drawString(modeText, 10, 90);
  Serial.println("✅ Success");
  #endif
    Serial.println("✅ Sensor mode initialization complete");
  Serial.println("=====================================");
  
  // Force an immediate display update with current data
  Serial.println("🔄 Forcing initial display update...");
  updateDisplay();
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
  #else
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_BLUE, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("Scanning BLE...", 10, 50);
  tft.setTextSize(1);
  tft.drawString("Looking for sensors", 10, 90);
  #endif
}

void initializeDirectSensors() {
  Serial.println("🔧 Initializing direct sensor interfaces...");
  // Add your direct sensor initialization code here
  // This could include I2C, SPI, or analog sensor setup
  
  Serial.println("✅ Direct sensors initialized");
}

void handleBLEData() {
  // Debug output every few seconds when in BLE mode
  static unsigned long lastDebugOutput = 0;
  if (millis() - lastDebugOutput > 5000) {
    Serial.printf("🔍 BLE Status: Connected=%s, Peripheral=%s, DataChar=%s\n", 
                  isConnected ? "YES" : "NO",
                  peripheral ? "YES" : "NO", 
                  dataChar ? "YES" : "NO");
    lastDebugOutput = millis();
  }
  
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
      int length = dataChar.readValue(buffer, sizeof(buffer));      if (length > 0) {
        buffer[length] = '\0';  // Null-terminate for safe conversion
        String jsonStr = String((char*)buffer);  // Convert to String
        Serial.print("📦 Received BLE data: ");
        Serial.println(jsonStr);
        parseJSON(jsonStr);
        Serial.println("✅ BLE data parsed and sensor data updated");
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

// Data Upload Function
void uploadSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected, skipping data upload");
    return;
  }
  
  Serial.println("=====================================");
  Serial.println("📡 UPLOADING SENSOR DATA TO FIREBASE");
  Serial.println("=====================================");
  Serial.printf("   🏪 Farm: %s\n", FARM_NAME);
  Serial.printf("   📱 Device: %s (%s)\n", DEVICE_NAME, DEVICE_ID);
  Serial.printf("   📊 Current Data: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                distance1, distance2, distanceavg, co2, temperature, humidity);
  Serial.printf("   📊 Struct Data: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                sensorData.distance1, sensorData.distance2, sensorData.distance_avg,
                sensorData.co2, sensorData.temperature, sensorData.humidity);
  
  HTTPClient http;
  http.begin(FIREBASE_DATA_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout
    // Use current variables instead of sensorData struct to ensure we get latest values
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = DEVICE_ID;
  doc["deviceName"] = DEVICE_NAME;
  doc["farmName"] = FARM_NAME;
  
  // Use proper Unix timestamp (milliseconds since epoch)
  // For demo purposes, create a realistic timestamp
  unsigned long currentTime = 1717459200000UL + millis(); // June 4, 2024 base + uptime
  doc["timestamp"] = currentTime;
  
  // Sensor data with proper validation
  doc["temperature"] = (temperature > -50 && temperature < 100) ? temperature : 22.5;
  doc["humidity"] = (humidity >= 0 && humidity <= 100) ? humidity : 65.0;
  doc["co2"] = (co2 >= 300 && co2 <= 2000) ? co2 : 850;
  doc["distance1"] = (distance1 >= 0 && distance1 <= 1000) ? distance1 : 450;
  doc["distance2"] = (distance2 >= 0 && distance2 <= 1000) ? distance2 : 380;
  doc["distance_avg"] = (distanceavg >= 0 && distanceavg <= 1000) ? distanceavg : ((distance1 + distance2) / 2);
  
  // Additional metadata
  doc["sensorMode"] = sensor_mode;
  doc["batteryLevel"] = 85; // Placeholder
  doc["wifi_rssi"] = WiFi.RSSI(); // Match Firebase function parameter name
  doc["macAddress"] = WiFi.macAddress();
  doc["uptime"] = millis() / 1000; // Device uptime in seconds
  doc["isConnected"] = isConnected; // BLE connection status
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("   📦 JSON Payload:");
  Serial.println(jsonString);
  Serial.printf("   🌐 Target URL: %s\n", FIREBASE_DATA_URL);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("   📡 HTTP Response Code: %d\n", httpResponseCode);
    Serial.printf("   📡 Response Body: %s\n", response.c_str());
    
    if (httpResponseCode == 200) {
      Serial.println("✅ SUCCESS: Sensor data uploaded to Firebase!");
      // Update LED to show successful upload
      pixels.setPixelColor(1, pixels.Color(0, 255, 0)); // Second LED green for upload success
      pixels.show();
      delay(500);
    } else if (httpResponseCode == 400) {
      Serial.println("❌ ERROR 400: Bad Request - Check data format");
    } else if (httpResponseCode == 401) {
      Serial.println("❌ ERROR 401: Unauthorized - Check Firebase configuration");
    } else if (httpResponseCode == 403) {
      Serial.println("❌ ERROR 403: Forbidden - Check Firebase rules");
    } else if (httpResponseCode == 500) {
      Serial.println("❌ ERROR 500: Internal Server Error - Firebase function issue");
    } else {
      Serial.printf("⚠️  WARNING: Unexpected response code %d\n", httpResponseCode);
    }
  } else {
    Serial.printf("❌ NETWORK ERROR: HTTP request failed with code %d\n", httpResponseCode);
    logError("Data upload network error: " + String(httpResponseCode));
  }
  
  http.end();
  Serial.println("=====================================");
}

// Display Update Function
void updateDisplay() {
  Serial.println("🖥️  Updating display with sensor data...");
  Serial.printf("   📊 Data: D1=%d, D2=%d, Avg=%d, CO2=%d, T=%.1f°C, H=%.1f%%\n",
                distance1, distance2, distanceavg, co2, temperature, humidity);
  
  #ifdef EPAPER_ENABLE
  // Enhanced display with modern UI for ePaper
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

  // Device info
  epaper.setFreeFont(&FreeSansBold18pt7b);
  epaper.drawString(String(distanceavg)+"/"+String(max_distance), 32, 32);
  epaper.drawString(String(100-distanceavg*100/max_distance)+"%", 200, 32);

  epaper.fillRect(20, 70+distanceavg*350/max_distance, 370, 350-distanceavg*350/max_distance, TFT_BLACK);

  // Footer with hardcoded info
  epaper.setFreeFont(&FreeSans9pt7b);
  epaper.drawString(DEVICE_NAME, 20, 446);
  epaper.drawString(FARM_NAME, 295, 446);
  epaper.drawString(wifiConnected ? "Connected" : "Offline", 420, 446);
  epaper.drawString(sensor_mode == 0 ? "BLE" : "Direct", 740, 446);

  epaper.update();
  Serial.println("   ✅ ePaper display updated");
  #else
  // TFT display version - simpler layout for standard TFT
  tft.fillScreen(TFT_BLACK);
  
  // Title
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString(DEVICE_NAME, 10, 10);
  
  // Main data display
  int yPos = 50;
  tft.setTextSize(1);
  
  // Distance data
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.drawString("Distance: " + String(distanceavg) + "/" + String(max_distance), 10, yPos);
  yPos += 20;
  
  int fillPercent = 100 - (distanceavg * 100 / max_distance);
  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.drawString("Fill: " + String(fillPercent) + "%", 10, yPos);
  yPos += 30;
  
  // Draw fill bar
  int barWidth = 200;
  int barHeight = 20;
  tft.drawRect(10, yPos, barWidth, barHeight, TFT_WHITE);
  int fillWidth = (fillPercent * barWidth) / 100;
  uint16_t fillColor = fillPercent > 80 ? TFT_RED : (fillPercent > 50 ? TFT_YELLOW : TFT_GREEN);
  tft.fillRect(11, yPos + 1, fillWidth, barHeight - 2, fillColor);
  yPos += 40;
  
  // Sensor readings
  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.drawString("CO2: " + String(co2) + " ppm", 10, yPos);
  yPos += 20;
  
  tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  tft.drawString("Temp: " + String(temperature, 1) + " C", 10, yPos);
  yPos += 20;
  
  tft.setTextColor(TFT_BLUE, TFT_BLACK);
  tft.drawString("Humidity: " + String(humidity, 1) + "%", 10, yPos);
  yPos += 30;
  
  // Status info
  tft.setTextColor(TFT_MAGENTA, TFT_BLACK);
  tft.drawString("Farm: " + String(FARM_NAME), 10, yPos);
  yPos += 20;
  
  tft.setTextColor(wifiConnected ? TFT_GREEN : TFT_RED, TFT_BLACK);
  tft.drawString("WiFi: " + String(wifiConnected ? "Connected" : "Offline"), 10, yPos);
  yPos += 20;
  
  tft.setTextColor(isConnected ? TFT_GREEN : TFT_YELLOW, TFT_BLACK);
  String sensorStatus = sensor_mode == 0 ? (isConnected ? "BLE Connected" : "BLE Scanning") : "Direct Sensors";
  tft.drawString("Sensors: " + sensorStatus, 10, yPos);
  
  Serial.println("   ✅ TFT display updated");
  #endif
  
  // Update LED based on sensor data
  updateStatusLED();
}

// Status LED Update Function
void updateStatusLED() {
  // Update LED color based on sensor readings and connection status
  if (!wifiConnected) {
    // Red blink for no WiFi
    static bool ledState = false;
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 1000) {
      ledState = !ledState;
      pixels.setPixelColor(0, ledState ? pixels.Color(255, 0, 0) : pixels.Color(0, 0, 0));
      pixels.show();
      lastBlink = millis();
    }
  } else if (!isConnected && sensor_mode == 0) {
    // Yellow for WiFi connected but no BLE
    pixels.setPixelColor(0, pixels.Color(255, 255, 0));
    pixels.show();
  } else {
    // Green for all good, with intensity based on data quality
    int intensity = map(distanceavg, 0, max_distance, 50, 255);
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