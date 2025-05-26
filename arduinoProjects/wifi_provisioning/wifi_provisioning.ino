/*
 * ESP32 WiFi Provisioning for Farm Sensor Network
 * Creates a captive portal for WiFi configuration and device registration
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <EEPROM.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_sleep.h>

// Configuration
const char* AP_SSID = "FarmSensor_Setup";
const char* AP_PASSWORD = "setup123";
const int DNS_PORT = 53;
const int WEB_PORT = 80;

// EEPROM addresses
#define EEPROM_SIZE 512
#define WIFI_SSID_ADDR 0
#define WIFI_PASS_ADDR 100
#define DEVICE_ID_ADDR 200
#define CONFIG_FLAG_ADDR 300

// Global objects
WebServer server(WEB_PORT);
DNSServer dnsServer;

// Device configuration
struct DeviceConfig {
  char wifi_ssid[32];
  char wifi_password[64];
  char device_id[32];
  char registration_code[16];
  bool configured;
};

DeviceConfig config;

// Firebase configuration - update with your project details
const char* FIREBASE_FUNCTION_URL = "https://us-central1-your-project.cloudfunctions.net/registerDevice";

void setup() {
  Serial.begin(115200);
  EEPROM.begin(EEPROM_SIZE);
  
  // Load configuration from EEPROM
  loadConfig();
  
  // Generate unique device ID if not set
  if (strlen(config.device_id) == 0) {
    generateDeviceId();
  }
  
  Serial.println("ESP32 Farm Sensor - WiFi Provisioning");
  Serial.printf("Device ID: %s\n", config.device_id);
  
  // Check if device is already configured
  if (config.configured && strlen(config.wifi_ssid) > 0) {
    Serial.println("Device already configured, attempting WiFi connection...");
    if (connectToWiFi()) {
      Serial.println("Connected to WiFi successfully!");
      // Start normal sensor operation
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
  dnsServer.processNextRequest();
  server.handleClient();
  delay(10);
}

void loadConfig() {
  EEPROM.get(WIFI_SSID_ADDR, config.wifi_ssid);
  EEPROM.get(WIFI_PASS_ADDR, config.wifi_password);
  EEPROM.get(DEVICE_ID_ADDR, config.device_id);
  
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
  server.on("/status", handleStatus);
  server.on("/reset", handleReset);
  server.onNotFound(handleRoot); // Redirect all unknown requests to root
  
  server.begin();
  Serial.println("Web server started");
  Serial.println("Connect to WiFi network: " + String(AP_SSID));
  Serial.println("Password: " + String(AP_PASSWORD));
  Serial.println("Then open http://192.168.4.1 in your browser");
}

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
            max-width: 400px; 
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
        input, button { 
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🌾 Farm Sensor Setup</h1>
        
        <div class="device-info">
            <strong>Device ID:</strong> )" + String(config.device_id) + R"(
        </div>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>Connect to WiFi</strong>
            <form id="wifiForm">
                <input type="text" id="ssid" placeholder="WiFi Network Name" required>
                <input type="password" id="password" placeholder="WiFi Password" required>
                <button type="submit">Connect to WiFi</button>
            </form>
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Register Device</strong>
            <form id="registerForm" style="display:none;">
                <input type="text" id="regCode" placeholder="Registration Code from App" required>
                <button type="submit">Register Device</button>
            </form>
        </div>
        
        <div id="status"></div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button onclick="location.href='/status'" style="background: #6c757d;">Check Status</button>
            <button onclick="location.href='/reset'" style="background: #dc3545; margin-left: 10px;">Reset Device</button>
        </div>
    </div>
    
    <script>
        document.getElementById('wifiForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const ssid = document.getElementById('ssid').value;
            const password = document.getElementById('password').value;
            
            showStatus('Connecting to WiFi...', 'info');
            
            try {
                const response = await fetch('/wifi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}`
                });
                
                const result = await response.text();
                if (response.ok) {
                    showStatus('WiFi connected successfully! Please proceed to step 2.', 'success');
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
                    body: `code=${encodeURIComponent(regCode)}`
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
  String html = "<h1>Device Status</h1>";
  html += "<p><strong>Device ID:</strong> " + String(config.device_id) + "</p>";
  html += "<p><strong>WiFi SSID:</strong> " + String(config.wifi_ssid) + "</p>";
  html += "<p><strong>WiFi Status:</strong> " + (WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected") + "</p>";
  html += "<p><strong>IP Address:</strong> " + WiFi.localIP().toString() + "</p>";
  html += "<p><strong>Configuration:</strong> " + (config.configured ? "Complete" : "Incomplete") + "</p>";
  html += "<a href='/'>Back to Setup</a>";
  
  server.send(200, "text/html", html);
}

void handleReset() {
  // Clear EEPROM
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  
  server.send(200, "text/html", "<h1>Device Reset</h1><p>Device configuration cleared. Restarting...</p>");
  
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
  doc["deviceType"] = "farm_sensor";
  doc["capabilities"] = "temperature,humidity,soil_moisture";
  
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

void startSensorMode() {
  Serial.println("Starting normal sensor operation...");
  
  // TODO: Initialize sensors here
  // - Temperature sensor
  // - Humidity sensor
  // - Soil moisture sensor
  // - Any other farm sensors
  
  // TODO: Set up periodic readings and Firebase uploads
  // - Read sensors every X minutes
  // - Upload data to Firebase
  // - Enter deep sleep between readings
  
  // For now, just enter deep sleep for 60 seconds as demonstration
  Serial.println("Entering deep sleep for 60 seconds...");
  esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds in microseconds
  esp_deep_sleep_start();
}
