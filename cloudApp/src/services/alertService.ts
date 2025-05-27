import { Alert, AlertSeverity, AlertStatus, AlertType, AlertStats } from '../types/alerts';

// Mock alert data for demonstration
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: AlertType.TEMPERATURE_HIGH,
    severity: AlertSeverity.HIGH,
    status: AlertStatus.ACTIVE,
    title: 'High Temperature Alert',
    message: 'Temperature in Grain Bin #3 has exceeded the safe threshold',
    farmId: 'farm-001',
    farmName: 'Green Valley Farm',
    deviceId: 'device-001',
    deviceName: 'Grain Bin #3',
    sensorType: 'Temperature',
    value: 32.5,
    threshold: 30,
    unit: '°C',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: AlertType.BATTERY_LOW,
    severity: AlertSeverity.MEDIUM,
    status: AlertStatus.ACKNOWLEDGED,
    title: 'Low Battery Warning',
    message: 'Battery level is below 20% for Field Sensor A2',
    farmId: 'farm-001',
    farmName: 'Green Valley Farm',
    deviceId: 'device-002',
    deviceName: 'Field Sensor A2',
    sensorType: 'Battery',
    value: 18,
    threshold: 20,
    unit: '%',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 45),
    acknowledgedBy: 'John Doe',
  },
  {
    id: '3',
    type: AlertType.SENSOR_OFFLINE,
    severity: AlertSeverity.CRITICAL,
    status: AlertStatus.ACTIVE,
    title: 'Sensor Offline',
    message: 'Weather Station has been offline for more than 10 minutes',
    farmId: 'farm-002',
    farmName: 'Sunny Acres',
    deviceId: 'device-003',
    deviceName: 'Weather Station',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '4',
    type: AlertType.HUMIDITY_LOW,
    severity: AlertSeverity.LOW,
    status: AlertStatus.RESOLVED,
    title: 'Low Humidity',
    message: 'Humidity levels dropped below optimal range in Greenhouse #1',
    farmId: 'farm-001',
    farmName: 'Green Valley Farm',
    deviceId: 'device-004',
    deviceName: 'Greenhouse #1',
    sensorType: 'Humidity',
    value: 35,
    threshold: 40,
    unit: '%',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    resolvedBy: 'Jane Smith',
  },
  {
    id: '5',
    type: AlertType.CO2_HIGH,
    severity: AlertSeverity.MEDIUM,
    status: AlertStatus.ACTIVE,
    title: 'Elevated CO₂ Levels',
    message: 'CO₂ concentration is above normal in Storage Unit B',
    farmId: 'farm-003',
    farmName: 'Harvest Fields',
    deviceId: 'device-005',
    deviceName: 'Storage Unit B',
    sensorType: 'CO₂',
    value: 1200,
    threshold: 1000,
    unit: 'ppm',
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '6',
    type: AlertType.FILL_LEVEL_HIGH,
    severity: AlertSeverity.LOW,
    status: AlertStatus.ACKNOWLEDGED,
    title: 'Storage Nearly Full',
    message: 'Grain storage is at 95% capacity in Silo #2',
    farmId: 'farm-002',
    farmName: 'Sunny Acres',
    deviceId: 'device-006',
    deviceName: 'Silo #2',
    sensorType: 'Fill Level',
    value: 95,
    threshold: 90,
    unit: '%',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30),
    acknowledgedBy: 'Mike Johnson',
  },
];

export class AlertService {
  private static alerts: Alert[] = [...mockAlerts];

  static async getAllAlerts(): Promise<Alert[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.alerts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getAlertsByStatus(status: AlertStatus): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.alerts.filter(alert => alert.status === status);
  }

  static async getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.alerts.filter(alert => alert.severity === severity);
  }

  static async getActiveAlerts(): Promise<Alert[]> {
    return this.getAlertsByStatus(AlertStatus.ACTIVE);
  }

  static async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) return null;
    
    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedAt: new Date(),
      acknowledgedBy,
      updatedAt: new Date(),
    };
    
    return this.alerts[alertIndex];
  }

  static async resolveAlert(alertId: string, resolvedBy: string): Promise<Alert | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) return null;
    
    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedBy,
      updatedAt: new Date(),
    };
    
    return this.alerts[alertIndex];
  }

  static async deleteAlert(alertId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) return false;
    
    this.alerts.splice(alertIndex, 1);
    return true;
  }

  static async getAlertStats(): Promise<AlertStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats: AlertStats = {
      total: this.alerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byType: {} as Record<AlertType, number>,
    };

    // Initialize byType with all alert types
    Object.values(AlertType).forEach(type => {
      stats.byType[type] = 0;
    });

    this.alerts.forEach(alert => {
      // Count by status
      switch (alert.status) {
        case AlertStatus.ACTIVE:
          stats.active++;
          break;
        case AlertStatus.ACKNOWLEDGED:
          stats.acknowledged++;
          break;
        case AlertStatus.RESOLVED:
          stats.resolved++;
          break;
      }

      // Count by severity
      stats.bySeverity[alert.severity]++;

      // Count by type
      stats.byType[alert.type]++;
    });

    return stats;
  }

  static getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.LOW:
        return '#2196F3'; // Blue
      case AlertSeverity.MEDIUM:
        return '#FFA726'; // Orange
      case AlertSeverity.HIGH:
        return '#FF5722'; // Red-Orange
      case AlertSeverity.CRITICAL:
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  }

  static getSeverityIcon(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.LOW:
        return 'info';
      case AlertSeverity.MEDIUM:
        return 'warning';
      case AlertSeverity.HIGH:
        return 'error';
      case AlertSeverity.CRITICAL:
        return 'dangerous';
      default:
        return 'info';
    }
  }

  static getStatusColor(status: AlertStatus): string {
    switch (status) {
      case AlertStatus.ACTIVE:
        return '#F44336'; // Red
      case AlertStatus.ACKNOWLEDGED:
        return '#FFA726'; // Orange
      case AlertStatus.RESOLVED:
        return '#4CAF50'; // Green
      default:
        return '#757575'; // Gray
    }
  }

  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
