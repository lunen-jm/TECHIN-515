#!/bin/bash
# Add demo farm and device to Firebase Firestore for testing

echo "🚀 Adding Demo Farm and Device to Firebase Firestore"
echo "=" 

# Change to the project directory
cd /c/Users/jaden/Documents/GitHub/TECHIN-515

# Add the demo farm
echo "📋 Adding demo farm..."
firebase firestore:write farms/demo-farm-001 arduinoProjects/localDisplay/demo_farm.json

# Add the demo device
echo "📱 Adding demo device..."  
firebase firestore:write devices/demo-sensor-001 arduinoProjects/localDisplay/demo_device.json

echo "✅ Demo farm and device added successfully!"
echo "🧪 Now you can test the ESP32 hardcoded display"
