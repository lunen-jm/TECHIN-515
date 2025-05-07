from google.cloud import firestore
from datetime import datetime, timedelta
import random

db = firestore.Client()

# 1) 创建 /users/<uid>
user_ref = db.collection("users").document()          # 自动生成 uid
user_ref.set({
    "username": "demo",
    "email": "demo@example.com",
    "password_hash": "bcrypt$...",
    "created_at": datetime.utcnow(),
    "local_admin": False,
    "global_admin": False
})

# 2) 创建 /devices/DEV001
device_id = "DEV001"
device_ref = db.collection("devices").document(device_id)
device_ref.set({
    "name": "Greenhouse #1",
    "registered_farm": "Farm A",
    "type": "ESP32‑S2",
    "created_at": datetime.utcnow(),
    "is_active": True,
    "low_battery": False,
    "user_id": user_ref.id      # 也可以存 user_ref.path
})

# 3) 批量写入 10 条 /devices/DEV001/sensorReadings/*
batch = db.batch()
base = datetime.utcnow()
for i in range(10):
    r = {
        "timestamp": base - timedelta(hours=i),
        "humidity": 60 + random.uniform(-2, 2),
        "co2_concentration": 400 + i * 5,
        "temperature": 22 + random.uniform(-0.5, 0.5),
        "lidar_distance": 150 - i
    }
    doc_ref = device_ref.collection("sensorReadings").document()
    batch.set(doc_ref, r)

batch.commit()
print("Seed data written!")
