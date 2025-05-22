import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Chip, 
  Grid,
  Tooltip,
  LinearProgress,
  useTheme
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
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

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
  const theme = useTheme();

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Online' : 'Offline';
  };

  // Always return white background as per design guidelines
  const getBackgroundColor = () => '#FFFFFF';

  const getBorderColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'wheat':
        return '#FFC107'; // Amber
      case 'corn':
        return '#8BC34A'; // Light Green
      case 'soybean':
        return '#4CAF50'; // Green
      case 'rice':
        return '#00BCD4'; // Cyan
      case 'barley':
        return '#FFEB3B'; // Yellow
      case 'oats':
        return '#FF9800'; // Orange
      default:
        return '#E0E0E0'; // Grey
    }
  };

  // Calculate percentage for progress bars
  const getProgressValue = (reading: number | undefined, max: number, min: number = 0) => {
    if (reading === undefined) return 0;
    // Clamp between min and max, then normalize to 0-100
    const clamped = Math.min(Math.max(reading, min), max);
    return ((clamped - min) / (max - min)) * 100;
  };

  // Determine color based on value thresholds
  const getDataColor = (type: string, value: number | undefined) => {
    if (value === undefined) return theme.palette.statusColors.neutral;
    
    switch(type) {
      case 'temperature':
        if (value < 10) return theme.palette.statusColors.critical; // Too cold
        if (value > 30) return theme.palette.statusColors.critical; // Too hot
        if (value < 15 || value > 25) return theme.palette.statusColors.warning; // Warning range
        return theme.palette.statusColors.optimal;
      
      case 'humidity':
        if (value < 30) return theme.palette.statusColors.critical; // Too dry
        if (value > 80) return theme.palette.statusColors.critical; // Too humid
        if (value < 40 || value > 70) return theme.palette.statusColors.warning; // Warning range
        return theme.palette.statusColors.optimal;
        
      case 'co2':
        if (value > 1000) return theme.palette.statusColors.critical; // Dangerous
        if (value > 800) return theme.palette.statusColors.warning; // Warning
        return theme.palette.statusColors.optimal;
        
      case 'lidar': // Fill level
        if (value < 50) return theme.palette.statusColors.fillLow;
        if (value < 150) return theme.palette.statusColors.fillMedium;
        return theme.palette.statusColors.fillHigh;
        
      default:
        return theme.palette.statusColors.neutral;
    }
  };

  // Create tooltip text based on value and type
  const getTooltipText = (type: string, value: number | undefined) => {
    if (value === undefined) return 'No data available';
    
    switch(type) {
      case 'temperature':
        if (value < 10) return 'Critical: Temperature too low';
        if (value > 30) return 'Critical: Temperature too high';
        if (value < 15) return 'Warning: Temperature slightly low';
        if (value > 25) return 'Warning: Temperature slightly high';
        return 'Optimal temperature range';
      
      case 'humidity':
        if (value < 30) return 'Critical: Humidity too low';
        if (value > 80) return 'Critical: Humidity too high';
        if (value < 40) return 'Warning: Humidity slightly low';
        if (value > 70) return 'Warning: Humidity slightly high';
        return 'Optimal humidity range';
        
      case 'co2':
        if (value > 1000) return 'Critical: CO₂ levels too high';
        if (value > 800) return 'Warning: CO₂ levels elevated';
        return 'Optimal CO₂ levels';
        
      case 'lidar': // Fill level
        const fillPercent = Math.round((300 - value) / 3); // Assuming 0-300cm range is 0-100%
        if (fillPercent < 30) return `Low fill level (${fillPercent}%)`;
        if (fillPercent < 70) return `Medium fill level (${fillPercent}%)`;
        return `High fill level (${fillPercent}%)`;
        
      default:
        return `Value: ${value}`;
    }
  };

  // Calculate progress values for different sensor types
  const humidityProgress = getProgressValue(device.latestReadings?.humidity, 100);
  const tempProgress = getProgressValue(device.latestReadings?.temperature, 40, 0);
  const co2Progress = getProgressValue(device.latestReadings?.co2, 2000, 400);
  const lidarProgress = device.latestReadings?.lidar 
    ? Math.round((300 - device.latestReadings.lidar) / 3) // Convert to percentage (0-100%)
    : 0;
    return (
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
        borderLeft: `4px solid ${getBorderColor(device.type)}`,
      }}
    ><CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header with name and status icons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {device.name}
            </Typography>
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
          </Box>

          {/* Sensor readings with progress bars */}
          {device.latestReadings && (
            <Grid container spacing={2}>
              {device.latestReadings.temperature !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThermostatIcon sx={{ fontSize: 18, color: 'error.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Temperature
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {device.latestReadings.temperature}°C
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={tempProgress} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        mt: 0.5,
                        bgcolor: 'rgba(229, 115, 115, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'error.main',
                        }
                      }} 
                    />
                  </Box>
                </Grid>
              )}
              
              {device.latestReadings.humidity !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WaterDropIcon sx={{ fontSize: 18, color: 'info.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Humidity
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {device.latestReadings.humidity}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={humidityProgress} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        mt: 0.5,
                        bgcolor: 'rgba(66, 165, 245, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'info.main',
                        }
                      }} 
                    />
                  </Box>
                </Grid>
              )}
              
              {device.latestReadings.co2 !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Co2Icon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          CO₂
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {device.latestReadings.co2} ppm
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={co2Progress} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        mt: 0.5,
                        bgcolor: 'rgba(158, 158, 158, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'text.secondary',
                        }
                      }} 
                    />
                  </Box>
                </Grid>
              )}
              
              {device.latestReadings.lidar !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HeightIcon sx={{ fontSize: 18, color: 'success.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Fill Level
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.lidar} cm
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={lidarProgress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mt: 0.5,
                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main',
                      }
                    }} 
                  />
                </Grid>
              )}
              
              {device.latestReadings.outdoorTemp !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CloudIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Outdoor Temp
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {device.latestReadings.outdoorTemp}°C
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              ID: {device.id.substring(0, 8)}...
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              View Details →
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DeviceCard;