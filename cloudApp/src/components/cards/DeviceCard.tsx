import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Chip, 
  Grid,
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
  SignalWifiOff as SignalBadIcon
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
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success.main' : 'error.main';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Online' : 'Offline';
  };

  const getBackgroundColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'wheat':
        return '#FFF8E1'; // Light yellow
      case 'corn':
        return '#F1F8E9'; // Light green
      case 'soybean':
        return '#E8F5E9'; // Light green
      case 'rice':
        return '#E0F7FA'; // Light cyan
      case 'barley':
        return '#FFFDE7'; // Light yellow
      case 'oats':
        return '#FFF3E0'; // Light orange
      default:
        return '#F5F5F5'; // Light grey
    }
  };

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: getBackgroundColor(device.type),
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
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
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={device.type || 'Unknown Type'}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={getStatusLabel(device.isActive)}
              size="small"
              sx={{ bgcolor: getStatusColor(device.isActive), color: 'white' }}
            />
          </Box>

          {device.latestReadings && (
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {device.latestReadings.temperature !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThermostatIcon sx={{ fontSize: 18, color: 'error.main', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Temperature
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {device.latestReadings.temperature}°C
                  </Typography>
                </Grid>
              )}
              
              {device.latestReadings.humidity !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDropIcon sx={{ fontSize: 18, color: 'info.main', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Humidity
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {device.latestReadings.humidity}%
                  </Typography>
                </Grid>
              )}
              
              {device.latestReadings.co2 !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Co2Icon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      CO₂
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {device.latestReadings.co2} ppm
                  </Typography>
                </Grid>
              )}
              
              {device.latestReadings.lidar !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HeightIcon sx={{ fontSize: 18, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Fill Level
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {device.latestReadings.lidar} cm
                  </Typography>
                </Grid>
              )}
              
              {device.latestReadings.outdoorTemp !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CloudIcon sx={{ fontSize: 18, color: 'primary.main', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Outdoor Temp
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {device.latestReadings.outdoorTemp}°C
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ID: {device.id.substring(0, 8)}...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View Details →
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DeviceCard;