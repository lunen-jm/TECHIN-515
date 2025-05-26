import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  DeviceHub as DeviceHubIcon,
  Agriculture as AgricultureIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeviceCard from '../components/cards/DeviceCard';
import { getUserAccessibleFarms, getFarmDevices } from '../firebase/services/farmService';
import { getDevice } from '../firebase/services/deviceService';

interface Device {
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
}

interface Farm {
  id: string;
  name: string;
  description?: string;
  userRole: string;
  memberSince: any;
}

interface FarmWithDevices {
  farm: Farm;
  devices: Device[];
}

const DevicesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [farmsWithDevices, setFarmsWithDevices] = useState<FarmWithDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDevices, setTotalDevices] = useState(0);
  const [activeDevices, setActiveDevices] = useState(0);

  useEffect(() => {
    const fetchAllDevices = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);        // Get all accessible farms
        const farms = await getUserAccessibleFarms(currentUser.uid);        // Filter out any farms with missing or invalid data
        const validFarms = farms.filter(farm => {
          return farm && farm.id && (
            (farm as any).name || 
            (farm as any).farmName ||
            'Unknown Farm'
          );
        });
        
        if (validFarms.length === 0) {
          setFarmsWithDevices([]);
          setLoading(false);
          return;
        }// For each farm, get its devices
        const farmsWithDevicesData: FarmWithDevices[] = [];
        let totalDeviceCount = 0;
        let activeDeviceCount = 0;        for (const farm of validFarms) {
          // Skip farms without proper ID (additional safety check)
          if (!farm || !farm.id) {
            console.warn('Skipping farm with missing ID:', farm);
            continue;
          }

          try {
            // Get device IDs for this farm
            const deviceIds = await getFarmDevices(farm.id);
            
            // Fetch device details
            const devicePromises = deviceIds.map(deviceId => getDevice(deviceId));
            const devicesData = await Promise.all(devicePromises);
            
            // Filter out null results and add mock readings
            const validDevices = devicesData
              .filter((device): device is NonNullable<typeof device> => device !== null)
              .map(device => ({
                ...device,
                latestReadings: {
                  temperature: parseFloat((Math.random() * 30 + 10).toFixed(2)),
                  humidity: parseFloat((Math.random() * 100).toFixed(2)),
                  co2: parseFloat((Math.random() * 1000 + 400).toFixed(2)),
                  lidar: parseFloat((Math.random() * 300 + 50).toFixed(2)),
                  outdoorTemp: parseFloat((Math.random() * 20 + 5).toFixed(2)),
                }
              }));

            if (validDevices.length > 0) {
              farmsWithDevicesData.push({
                farm: farm as Farm,
                devices: validDevices
              });
              
              totalDeviceCount += validDevices.length;
              activeDeviceCount += validDevices.filter(d => d.isActive).length;
            }
          } catch (farmError) {
            console.error(`Error fetching devices for farm ${farm.id}:`, farmError);
            // Continue with other farms even if one fails
          }
        }

        // Sort farms by name
        farmsWithDevicesData.sort((a, b) => a.farm.name.localeCompare(b.farm.name));
        
        // Sort devices within each farm by name
        farmsWithDevicesData.forEach(farmData => {
          farmData.devices.sort((a, b) => a.name.localeCompare(b.name));
        });

        setFarmsWithDevices(farmsWithDevicesData);
        setTotalDevices(totalDeviceCount);
        setActiveDevices(activeDeviceCount);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setError('Failed to fetch devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDevices();
  }, [currentUser]);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading devices...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DeviceHubIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            All Devices
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Monitor and manage all devices across your accessible farms
        </Typography>

        {/* Summary Stats */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {totalDevices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Devices
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {activeDevices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Online
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="error.main" fontWeight="bold">
                  {totalDevices - activeDevices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Offline
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Content */}
      {farmsWithDevices.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DeviceHubIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No devices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have access to any farms with devices yet.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {farmsWithDevices.map((farmData, index) => (
            <Accordion key={farmData.farm.id} defaultExpanded={index === 0} sx={{ mb: 2 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: 'background.default',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <AgricultureIcon sx={{ color: 'primary.main', mr: 2 }} />                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600">
                      {(farmData.farm as any).name || (farmData.farm as any).farmName || 'Unknown Farm'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        label={`${farmData.devices.length} device${farmData.devices.length !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={`${farmData.devices.filter(d => d.isActive).length} online`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={farmData.farm.userRole}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  {farmData.devices.map((device) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
                      <DeviceCard 
                        device={device} 
                        onClick={() => handleDeviceClick(device.id)} 
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DevicesPage;
