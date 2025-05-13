import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Container, 
  Box, 
  IconButton,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  DevicesOther as DeviceIcon,
  Thermostat as TempIcon,
  Opacity as HumidityIcon,
  Co2 as Co2Icon,
  Height as HeightIcon
} from '@mui/icons-material';
import { useSensorReadings } from '../../hooks/useSensorReadings';

interface DeviceInfo {
  name: string;
  type: string;
}

const DetailView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { readings, loading, error } = useSensorReadings(deviceId || '');

  const deviceInfo: Record<string, DeviceInfo> = {
    'DEV001': { name: 'Greenhouse #1', type: 'soy' },
    'DEV002': { name: 'Greenhouse #2', type: 'wheat' }
  };

  const currentDevice = deviceId ? deviceInfo[deviceId] : undefined;

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="div" sx={{ flex: 1 }}>
            {currentDevice?.name || `Device ${deviceId}`}
          </Typography>
          <Chip 
            icon={<DeviceIcon />} 
            label={currentDevice?.type || 'Unknown Type'} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : readings ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TempIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Temperature</Typography>
              </Box>
              <Typography variant="h3">{readings.temperature.toFixed(1)}°C</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: 'rgba(76, 175, 80, 0.05)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HumidityIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Humidity</Typography>
              </Box>
              <Typography variant="h3">{readings.humidity.toFixed(1)}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: 'rgba(156, 39, 176, 0.05)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Co2Icon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">CO2 Concentration</Typography>
              </Box>
              <Typography variant="h3">{readings.co2_concentration.toFixed(0)} ppm</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: 'rgba(255, 152, 0, 0.05)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HeightIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Distance</Typography>
              </Box>
              <Typography variant="h3">{readings.lidar_distance.toFixed(1)} cm</Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No sensor readings available for this device
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DetailView;