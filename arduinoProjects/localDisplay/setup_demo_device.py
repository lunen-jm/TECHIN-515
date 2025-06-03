#!/usr/bin/env python3
"""
Create Demo Device in Firebase
This script creates a demo device in the Firebase database so the ESP32 hardcoded device can upload data
"""

import requests
import json
import time

# Firebase function URLs
REGISTER_DEVICE_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/registerDevice"
GENERATE_CODE_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/generateRegistrationCode"

def create_demo_device():
    """Create the demo device in Firebase database"""
    
    print("🚀 Creating Demo Device in Firebase Database")
    print("=" * 50)
    
    # Step 1: Generate a registration code for "My Test Farm"
    print("📋 Step 1: Generating registration code for 'My Test Farm'...")
    
    code_data = {
        "farmName": "My Test Farm",
        "deviceName": "Demo Sensor"
    }
    
    try:
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ESP32HTTPClient/1.2'  # Identify as ESP32 to skip reCAPTCHA
        }
        
        response = requests.post(
            GENERATE_CODE_URL,
            json=code_data,
            headers=headers,
            timeout=15
        )
        
        print(f"📡 Code Generation Response: {response.status_code}")
        print(f"📡 Response Body: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            registration_code = response_data.get('registrationCode')
            
            if not registration_code:
                print("❌ ERROR: No registration code returned")
                return False
                
            print(f"✅ Registration code generated: {registration_code}")
            
            # Step 2: Register the demo device
            print("\n📱 Step 2: Registering demo device...")
            
            device_data = {
                "deviceId": "demo-sensor-001",
                "registrationCode": registration_code,
                "deviceType": "ESP32",
                "capabilities": {
                    "temperature": True,
                    "humidity": True,
                    "co2": True,
                    "distance": True,
                    "ble": True
                },
                "sensorMode": 0,  # BLE Receiver mode
                "macAddress": "AA:BB:CC:DD:EE:FF"
            }
            
            device_response = requests.post(
                REGISTER_DEVICE_URL,
                json=device_data,
                headers=headers,
                timeout=15
            )
            
            print(f"📡 Device Registration Response: {device_response.status_code}")
            print(f"📡 Response Body: {device_response.text}")
            
            if device_response.status_code == 200:
                print("✅ SUCCESS: Demo device registered successfully!")
                print("🎯 Device ID: demo-sensor-001")
                print("🏪 Farm: My Test Farm")
                print("📱 Device Name: Demo Sensor")
                return True
            else:
                print(f"❌ Device registration failed: {device_response.status_code}")
                return False
                
        else:
            print(f"❌ Code generation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_sensor_data_upload():
    """Test uploading data after device registration"""
    print("\n🧪 Step 3: Testing sensor data upload...")
    
    test_data = {
        "deviceId": "demo-sensor-001",
        "timestamp": int(time.time() * 1000),
        "distance1": 450,
        "distance2": 380,
        "distance_avg": 415,
        "co2": 850,
        "temperature": 22.5,
        "humidity": 65.2,
        "wifi_rssi": -45
    }
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            "https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData",
            json=test_data,
            headers=headers,
            timeout=15
        )
        
        print(f"📡 Sensor Data Response: {response.status_code}")
        print(f"📡 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Sensor data uploaded successfully!")
            return True
        else:
            print(f"❌ Sensor data upload failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Firebase Demo Device Setup")
    print("This script creates the demo device in Firebase for the ESP32 hardcoded display")
    print()
    
    try:
        # Create the demo device
        if create_demo_device():
            # Test sensor data upload
            test_sensor_data_upload()
            
            print("\n" + "=" * 50)
            print("✅ Demo device setup complete!")
            print("📤 The ESP32 hardcoded display should now be able to upload data to Firebase")
            print("🔍 Check the Firebase console to see the data")
        else:
            print("\n❌ Demo device setup failed")
            print("📋 Check the error messages above for troubleshooting")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
