import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box,
  Paper,
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
  Battery20 as BatteryLowIcon,
    Battery90 as BatteryGoodIcon,
  SignalWifi4Bar as SignalGoodIcon,
  SignalWifiOff as SignalBadIcon
} from '@mui/icons-material';
import { getDevice } from '../../firebase/services/deviceService';
import { getFarm } from '../../firebase/services/farmService';
import { 
  getTemperatureReadings,
  getHumidityReadings,
  getCO2Readings,
  getLidarReadings,
  getOutdoorTempReadings
} from '../../firebase/services/readingsService';
import SiloIndicator from '../common/SiloIndicator';
import SensorChart from '../charts/SensorChart';

interface ChartTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function ChartTabPanel(props: ChartTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
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
  const [chartTabValue, setChartTabValue] = useState(0);
  const [chartLoading, setChartLoading] = useState(false);
    // Real sensor data from Firebase
  const [sensorData, setSensorData] = useState({
    temperature: [] as any[],
    humidity: [] as any[],
    co2: [] as any[],
    lidar: [] as any[],
    outdoorTemp: [] as any[]
  });  // Helper functions to get latest sensor values
  const getLatestValue = (dataArray: any[], defaultValue: number = 0) => {
    if (!dataArray || dataArray.length === 0) return defaultValue.toFixed(2);
    const value = dataArray[dataArray.length - 1]?.value || defaultValue;
    return value.toFixed(2);
  };

  const getLatestTemperature = () => getLatestValue(sensorData.temperature, 25);
  const getLatestHumidity = () => getLatestValue(sensorData.humidity, 60);
  const getLatestCO2 = () => getLatestValue(sensorData.co2, 400);
  const getLatestLidar = () => getLatestValue(sensorData.lidar, 150);
  
  // Calculate fill percentage from lidar reading (assuming 300cm is empty, 50cm is full)
  const getFillPercentage = () => {
    const lidarValue = getLatestLidar();
    const fillPercentage = Math.round(((300 - lidarValue) / 250) * 100);
    return Math.max(0, Math.min(100, fillPercentage)); // Clamp between 0-100%
  };
  const fetchSensorData = async (deviceId: string) => {
    if (!deviceId) return;
    
    try {
      setChartLoading(true);
      console.log('=== FETCHING SENSOR DATA ===');
      console.log('Device ID:', deviceId);
      
      // Fetch data from Firebase (limit to last 100 readings for performance)
      const [temperature, humidity, co2, lidar, outdoorTemp] = await Promise.all([
        getTemperatureReadings(deviceId, 100),
        getHumidityReadings(deviceId, 100),
        getCO2Readings(deviceId, 100),
        getLidarReadings(deviceId, 100),
        getOutdoorTempReadings(deviceId, 100)
      ]);      console.log('=== RAW FIREBASE RESPONSES ===');
      console.log('Temperature data:', temperature);
      console.log('Humidity data:', humidity);
      console.log('CO2 data:', co2);
      console.log('Lidar data:', lidar);
      console.log('Outdoor temp data:', outdoorTemp);

      console.log('=== DATA LENGTHS ===');
      console.log('Temperature:', temperature?.length || 0);
      console.log('Humidity:', humidity?.length || 0);
      console.log('CO2:', co2?.length || 0);
      console.log('Lidar:', lidar?.length || 0);
      console.log('Outdoor temp:', outdoorTemp?.length || 0);

      // Additional debugging - check data structure
      if (temperature && temperature.length > 0) {
        console.log('=== SAMPLE TEMPERATURE DATA STRUCTURE ===');
        console.log('First temperature record:', temperature[0]);
        console.log('Temperature keys:', Object.keys(temperature[0] || {}));
      }
      
      if (humidity && humidity.length > 0) {
        console.log('=== SAMPLE HUMIDITY DATA STRUCTURE ===');
        console.log('First humidity record:', humidity[0]);
        console.log('Humidity keys:', Object.keys(humidity[0] || {}));
      }

      setSensorData({
        temperature: temperature || [],
        humidity: humidity || [],
        co2: co2 || [],
        lidar: lidar || [],
        outdoorTemp: outdoorTemp || []
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      // Keep empty arrays on error - charts will show "no data" message
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    const fetchDeviceAndFarm = async () => {
      if (!deviceId) return;
      
      try {
        setLoading(true);
        
        console.log('=== DEVICE DETAIL VIEW DEBUG ===');
        console.log('Attempting to fetch device with ID:', deviceId);
          // Fetch device details
        const deviceData = await getDevice(deviceId);
        console.log('Device data received:', deviceData);
        
        if (!deviceData) {
          console.warn('Device not found in devices collection, creating mock device for testing');
          // Create a mock device for testing purposes if device doesn't exist
          const mockDevice: Device = {
            id: deviceId,
            name: `Test Device ${deviceId}`,
            type: 'sensor',
            isActive: true,
            lowBattery: false,
            registeredFarm: '',
            createdAt: new Date(),
            userId: 'test-user'
          };
          setDevice(mockDevice);
        } else {
          // Cast the deviceData to the Device type
          const typedDeviceData = deviceData as unknown as Device;
          setDevice(typedDeviceData);
          
          // Fetch associated farm details if available
          if (typedDeviceData.registeredFarm) {
            console.log('Fetching farm with ID:', typedDeviceData.registeredFarm);
            const farmData = await getFarm(typedDeviceData.registeredFarm);
            if (farmData) {
              setFarm(farmData as Farm);
              console.log('Farm data received:', farmData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching device details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAndFarm();
    
    // Fetch sensor data for charts
    if (deviceId) {
      fetchSensorData(deviceId);
    }
  }, [deviceId, navigate]);
  const handleChartTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartTabValue(newValue);
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
      {/* Breadcrumb Navigation HIDDEN
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
      */}

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
            </Typography>          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Temporarily commenting out test button to fix compilation */}
            {/*
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={async () => {
                if (!deviceId) return;
                console.log('Adding test data for device:', deviceId);
                try {
                  const now = new Date();
                  const promises = [];
                  
                  for (let i = 0; i < 10; i++) {
                    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
                      promises.push(
                      addTemperatureReading({
                        device_id: deviceId,
                        temperature_value: parseFloat((20 + Math.random() * 10).toFixed(2)),
                        timestamp
                      }),
                      addHumidityReading({
                        device_id: deviceId,
                        humidity_value: parseFloat((40 + Math.random() * 40).toFixed(2)),
                        timestamp
                      }),
                      addCO2Reading({
                        device_id: deviceId,
                        co2_value: parseFloat((400 + Math.random() * 800).toFixed(2)),
                        timestamp
                      }),
                      addLidarReading({
                        device_id: deviceId,
                        distance_value: parseFloat((50 + Math.random() * 150).toFixed(2)),
                        timestamp
                      }),
                      addOutdoorTempReading({
                        device_id: deviceId,
                        outdoor_temp_value: parseFloat((5 + Math.random() * 20).toFixed(2)),
                        timestamp
                      })
                    );
                  }
                  
                  await Promise.all(promises);
                  console.log('Test data added successfully');
                  
                  // Refresh the charts
                  fetchSensorData(deviceId);
                } catch (error) {
                  console.error('Error adding test data:', error);
                }
              }}
            >
              Add Test Data
            </Button>
            */}
            <Button 
              variant="outlined" 
              startIcon={<SettingsIcon />}
              onClick={() => navigate(`/devices/${deviceId}/settings`)}
            >
              Device Settings
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Layout */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left Column - Large Grain Bin Card */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}            sx={{ 
              p: 4, 
              height: 'fit-content', 
              borderRadius: 3,
              background: 'background.paper',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Device Title and Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>              <Typography variant="h5" fontWeight={600} sx={{ color: 'text.primary' }}>
                {device.type || 'Grain Storage'}
              </Typography>
              <Chip 
                size="small"
                label={device.isActive ? 'Online' : 'Offline'}
                color={device.isActive ? 'success' : 'error'}
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              />
            </Box>            {/* Large Silo Indicator */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SiloIndicator
                fillPercentage={getFillPercentage()}
                label=""
                variant="minimal"
                height={200}
                width={100}
              />
            </Box>            {/* Key Metrics */}
            <Grid container spacing={2}>
              <Grid item xs={6}>                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {getFillPercentage()}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Fill Level
                  </Typography>
                </Box>
              </Grid>              <Grid item xs={6}>                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h4" fontWeight={700} color="#10B981">
                    {getLatestTemperature()}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Temperature
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column - Stats Card */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}            sx={{ 
              p: 4, 
              borderRadius: 3, 
              background: 'background.paper', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              height: 'fit-content'
            }}
          >            <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary">
              Sensor Stats
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph fontWeight={400} sx={{ mb: 3 }}>
              Current readings from all sensors
            </Typography>
              <Grid container spacing={2}>              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThermostatIcon sx={{ color: 'error.main', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Temperature
                    </Typography>
                  </Box>                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {getLatestTemperature()}°C
                  </Typography>
                </Box>
              </Grid>              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDropIcon sx={{ color: 'info.main', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Humidity
                    </Typography>                  </Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {getLatestHumidity()}%
                  </Typography>
                </Box>              </Grid>              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Co2Icon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      CO₂
                    </Typography>
                  </Box>                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {getLatestCO2()} ppm
                  </Typography>
                </Box>
              </Grid>              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HeightIcon sx={{ color: 'success.main', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Distance
                    </Typography>
                  </Box>                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {getLatestLidar()} cm
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Device Status */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={500} gutterBottom>
                Device Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {device.lowBattery ? (
                      <>
                        <BatteryLowIcon sx={{ color: 'warning.main', mr: 1, fontSize: 18 }} />                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          Low Battery
                        </Typography>
                      </>
                    ) : (
                      <>
                        <BatteryGoodIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          Battery OK
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {device.isActive ? (
                      <>
                        <SignalGoodIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          Strong Signal
                        </Typography>
                      </>
                    ) : (
                      <>
                        <SignalBadIcon sx={{ color: 'error.main', mr: 1, fontSize: 18 }} />                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          Weak Signal
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>      {/* Charts Area */}      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3,
          background: 'background.paper',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >{/* Charts Header with Tabs */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 4, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>            <Typography variant="h5" fontWeight={600} color="text.primary">
              Historical Data
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => deviceId && fetchSensorData(deviceId)}
              disabled={chartLoading}
              sx={{ textTransform: 'none' }}
            >
              {chartLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
          <Tabs 
            value={chartTabValue} 
            onChange={handleChartTabChange} 
            aria-label="chart data tabs"
            variant="scrollable"
            scrollButtons="auto"            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'info.main',
                  fontWeight: 600,
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'info.main',
              }
            }}
          >
            <Tab label="Temperature" />
            <Tab label="Humidity" />
            <Tab label="CO₂ Levels" />
            <Tab label="Fill Level" />
            <Tab label="Trends" />
          </Tabs>
        </Box>        {/* Chart Content Areas */}        <ChartTabPanel value={chartTabValue} index={0}>
          <SensorChart
            data={sensorData.temperature}
            title="Temperature"
            unit="°C"
            color="#EF4444"
            loading={chartLoading}
          />
        </ChartTabPanel><ChartTabPanel value={chartTabValue} index={1}>
          <SensorChart
            data={sensorData.humidity}
            title="Humidity"
            unit="%"
            color="#3B82F6"
            loading={chartLoading}
          />
        </ChartTabPanel>        <ChartTabPanel value={chartTabValue} index={2}>
          <SensorChart
            data={sensorData.co2}
            title="CO₂"
            unit="ppm"
            color="#6B7280"
            loading={chartLoading}
          />
        </ChartTabPanel>        <ChartTabPanel value={chartTabValue} index={3}>
          <SensorChart
            data={sensorData.lidar}
            title="Fill Level"
            unit="cm"
            color="#10B981"
            loading={chartLoading}
          />
        </ChartTabPanel>        <ChartTabPanel value={chartTabValue} index={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Outdoor Temperature vs Indoor Sensors
            </Typography>
            <SensorChart
              data={sensorData.outdoorTemp}
              title="Outdoor Temperature"
              unit="°C"
              color="#F59E0B"
              loading={chartLoading}
            />
          </Box>
        </ChartTabPanel>
      </Paper>
    </Box>
  );
};

export default DeviceDetailView;