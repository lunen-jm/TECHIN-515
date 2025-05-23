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
import SiloIndicator from '../common/SiloIndicator';

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
  const navigate = useNavigate();  const [device, setDevice] = useState<Device | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartTabValue, setChartTabValue] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      {/* Main Content Layout */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left Column - Large Grain Bin Card */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              height: 'fit-content', 
              borderRadius: 3,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Device Title and Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight={600} sx={{ color: '#111827' }}>
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
            </Box>

            {/* Large Silo Indicator */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SiloIndicator
                fillPercentage={Math.round((300 - mockReadings.lidar[mockReadings.lidar.length - 1].value) / 3)}
                label=""
                variant="minimal"
                height={200}
                width={100}
              />
            </Box>

            {/* Key Metrics */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Typography variant="h4" fontWeight={700} color="#3B82F6">
                    {Math.round((300 - mockReadings.lidar[mockReadings.lidar.length - 1].value) / 3)}%
                  </Typography>
                  <Typography variant="body2" color="#6B7280" fontWeight={500}>
                    Fill Level
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Typography variant="h4" fontWeight={700} color="#10B981">
                    {mockReadings.temperature[mockReadings.temperature.length - 1].value}°C
                  </Typography>
                  <Typography variant="body2" color="#6B7280" fontWeight={500}>
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
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              height: 'fit-content'
            }}
          >
            <Typography variant="h5" fontWeight={600} gutterBottom color="#111827">
              Sensor Stats
            </Typography>
            <Typography variant="body2" color="#6B7280" paragraph fontWeight={400} sx={{ mb: 3 }}>
              Current readings from all sensors
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThermostatIcon sx={{ color: '#EF4444', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="#6B7280" fontWeight={500}>
                      Temperature
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    {mockReadings.temperature[mockReadings.temperature.length - 1].value}°C
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDropIcon sx={{ color: '#3B82F6', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="#6B7280" fontWeight={500}>
                      Humidity
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    {mockReadings.humidity[mockReadings.humidity.length - 1].value}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Co2Icon sx={{ color: '#6B7280', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="#6B7280" fontWeight={500}>
                      CO₂
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    {mockReadings.co2[mockReadings.co2.length - 1].value} ppm
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HeightIcon sx={{ color: '#10B981', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="#6B7280" fontWeight={500}>
                      Distance
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    {mockReadings.lidar[mockReadings.lidar.length - 1].value} cm
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Device Status */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #F3F4F6' }}>
              <Typography variant="subtitle2" color="#6B7280" fontWeight={500} gutterBottom>
                Device Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {device.lowBattery ? (
                      <>
                        <BatteryLowIcon sx={{ color: '#F59E0B', mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500} color="#111827">
                          Low Battery
                        </Typography>
                      </>
                    ) : (
                      <>
                        <BatteryGoodIcon sx={{ color: '#10B981', mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500} color="#111827">
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
                        <SignalGoodIcon sx={{ color: '#10B981', mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500} color="#111827">
                          Strong Signal
                        </Typography>
                      </>
                    ) : (
                      <>
                        <SignalBadIcon sx={{ color: '#EF4444', mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500} color="#111827">
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
      </Grid>

      {/* Charts Area */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Charts Header with Tabs */}
        <Box sx={{ borderBottom: '1px solid #F3F4F6', px: 4, pt: 3 }}>
          <Typography variant="h5" fontWeight={600} color="#111827" gutterBottom>
            Historical Data
          </Typography>
          <Tabs 
            value={chartTabValue} 
            onChange={handleChartTabChange} 
            aria-label="chart data tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#6B7280',
                '&.Mui-selected': {
                  color: '#3B82F6',
                  fontWeight: 600,
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3B82F6',
              }
            }}
          >
            <Tab label="Temperature" />
            <Tab label="Humidity" />
            <Tab label="CO₂ Levels" />
            <Tab label="Fill Level" />
            <Tab label="Trends" />
          </Tabs>
        </Box>

        {/* Chart Content Areas */}
        <ChartTabPanel value={chartTabValue} index={0}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ThermostatIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="#6B7280" gutterBottom>
              Temperature Charts
            </Typography>
            <Typography variant="body2" color="#9CA3AF">
              Temperature trend analysis and historical data will be displayed here
            </Typography>
          </Box>
        </ChartTabPanel>

        <ChartTabPanel value={chartTabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <WaterDropIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="#6B7280" gutterBottom>
              Humidity Charts
            </Typography>
            <Typography variant="body2" color="#9CA3AF">
              Humidity trend analysis and historical data will be displayed here
            </Typography>
          </Box>
        </ChartTabPanel>

        <ChartTabPanel value={chartTabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Co2Icon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="#6B7280" gutterBottom>
              CO₂ Level Charts
            </Typography>
            <Typography variant="body2" color="#9CA3AF">
              CO₂ concentration analysis and historical data will be displayed here
            </Typography>
          </Box>
        </ChartTabPanel>

        <ChartTabPanel value={chartTabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HeightIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="#6B7280" gutterBottom>
              Fill Level Charts
            </Typography>
            <Typography variant="body2" color="#9CA3AF">
              Fill level trend analysis and historical data will be displayed here
            </Typography>
          </Box>
        </ChartTabPanel>

        <ChartTabPanel value={chartTabValue} index={4}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CloudIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="#6B7280" gutterBottom>
              Trend Analysis
            </Typography>
            <Typography variant="body2" color="#9CA3AF">
              Combined trend analysis and correlations will be displayed here
            </Typography>
          </Box>
        </ChartTabPanel>
      </Paper>
    </Box>
  );
};

export default DeviceDetailView;