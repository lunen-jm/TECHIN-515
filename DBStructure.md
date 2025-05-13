# DB Structure

## Measured Data:

Here are the values that are transmitted from sensors on the sensing device:

* humidity
* CO2 concentration
* temperature
* LiDar distance
* outdoor temperature

Additionally, we can add a tag into the data that shows which device it is being transmitted from, which can auto-populate a large chunk of the data

## DB Structure

With this data, we are going to need to make a relational DB to store the data, and allow it to be separated from eachother for each user view:

DATABASE
│
├── USERS
│   ├── user_id (PK)
│   ├── username
│   ├── email
│   ├── password_hash
│   ├── created_at
│   ├── local_admin
│   └── global_admin
│
├── DEVICES
│   ├── device_id (PK)
│   ├── name
│   ├── registered_farm
│   ├── bin_type
│   ├── created_at
│   ├── is_active
│   ├── low_battery
│   └── user_id (FK → USERS)
│
├── HUMIDITY_READINGS
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   └── humidity_value
│
├── CO2_READINGS
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   └── co2_value
│
├── TEMPERATURE_READINGS
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   └── temperature_value
│
├── LIDAR_READINGS
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   └── distance_value
│
├── OUTDOOR_TEMP_READINGS
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   └── outdoor_temp_value
│
├── FARM_GROUPS
│   ├── farm_id (PK)
│   ├── name
│   ├── description
│   └── user_id (FK → USERS)
│
├── DEVICE_GROUP_MEMBERSHIPS
│   ├── membership_id (PK)
│   ├── farm_id (FK → FARM_GROUPS)
│   └── device_id (FK → DEVICES)
│
└── ALERTS
    ├── alert_id (PK)
    ├── device_id (FK → DEVICES)
    ├── type
    ├── message
    ├── created_at
    └── is_resolved



### DB Code (ERDiagram)

```
DEVICE {
    string device_id PK
    string name
    string registered_farm
    string bin_type
    timestamp created_at
    boolean is_active
    boolean low_battery
    string user_id FK
}

HUMIDITY_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float humidity_value
}

CO2_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float co2_value
}

TEMPERATURE_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float temperature_value
}

LIDAR_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float distance_value
}

OUTDOOR_TEMP_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float outdoor_temp_value
}

USER {
    string user_id PK
    string username
    string email
    string password_hash
    timestamp created_at
    boolean local_admin
    boolean global_admin
}

FARM_GROUP {
    int farm_id PK
    string name
    string description
    string user_id FK
}

DEVICE_GROUP_MEMBERSHIP {
    int membership_id PK
    int farm_id FK
    string device_id FK
}

ALERT {
    int alert_id PK
    string device_id FK
    string type
    string message
    timestamp created_at
    boolean is_resolved
}

USER ||--o{ DEVICE : "owns"
USER ||--o{ FARM_GROUP : "creates"
DEVICE ||--o{ HUMIDITY_READING : "generates"
DEVICE ||--o{ CO2_READING : "generates"
DEVICE ||--o{ TEMPERATURE_READING : "generates"
DEVICE ||--o{ LIDAR_READING : "generates"
DEVICE ||--o{ OUTDOOR_TEMP_READING : "generates"
DEVICE ||--o{ ALERT : "triggers"
FARM_GROUP ||--o{ DEVICE_GROUP_MEMBERSHIP : "contains"
DEVICE ||--o{ DEVICE_GROUP_MEMBERSHIP : "belongs_to"
```

### DB Code - Firebase

firebase-project/
├── users/
│   └── {user_id}/
│       ├── username: string
│       ├── email: string
│       ├── createdAt: timestamp
│       ├── localAdmin: boolean
│       └── globalAdmin: boolean
│
├── devices/
│   └── {device_id}/
│       ├── name: string
│       ├── registeredFarm: string
│       ├── type: string
│       ├── createdAt: timestamp
│       ├── isActive: boolean
│       ├── lowBattery: boolean
│       └── userId: string (reference to users/{user_id})
│
├── farms/
│   └── {farm_id}/
│       ├── name: string
│       ├── description: string
│       └── userId: string (reference to users/{user_id})
│
├── farmDevices/
│   └── {membership_id}/
│       ├── farmId: string (reference to farms/{farm_id})
│       └── deviceId: string (reference to devices/{device_id})
│
├── readings/
│   ├── humidity/
│   │   └── {reading_id}/
│   │       ├── deviceId: string
│   │       ├── timestamp: timestamp
│   │       └── value: number
│   │
│   ├── co2/
│   │   └── {reading_id}/
│   │       ├── deviceId: string
│   │       ├── timestamp: timestamp
│   │       └── value: number
│   │
│   // Similar structure for temperature, lidar, and outdoor_temp
│
└── alerts/
    └── {alert_id}/
        ├── deviceId: string
        ├── type: string
        ├── message: string
        ├── createdAt: timestamp
        └── isResolved: boolean