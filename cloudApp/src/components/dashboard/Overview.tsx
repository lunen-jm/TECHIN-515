import React, { useEffect } from 'react';
import { Grid, Container, Alert, Typography, Button, Box } from '@mui/material';
import DashboardCard from '../cards/DashboardCard';
import { 
  Thermostat as TempIcon,
  Opacity as HumidityIcon,
  Co2 as Co2Icon,
  Height as HeightIcon,
  DevicesOther as DeviceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSensorReadings } from '../../hooks/useSensorReadings';

const Overview = () => {
  const navigate = useNavigate();
  const { readings, loading, error } = useSensorReadings('DEV001');

  useEffect(() => {
    console.log('Overview component - Current readings:', readings);
    console.log('Overview component - Loading state:', loading);
    console.log('Overview component - Error state:', error);
  }, [readings, loading, error]);
  const dashboardItems = [
    {
      title: 'Temperature',
      stats: readings ? `${readings.temperature.toFixed(1)}°C` : '--',
      description: 'Current temperature',
      icon: TempIcon,
      path: '/temperature',
      timestamp: readings?.timestamp?.toDate()
    },
    {
      title: 'Humidity',
      stats: readings ? `${readings.humidity.toFixed(1)}%` : '--',
      description: 'Current humidity level',
      icon: HumidityIcon,
      path: '/humidity',
      timestamp: readings?.timestamp?.toDate()
    },
    {
      title: 'CO2',
      stats: readings ? `${readings.co2_concentration.toFixed(0)} ppm` : '--',
      description: 'CO2 concentration',
      icon: Co2Icon,
      path: '/co2',
      timestamp: readings?.timestamp?.toDate()
    },
    {
      title: 'Distance',
      stats: readings ? `${readings.lidar_distance.toFixed(1)} cm` : '--',
      description: 'LiDAR distance',
      icon: HeightIcon,
      path: '/distance',
      timestamp: readings?.timestamp?.toDate()
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Dashboard Overview</Typography>
        <Button
          variant="contained"
          startIcon={<DeviceIcon />}
          onClick={() => navigate('/devices')}
        >
          View Devices
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading sensor data: {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>            <DashboardCard
              title={item.title}
              stats={item.stats}
              description={item.description}
              icon={item.icon}
              onClick={() => navigate(item.path)}
              loading={loading}
              timestamp={item.timestamp}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Overview;