# DB Structure

## Measured Data:

Here are the values that are transmitted from sensors on the sensing device:

* humidity
* CO2 concentration
* temperature
* LiDar distance

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
│   ├── type
│   ├── created_at
│   ├── is_active
│   ├── low_battery
│   ├── bin_type
│   └── farm_id (FK → USERS)
│
├── SENSOR_READINGS()
│   ├── reading_id (PK)
│   ├── device_id (FK → DEVICES)
│   ├── timestamp
│   ├── humidity
│   ├── co2_concentration
│   ├── temperature
│   └── lidar_distance
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
    string type
    timestamp created_at
    boolean is_active
    boolean low_battery
    string user_id FK
}

SENSOR_READING {
    int reading_id PK
    string device_id FK
    timestamp timestamp
    float humidity
    float co2_concentration
    float temperature
    float lidar_distance
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
DEVICE ||--o{ SENSOR_READING : "generates"
DEVICE ||--o{ ALERT : "triggers"
FARM_GROUP ||--o{ DEVICE_GROUP_MEMBERSHIP : "contains"
DEVICE ||--o{ DEVICE_GROUP_MEMBERSHIP : "belongs_to"
```