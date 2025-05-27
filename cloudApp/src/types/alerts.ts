export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

export enum AlertType {
  SENSOR_OFFLINE = 'sensor_offline',
  BATTERY_LOW = 'battery_low',
  TEMPERATURE_HIGH = 'temperature_high',
  TEMPERATURE_LOW = 'temperature_low',
  HUMIDITY_HIGH = 'humidity_high',
  HUMIDITY_LOW = 'humidity_low',
  CO2_HIGH = 'co2_high',
  FILL_LEVEL_HIGH = 'fill_level_high',
  FILL_LEVEL_LOW = 'fill_level_low',
  CONNECTION_LOST = 'connection_lost',
  SYSTEM_ERROR = 'system_error'
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  farmId?: string;
  farmName?: string;
  deviceId?: string;
  deviceName?: string;
  sensorType?: string;
  value?: number;
  threshold?: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  value: number | string | boolean;
  unit?: string;
}

export interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'notification';
  enabled: boolean;
  config: Record<string, any>;
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: Record<AlertType, number>;
}
