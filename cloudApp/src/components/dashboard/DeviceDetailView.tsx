import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box,
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Co2 as Co2Icon,
  Height as HeightIcon,
  Cloud as CloudIcon,
  Battery20 as BatteryLowIcon,
  Battery90 as BatteryGoodIcon,
  SignalWifi4Bar as SignalGoodIcon,
  SignalWifiOff as SignalBadIcon
} from '@mui/icons-material';
import { getDevice } from '../../firebase/services/deviceService';
import { getFarm } from '../../firebase/services/farmService';
import SensorReadingCard from '../../components/cards/SensorReadingCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Device {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lowBattery: boolean;
  registeredFarm: string;
  createdAt: any;
  userId: string;
}

interface Farm {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
}

const DeviceDetailView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [mockReadings, setMockReadings] = useState({
    temperature: generateMockTimeSeriesData(24, 20, 35),
    humidity: generateMockTimeSeriesData(24, 30, 80),
    co2: generateMockTimeSeriesData(24, 400, 1200),
    lidar: generateMockTimeSeriesData(24, 50, 300),
    outdoorTemp: generateMockTimeSeriesData(24, 5, 25)
  });

  // Function to generate mock time series data for demonstration
  function generateMockTimeSeriesData(points: number, min: number, max: number) {
    const now = new Date();
    const data = [];
    
    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000); // hourly data
      const value = Math.round((Math.random() * (max - min) + min) * 10) / 10;
      data.push({
        timestamp: time,
        value: value
      });
    }
    
    return data;
  }

  useEffect(() => {
    const fetchDeviceAndFarm = async () => {
      if (!deviceId) return;
      
      try {
        setLoading(true);
        
        // Fetch device details
        const deviceData = await getDevice(deviceId);
        if (!deviceData) {
          console.error('Device not found');
          navigate('/devices');
          return;
        }
        
        // Cast the deviceData to the Device type
        const typedDeviceData = deviceData as unknown as Device;
        setDevice(typedDeviceData);
        
        // Fetch associated farm details if available
        if (typedDeviceData.registeredFarm) {
          const farmData = await getFarm(typedDeviceData.registeredFarm);
          if (farmData) {
            setFarm(farmData as Farm);
          }
        }
      } catch (error) {
        console.error('Error fetching device details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAndFarm();
  }, [deviceId, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!device) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Device not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/devices')}
        >
          Back to Devices
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>
        {farm && (
          <Link component={RouterLink} underline="hover" color="inherit" to={`/farms/${farm.id}`}>
            {farm.name}
          </Link>
        )}
        <Link component={RouterLink} underline="hover" color="inherit" to="/devices">
          Devices
        </Link>
        <Typography color="text.primary">{device.name}</Typography>
      </Breadcrumbs>

      {/* Device Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton 
                size="small" 
                sx={{ mr: 1 }}
                onClick={() => farm ? navigate(`/farms/${farm.id}`) : navigate('/devices')}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1">
                {device.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                {device.lowBattery ? (
                  <Chip
                    icon={<BatteryLowIcon />}
                    label="Low Battery"
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <Chip
                    icon={<BatteryGoodIcon />}
                    label="Battery OK"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                )}
                <Chip 
                  icon={device.isActive ? <SignalGoodIcon /> : <SignalBadIcon />}
                  label={device.isActive ? 'Online' : 'Offline'}
                  color={device.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Type: <strong>{device.type || 'Unknown'}</strong>
              {farm && (
                <> | Farm: <Link component={RouterLink} to={`/farms/${farm.id}`}>{farm.name}</Link></>
              )}
              {' '}| ID: <code>{device.id}</code>
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />}
            onClick={() => navigate(`/devices/${deviceId}/settings`)}
          >
            Device Settings
          </Button>
        </Box>
      </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="device data tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Temperature" />
          <Tab label="Humidity" />
          <Tab label="CO₂" />
          <Tab label="Fill Level" />
          <Tab label="Alerts" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SensorReadingCard 
              title="Temperature"
              value={`${mockReadings.temperature[mockReadings.temperature.length - 1].value}°C`}
              data={mockReadings.temperature}
              icon={<ThermostatIcon />}
              color="#f44336"
              unit="°C"
              timestamp={mockReadings.temperature[mockReadings.temperature.length - 1].timestamp}
              description="Internal bin temperature"
              onClick={() => setTabValue(1)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SensorReadingCard 
              title="Humidity"
              value={`${mockReadings.humidity[mockReadings.humidity.length - 1].value}%`}
              data={mockReadings.humidity}
              icon={<WaterDropIcon />}
              color="#2196f3"
              unit="%"
              timestamp={mockReadings.humidity[mockReadings.humidity.length - 1].timestamp}
              description="Internal relative humidity"
              onClick={() => setTabValue(2)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SensorReadingCard 
              title="CO₂ Level"
              value={`${mockReadings.co2[mockReadings.co2.length - 1].value} ppm`}
              data={mockReadings.co2}
              icon={<Co2Icon />}
              color="#9e9e9e"
              unit="ppm"
              timestamp={mockReadings.co2[mockReadings.co2.length - 1].timestamp}
              description="Carbon dioxide concentration"
              onClick={() => setTabValue(3)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SensorReadingCard 
              title="Fill Level"
              value={`${mockReadings.lidar[mockReadings.lidar.length - 1].value} cm`}
              data={mockReadings.lidar}
              icon={<HeightIcon />}
              color="#4caf50"
              unit="cm"
              timestamp={mockReadings.lidar[mockReadings.lidar.length - 1].timestamp}
              description="Distance to grain surface (LiDAR)"
              onClick={() => setTabValue(4)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SensorReadingCard 
              title="Outdoor Temperature"
              value={`${mockReadings.outdoorTemp[mockReadings.outdoorTemp.length - 1].value}°C`}
              data={mockReadings.outdoorTemp}
              icon={<CloudIcon />}
              color="#3f51b5"
              unit="°C"
              timestamp={mockReadings.outdoorTemp[mockReadings.outdoorTemp.length - 1].timestamp}
              description="External ambient temperature"
              onClick={() => setTabValue(1)}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Temperature Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Temperature Data
          </Typography>
          <Typography variant="body1" paragraph>
            Detailed temperature analysis and historical data will be displayed here.
          </Typography>
          {/* Placeholder for future temperature charts and data */}
          <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Temperature charts will be displayed here
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      {/* Humidity Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Humidity Data
          </Typography>
          <Typography variant="body1" paragraph>
            Detailed humidity analysis and historical data will be displayed here.
          </Typography>
          {/* Placeholder for future humidity charts and data */}
          <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Humidity charts will be displayed here
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      {/* CO2 Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            CO₂ Data
          </Typography>
          <Typography variant="body1" paragraph>
            Detailed CO₂ analysis and historical data will be displayed here.
          </Typography>
          {/* Placeholder for future CO₂ charts and data */}
          <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              CO₂ charts will be displayed here
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      {/* Fill Level Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Fill Level Data
          </Typography>
          <Typography variant="body1" paragraph>
            Detailed fill level analysis and historical data will be displayed here.
          </Typography>
          {/* Placeholder for future fill level charts and data */}
          <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Fill level charts will be displayed here
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      {/* Alerts Tab */}
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Device Alerts
          </Typography>
          <Typography variant="body1" paragraph>
            Alert history and notifications for this device will be displayed here.
          </Typography>
          {/* Placeholder for future alerts list */}
          <Box sx={{ height: '300px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No alerts found for this device
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      {/* History Tab */}
      <TabPanel value={tabValue} index={6}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Device History
          </Typography>
          <Typography variant="body1" paragraph>
            Complete historical data and events will be displayed here.
          </Typography>
          {/* Placeholder for future history timeline */}
          <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Device history timeline will be displayed here
            </Typography>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default DeviceDetailView;