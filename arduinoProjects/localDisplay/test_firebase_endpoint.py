#!/usr/bin/env python3
"""
Firebase Endpoint Test Script
Tests the Firebase Cloud Function endpoint that the ESP32 will be uploading to
"""

import requests
import json
import time

# Firebase endpoint URL (same as in the ESP32 code)
FIREBASE_URL = "https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData"

def test_firebase_upload():
    """Test uploading sensor data to Firebase endpoint"""
      # Sample data matching what the ESP32 will send
    test_data = {
        "deviceId": "JK87fJjKxZ6TgtszLcBh",  # Updated to match Firebase document ID
        "deviceName": "Demo Sensor", 
        "farmName": "My Test Farm",
        "timestamp": int(time.time() * 1000),  # Current time in milliseconds
        "distance1": 450,
        "distance2": 380,
        "distance_avg": 415,
        "co2": 850,
        "temperature": 22.5,
        "humidity": 65.2,
        "sensorMode": 0,
        "batteryLevel": 85,
        "rssi": -45,
        "macAddress": "AA:BB:CC:DD:EE:FF",
        "uptime": 12345,
        "isConnected": True
    }
    
    print("🧪 Testing Firebase Cloud Function Endpoint")
    print("=" * 50)
    print(f"📡 URL: {FIREBASE_URL}")
    print(f"📦 Test Data:")
    print(json.dumps(test_data, indent=2))
    print("=" * 50)
    
    try:
        # Send POST request to Firebase endpoint
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            FIREBASE_URL, 
            json=test_data, 
            headers=headers,
            timeout=15
        )
        
        print(f"📡 HTTP Response Code: {response.status_code}")
        print(f"📡 Response Headers: {dict(response.headers)}")
        print(f"📡 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Data uploaded successfully to Firebase!")
            try:
                response_json = response.json()
                print(f"📊 Firebase Response: {json.dumps(response_json, indent=2)}")
            except:
                print("⚠️  Response is not JSON format")
        elif response.status_code == 400:
            print("❌ ERROR 400: Bad Request - Check data format")
        elif response.status_code == 401:
            print("❌ ERROR 401: Unauthorized")
        elif response.status_code == 403:
            print("❌ ERROR 403: Forbidden - Check Firebase rules")
        elif response.status_code == 500:
            print("❌ ERROR 500: Internal Server Error")
        else:
            print(f"⚠️  Unexpected response code: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Network request failed - {e}")
    except Exception as e:
        print(f"❌ ERROR: Unexpected error - {e}")

def test_endpoint_availability():
    """Test if the Firebase endpoint is available"""
    print("\n🔍 Testing endpoint availability...")
    
    try:
        response = requests.get(FIREBASE_URL, timeout=10)
        print(f"📡 GET Response Code: {response.status_code}")
        print(f"📡 GET Response: {response.text}")
    except Exception as e:
        print(f"🔍 GET test failed (expected for Cloud Functions): {e}")

if __name__ == "__main__":
    print("🚀 Firebase Endpoint Test for ESP32 Display Project")
    print("This script simulates the data upload that the ESP32 will perform")
    print()
    
    # Test the endpoint
    test_firebase_upload()
    
    # Test availability 
    test_endpoint_availability()
    
    print("\n" + "=" * 50)
    print("✅ Test complete! Check results above.")
    print("If successful, the ESP32 should be able to upload data to Firebase.")
