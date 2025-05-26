import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box,
  Button,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  ArrowBack as ArrowBackIcon,
  AddCircle as AddCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getFarm, getFarmDevices } from '../../firebase/services/farmService';
import { getDevice } from '../../firebase/services/deviceService';
import DeviceCard from '../../components/cards/DeviceCard';

interface Farm {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
}

interface Device {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lowBattery: boolean;
  registeredFarm: string;
  createdAt: any;
  // Will store the latest reading values
  latestReadings?: {
    temperature?: number;
    humidity?: number;
    co2?: number;
    lidar?: number;
    outdoorTemp?: number;
  };
}

const FarmDetailView: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmAndDevices = async () => {
      if (!farmId) return;
      
      try {
        setLoading(true);
        
        // Fetch farm details
        const farmData = await getFarm(farmId);
        if (!farmData) {
          console.error('Farm not found');
          navigate('/farms');
          return;
        }
        
        setFarm(farmData as Farm);
        
        // Fetch devices associated with this farm
        const deviceIds = await getFarmDevices(farmId);
          const devicePromises = deviceIds.map((deviceId: string) => getDevice(deviceId));
        const devicesData = await Promise.all(devicePromises);
        
        // Filter out any null results and ensure proper typing
        const validDevices = devicesData.filter((device): device is NonNullable<typeof device> => device !== null);
          // For demo purposes, add mock latest readings
        // In a real application, you would fetch the latest reading for each sensor type
        const devicesWithReadings = validDevices.map(device => ({
          ...device,
          latestReadings: {
            temperature: parseFloat((Math.random() * 30 + 10).toFixed(2)), // 10-40°C
            humidity: parseFloat((Math.random() * 100).toFixed(2)), // 0-100%
            co2: parseFloat((Math.random() * 1000 + 400).toFixed(2)), // 400-1400 ppm
            lidar: parseFloat((Math.random() * 300 + 50).toFixed(2)), // 50-350 cm
            outdoorTemp: parseFloat((Math.random() * 20 + 5).toFixed(2)), // 5-25°C
          }
        }));
        
        // Sort devices alphabetically by name
        const sortedDevices = devicesWithReadings.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        setDevices(sortedDevices);
      } catch (error) {
        console.error('Error fetching farm details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmAndDevices();
  }, [farmId, navigate]);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!farm) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Farm not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/farms')}
        >
          Back to Farms
        </Button>
      </Box>
    );
  }
  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/farms">
          Farms
        </Link>
        <Typography color="text.primary">{farm.name}</Typography>
      </Breadcrumbs>

      {/* Farm Header */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton 
                size="small" 
                sx={{ mr: 1.5, bgcolor: 'background.default' }}
                onClick={() => navigate('/farms')}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {farm.name}
              </Typography>
              <Chip 
                label={`${devices.length} ${devices.length === 1 ? 'Device' : 'Devices'}`} 
                size="small" 
                sx={{ ml: 2, bgcolor: 'primary.light', color: 'white', fontWeight: 500 }}
              />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
              {farm.description}
            </Typography>
            <Box sx={{ ml: 6, display: 'flex', gap: 2 }}>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, minWidth: 150 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Created
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {farm.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, minWidth: 150 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<SettingsIcon />}
              onClick={() => navigate(`/farms/${farmId}/settings`)}
              sx={{ mr: 1.5 }}
            >
              Farm Settings
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddCircleIcon />}
              onClick={() => navigate(`/devices/create?farmId=${farmId}`)}
            >
              Add Device
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Devices Grid */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Devices
        </Typography>
        <Button 
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{ borderRadius: '20px', px: 2 }}
        >
          Refresh Data
        </Button>
      </Box>

      {devices.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
            No Devices Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            This farm doesn't have any devices yet. Add your first device to start monitoring.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddCircleIcon />}
            onClick={() => navigate(`/devices/create?farmId=${farmId}`)}
            sx={{ px: 3, py: 1 }}
          >
            Add Your First Device
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <DeviceCard 
                device={device}
                onClick={() => handleDeviceClick(device.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FarmDetailView;