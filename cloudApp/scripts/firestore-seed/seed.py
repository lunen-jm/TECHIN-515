from google.cloud import firestore
from datetime import datetime, timedelta
import random

db = firestore.Client()

# 1) Create user
user_ref = db.collection("users").document()
user_ref.set({
    "username": "demo",
    "email": "demo@example.com",
    "password_hash": "bcrypt$...",
    "created_at": datetime.utcnow(),
    "local_admin": False,
    "global_admin": False
})

# 2) Create farm
farm_id = "farm001"
farm_ref = db.collection("farms").document(farm_id)
farm_ref.set({
    "name": "demo",
    "description": "farm demo",
    "user_id": user_ref.id
})

# 3) Create two devices
devices = [
    {
        "id": "DEV001",
        "name": "Greenhouse #1",
        "bin_type": "soy"
    },
    {
        "id": "DEV002",
        "name": "Greenhouse #2",
        "bin_type": "wheat"
    }
]

for device in devices:
    device_ref = db.collection("devices").document(device["id"])
    device_ref.set({
        "name": device["name"],
        "registered_farm": "Farm A",
        "type": "ESP32-S2",
        "created_at": datetime.utcnow(),
        "is_active": True,
        "low_battery": False,
        "bin_type": device["bin_type"],
        "farm_id": farm_ref.id
    })

# 4) Generate 10 sensor readings for each device
base = datetime.utcnow()

for device in devices:
    for i in range(10):
        reading_id = f"{device['id']}_reading_{i}"
        sensorreadings_ref = db.collection("sensorReadings").document(reading_id)
        
        # Generate slightly different ranges for each device
        if device["id"] == "DEV001":
            humidity = 60 + random.uniform(-2, 2)
            co2 = 400 + i * 5
            temp = 22 + random.uniform(-0.5, 0.5)
            lidar = 150 - i
        else:
            humidity = 65 + random.uniform(-2, 2)
            co2 = 420 + i * 5
            temp = 23 + random.uniform(-0.5, 0.5)
            lidar = 140 - i
        
        sensorreadings_ref.set({
            "device_id": device["id"],
            "timestamp": base - timedelta(hours=i),
            "humidity": humidity,
            "co2_concentration": co2,
            "temperature": temp,
            "lidar_distance": lidar
        })

print("Seed data written!")
print(f"Created {len(devices)} devices with 10 sensor readings each")