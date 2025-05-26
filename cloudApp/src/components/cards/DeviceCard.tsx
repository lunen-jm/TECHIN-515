import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Co2 as Co2Icon,
  Height as HeightIcon,
  Battery20 as BatteryLowIcon,
  Battery90 as BatteryGoodIcon,
  Cloud as CloudIcon,
  SignalWifi4Bar as SignalGoodIcon,
  SignalWifiOff as SignalBadIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import SiloIndicator from '../common/SiloIndicator';
import { getDeviceAlerts } from '../../firebase/services/alertService';

interface DeviceProps {
  device: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    lowBattery: boolean;
    registeredFarm: string;
    createdAt: any;
    latestReadings?: {
      temperature?: number;
      humidity?: number;
      co2?: number;
      lidar?: number;
      outdoorTemp?: number;
    };
  };
  onClick: () => void;
}

const DeviceCard: React.FC<DeviceProps> = ({ device, onClick }) => {
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Check for active alerts on component mount
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        setAlertsLoading(true);
        const alerts = await getDeviceAlerts(device.id);
        const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
        setHasActiveAlerts(unresolvedAlerts.length > 0);
      } catch (error) {
        console.error('Error checking device alerts:', error);
        setHasActiveAlerts(false);
      } finally {
        setAlertsLoading(false);
      }
    };

    checkAlerts();
  }, [device.id]);
  
  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Online' : 'Offline';
  };

  // Always return white background as per design guidelines
  const getBackgroundColor = () => '#FFFFFF';
  const getBorderColor = (type: string, hasAlerts: boolean, isLoading: boolean) => {
    // Priority 1: If we're still loading alerts, show neutral color
    if (isLoading) {
      return '#E0E0E0'; // Grey while loading
    }
    
    // Priority 2: If device has active alerts, show red (critical)
    if (hasAlerts) {
      return '#EF4444'; // Red for alerts
    }
      // Priority 3: If device is offline, show red (same as bad wifi signals)
    if (!device.isActive) {
      return '#EF5350'; // Red for offline (error.main)
    }
    
    // Priority 4: If device has low battery, show amber (warning)
    if (device.lowBattery) {
      return '#FFC107'; // Amber for low battery
    }
    
  // Priority 5: All good - use main green
    return '#4CAF50'; // Main green for good status
  };
  
  const getStatusTooltip = () => {
    if (alertsLoading) return 'Checking alert status...';
    if (hasActiveAlerts) return 'Device has active alerts';
    if (!device.isActive) return 'Device is offline';
    if (device.lowBattery) return 'Low battery warning';
    return 'Device status is good';
  };// Calculate percentage for lidar fill level
  const lidarProgress = device.latestReadings?.lidar 
    ? Math.round((300 - device.latestReadings.lidar) / 3) // Convert to percentage (0-100%)
    : 0;    return (
    <Tooltip title={getStatusTooltip()} placement="top" arrow>
      <Card 
        elevation={1}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: getBackgroundColor(),
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          },
          borderLeft: `4px solid ${getBorderColor(device.type, hasActiveAlerts, alertsLoading)}`,
        }}
      ><CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: 3 }}>          {/* Header with name and status icons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {device.name}
              </Typography>
              {hasActiveAlerts && !alertsLoading && (
                <Tooltip title="Has active alerts">
                  <Box sx={{ 
                    ml: 1, 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#EF4444',
                    animation: 'pulse 2s infinite' 
                  }} />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {device.lowBattery ? (
                <Tooltip title="Low Battery">
                  <BatteryLowIcon sx={{ color: 'warning.main', mr: 1 }} />
                </Tooltip>
              ) : (
                <Tooltip title="Battery Good">
                  <BatteryGoodIcon sx={{ color: 'success.main', mr: 1 }} />
                </Tooltip>
              )}
              {device.isActive ? (
                <Tooltip title="Online">
                  <SignalGoodIcon sx={{ color: 'success.main' }} />
                </Tooltip>
              ) : (
                <Tooltip title="Offline">
                  <SignalBadIcon sx={{ color: 'error.main' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
          
          {/* Status chips */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Chip 
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              label={device.type || 'Unknown Type'}
              size="small"
              sx={{ 
                mr: 1, 
                color: 'text.primary',
                bgcolor: 'background.default',
                fontWeight: 500,
                border: '1px solid',
                borderColor: 'divider' 
              }}
            />
            <Chip 
              label={getStatusLabel(device.isActive)}
              size="small"
              variant="filled"
              sx={{ 
                bgcolor: device.isActive ? 'success.main' : 'error.main', 
                color: 'white',
                fontWeight: 500 
              }}
            />
          </Box>          {/* Sensor readings with bin indicator and stats */}
          {device.latestReadings && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              {/* Bin indicator for fill level */}
              {device.latestReadings.lidar !== undefined && (
                <Box sx={{ flex: '0 0 auto' }}>
                  <SiloIndicator
                    fillPercentage={lidarProgress}
                    height={100}
                    width={50}
                    variant="minimal"
                    showPercentage={false}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Fill Level
                  </Typography>
                </Box>
              )}
              
              {/* Stats as values */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {device.latestReadings.temperature !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThermostatIcon sx={{ fontSize: 18, color: 'error.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Temperature
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.temperature.toFixed(2)}°C
                    </Typography>
                  </Box>
                )}
                
                {device.latestReadings.humidity !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WaterDropIcon sx={{ fontSize: 18, color: 'info.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Humidity
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.humidity.toFixed(2)}%
                    </Typography>
                  </Box>
                )}
                
                {device.latestReadings.co2 !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Co2Icon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        CO₂
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.co2.toFixed(2)} ppm
                    </Typography>
                  </Box>
                )}
                
                {device.latestReadings.outdoorTemp !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CloudIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Outdoor Temp
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.outdoorTemp.toFixed(2)}°C
                    </Typography>
                  </Box>
                )}
                
                {device.latestReadings.lidar !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HeightIcon sx={{ fontSize: 18, color: 'success.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Distance
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.lidar.toFixed(2)} cm
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              ID: {device.id.substring(0, 8)}...
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              View Details →
            </Typography>
          </Box>        </CardContent>
      </CardActionArea>
    </Card>
    </Tooltip>
  );
};

export default DeviceCard;