import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  Fab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Badge,
  Checkbox,
  FormControlLabel,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  DeviceHub as DeviceHubIcon,
  Agriculture as AgricultureIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  MoreHoriz as MoreHorizIcon,
  Code as CodeIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeviceCard from '../components/cards/DeviceCard';
import DeviceSettingsModal from '../components/modals/DeviceSettingsModal';
import DeviceDeleteModal from '../components/modals/DeviceDeleteModal';
import DeviceBulkActionsModal from '../components/modals/DeviceBulkActionsModal';
import RegistrationCodeManagement from '../components/RegistrationCodeManagement';
import { getUserAccessibleFarms, getFarmDevices } from '../firebase/services/farmService';
import { getDevice, getDeviceDiagnostics } from '../firebase/services/deviceService';

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
  name?: string;
  farmName?: string;
  description?: string;
  userRole?: string;
  memberSince?: any;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  size?: string;
  farmType?: string;
  userId?: string;
  createdAt?: any;
  createdBy?: string;
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
    // New state for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'lowBattery'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [filteredFarmsWithDevices, setFilteredFarmsWithDevices] = useState<FarmWithDevices[]>([]);
  
  // Modal state management
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    // Bulk selection state
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());
  
  // Tab state for different views
  const [currentTab, setCurrentTab] = useState<'devices' | 'codes'>('devices');
  // Filter devices based on search term and filters
  const filterDevices = useCallback(() => {
    console.log('FilterDevices called with:', {
      farmsWithDevicesCount: farmsWithDevices.length,
      totalDevicesInFarms: farmsWithDevices.reduce((sum, farm) => sum + farm.devices.length, 0),
      searchTerm,
      statusFilter,
      typeFilter
    });

    let filtered = [...farmsWithDevices];

    console.log('Initial filtered farms:', filtered.map(f => ({
      farmId: f.farm.id,
      farmName: f.farm.name || f.farm.farmName,
      deviceCount: f.devices.length,
      devices: f.devices.map(d => ({ id: d.id, name: d.name, isActive: d.isActive }))
    })));

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.map(farmData => ({
        ...farmData,
        devices: farmData.devices.filter(device =>
          device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(farmData => farmData.devices.length > 0);
      console.log('After search filter:', filtered.length, 'farms');
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.map(farmData => ({
        ...farmData,
        devices: farmData.devices.filter(device => {
          switch (statusFilter) {
            case 'online':
              return device.isActive;
            case 'offline':
              return !device.isActive;
            case 'lowBattery':
              return device.lowBattery;
            default:
              return true;
          }
        })
      })).filter(farmData => farmData.devices.length > 0);
      console.log('After status filter:', filtered.length, 'farms');
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.map(farmData => ({
        ...farmData,
        devices: farmData.devices.filter(device => device.type === typeFilter)
      })).filter(farmData => farmData.devices.length > 0);
      console.log('After type filter:', filtered.length, 'farms');
    }

    console.log('Final filtered result:', filtered.map(f => ({
      farmId: f.farm.id,
      farmName: f.farm.name || f.farm.farmName,
      deviceCount: f.devices.length
    })));

    setFilteredFarmsWithDevices(filtered);
  }, [farmsWithDevices, searchTerm, statusFilter, typeFilter]);
  // Load devices for each farm (simple fetch approach)
  const loadFarmDevices = useCallback(async (farms: Farm[]) => {
    console.log('Loading devices for', farms.length, 'farms');
    
    const farmsWithDevicesData: FarmWithDevices[] = [];
    let totalDeviceCount = 0;
    let activeDeviceCount = 0;

    for (const farm of farms) {
      if (!farm || !farm.id) continue;
      
      try {
        // Get device IDs for this farm
        const deviceIds = await getFarmDevices(farm.id);
        console.log(`Farm ${farm.id} has ${deviceIds.length} devices:`, deviceIds);
        
        const devices: Device[] = [];
        
        // Fetch each device's data
        for (const deviceId of deviceIds) {
          try {
            const device = await getDevice(deviceId);
            if (device) {
              // Add mock readings for now (will be replaced with real data)
              const deviceWithReadings = {
                ...device,
                latestReadings: {
                  temperature: parseFloat((Math.random() * 30 + 10).toFixed(2)),
                  humidity: parseFloat((Math.random() * 100).toFixed(2)),
                  co2: parseFloat((Math.random() * 1000 + 400).toFixed(2)),
                  lidar: parseFloat((Math.random() * 300 + 50).toFixed(2)),
                  outdoorTemp: parseFloat((Math.random() * 20 + 5).toFixed(2)),
                }
              };
              devices.push(deviceWithReadings);
              totalDeviceCount++;
              if (device.isActive) activeDeviceCount++;
            }
          } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
          }
        }
        
        console.log(`Loaded ${devices.length} devices for farm ${farm.id}`);
        farmsWithDevicesData.push({ farm: farm as Farm, devices });
        
      } catch (error) {
        console.error(`Error loading devices for farm ${farm.id}:`, error);
        // Still add the farm even if device loading fails
        farmsWithDevicesData.push({ farm: farm as Farm, devices: [] });
      }
    }

    console.log('Final loaded data:', farmsWithDevicesData.map(f => ({
      farmId: f.farm.id,
      farmName: f.farm.name || f.farm.farmName,
      deviceCount: f.devices.length
    })));

    setFarmsWithDevices(farmsWithDevicesData);
    setTotalDevices(totalDeviceCount);
    setActiveDevices(activeDeviceCount);
  }, []);

  useEffect(() => {
    const fetchFarmsAndSetupListeners = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
          // Get all accessible farms
        const farms = await getUserAccessibleFarms(currentUser.uid);
        console.log('Loaded farms:', farms.length, farms);
        
        // Filter out any farms with missing or invalid data
        const validFarms = farms.filter(farm => {
          return farm && farm.id && typeof farm.id === 'string' && (
            (farm as any).name || 
            (farm as any).farmName ||
            'Unknown Farm'
          );
        }) as Farm[];
        
        console.log('Valid farms after filtering:', validFarms.length, validFarms);
        
        if (validFarms.length === 0) {
          console.log('No valid farms found, setting empty array');
          setFarmsWithDevices([]);
          setLoading(false);
          return;
        }        // Load devices using simple fetch approach
        console.log('Loading devices for', validFarms.length, 'farms');
        await loadFarmDevices(validFarms);
        
        // Get unique device types for filter
        const allTypes = new Set<string>();
        for (const farm of validFarms) {
          try {
            const deviceIds = await getFarmDevices(farm.id);
            for (const deviceId of deviceIds) {
              const device = await getDevice(deviceId);
              if (device && device.type) {
                allTypes.add(device.type);
              }
            }
          } catch (error) {
            console.error(`Error fetching device types for farm ${farm.id}:`, error);
          }
        }
        setAvailableTypes(Array.from(allTypes));
        
      } catch (error) {
        console.error('Error fetching farms and setting up listeners:', error);
        setError('Failed to fetch devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };    fetchFarmsAndSetupListeners();
  }, [currentUser, loadFarmDevices]);

  // Apply filters whenever data or filters change
  useEffect(() => {
    filterDevices();
  }, [filterDevices]);  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  // Device action handlers
  const handleSettingsClick = (device: Device) => {
    setSelectedDevice(device);
    setSettingsModalOpen(true);
  };

  const handleDeleteClick = (device: Device) => {
    setSelectedDevice(device);
    setDeleteModalOpen(true);
  };

  const handleDiagnosticsClick = async (device: Device) => {
    try {
      const diagnostics = await getDeviceDiagnostics(device.id);
      console.log('Device diagnostics:', diagnostics);
      // You could show this in a diagnostics modal or navigate to a diagnostics page
      alert(`Device Status: ${diagnostics.status}\nLast Update: ${diagnostics.lastUpdate}\nConnection: ${diagnostics.connectionStatus}`);
    } catch (error) {
      console.error('Error getting device diagnostics:', error);
      alert('Failed to get device diagnostics');
    }
  };

  // Bulk selection handlers
  const handleDeviceSelectionChange = (deviceId: string, selected: boolean) => {
    const newSelection = new Set(selectedDeviceIds);
    if (selected) {
      newSelection.add(deviceId);
    } else {
      newSelection.delete(deviceId);
    }
    setSelectedDeviceIds(newSelection);
  };

  const handleSelectAll = () => {
    const allDeviceIds = new Set<string>();
    filteredFarmsWithDevices.forEach(farmData => {
      farmData.devices.forEach(device => {
        allDeviceIds.add(device.id);
      });
    });
    setSelectedDeviceIds(allDeviceIds);
  };

  const handleClearSelection = () => {
    setSelectedDeviceIds(new Set());
  };

  const handleBulkActions = () => {
    setBulkActionsModalOpen(true);
  };

  const handleDeleteSuccess = async () => {
    setDeleteModalOpen(false);
    setSelectedDevice(null);
    // Refresh data by reloading - could be optimized to just refetch
    handleRefresh();
  };

  const handleSettingsSuccess = async () => {
    setSettingsModalOpen(false);
    setSelectedDevice(null);
    // Refresh data by reloading - could be optimized to just refetch
    handleRefresh();
  };

  const handleBulkActionsSuccess = async () => {
    setBulkActionsModalOpen(false);
    setSelectedDeviceIds(new Set());
    setBulkSelectionMode(false);
    // Refresh data by reloading - could be optimized to just refetch
    handleRefresh();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getFilteredDeviceCount = () => {
    return filteredFarmsWithDevices.reduce((total, farmData) => total + farmData.devices.length, 0);
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
    <Box sx={{ p: 3, pb: 10 }}>      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeviceHubIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Device Management
            </Typography>
            {currentTab === 'devices' && (searchTerm || statusFilter !== 'all' || typeFilter !== 'all') ? (
              <Badge 
                badgeContent={getFilteredDeviceCount()} 
                color="primary" 
                sx={{ ml: 2 }}
              >
                <FilterListIcon />
              </Badge>
            ) : null}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentTab === 'devices' && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Refresh
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/devices/add')}
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Add Device
            </Button>
          </Box>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="device management tabs"
          >
            <Tab
              icon={<ListIcon />}
              iconPosition="start"
              label="All Devices"
              value="devices"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab
              icon={<CodeIcon />}
              iconPosition="start"
              label="Registration Codes"
              value="codes"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Box>
          <Typography variant="subtitle1" color="text.secondary">
          {currentTab === 'devices' 
            ? 'Monitor and manage all devices across your accessible farms'
            : 'View and manage device registration codes'
          }
        </Typography>
      </Box>      {/* Content based on current tab */}
      {currentTab === 'devices' ? (
        <>
          {/* Filters Section */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                    <MenuItem value="lowBattery">Low Battery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {availableTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Bulk Selection Controls */}
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: 'none'
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bulkSelectionMode}
                      onChange={(e) => {
                        setBulkSelectionMode(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedDeviceIds(new Set());
                        }
                      }}
                    />
                  }
                  label="Bulk Selection Mode"
                />
              </Grid>
              
              {bulkSelectionMode && (
                <>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDeviceIds.size} device{selectedDeviceIds.size !== 1 ? 's' : ''} selected
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      startIcon={<SelectAllIcon />}
                      onClick={handleSelectAll}
                      sx={{ textTransform: 'none' }}
                    >
                      Select All
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={handleClearSelection}
                      sx={{ textTransform: 'none' }}
                    >
                      Clear
                    </Button>
                  </Grid>
                  {selectedDeviceIds.size > 0 && (
                    <Grid item>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<MoreHorizIcon />}
                        onClick={handleBulkActions}
                        sx={{ textTransform: 'none' }}
                      >
                        Bulk Actions
                      </Button>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Paper>

          {/* Summary Stats */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: 'none'
          }}>
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

          {/* Devices Content */}
          {filteredFarmsWithDevices.length === 0 ? (
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: 'none'
            }}>
              <DeviceHubIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No devices match your filters' 
                  : 'No devices found'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'You don\'t have access to any farms with devices yet.'
                }
              </Typography>
              {!(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/devices/add')}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Add Your First Device
                </Button>
              )}
            </Paper>
          ) : (
            <Box>
              {filteredFarmsWithDevices
                .filter(farmData => farmData && farmData.farm)
                .map((farmData, index) => (
                  <Accordion key={farmData.farm?.id || farmData.farm?.name || `unknown-farm-${index}`} defaultExpanded={index === 0} sx={{ 
                    mb: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: 'none',
                    '&:before': { display: 'none' }
                  }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        bgcolor: 'background.paper',
                        px: 3,
                        py: 2,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <AgricultureIcon sx={{ color: 'primary.main', mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="600">
                            {(farmData.farm as any)?.name || (farmData.farm as any)?.farmName || 'Unknown Farm'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Chip 
                              label={`${farmData.devices.length} device${farmData.devices.length !== 1 ? 's' : ''}`}
                              size="small"
                              sx={{ mr: 1, bgcolor: 'background.paper' }}
                            />
                            <Chip 
                              label={`${farmData.devices.filter(d => d.isActive).length} online`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={farmData.farm?.userRole || 'Member'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ 
                      pt: 0, 
                      bgcolor: 'background.paper' 
                    }}>
                      <Grid container spacing={3}>
                        {farmData.devices.map((device) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
                            <DeviceCard 
                              device={device} 
                              onClick={() => handleDeviceClick(device.id)}
                              onSettingsClick={handleSettingsClick}
                              onDeleteClick={handleDeleteClick}
                              onDiagnosticsClick={handleDiagnosticsClick}
                              selectable={bulkSelectionMode}
                              selected={selectedDeviceIds.has(device.id)}
                              onSelectionChange={handleDeviceSelectionChange}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Box>
          )}
          
          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add device"
            onClick={() => navigate('/devices/add')}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <AddIcon />
          </Fab>
        </>
      ) : (
        <RegistrationCodeManagement />
      )}

      {/* Modals */}
      {selectedDevice && (
        <DeviceSettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          device={selectedDevice}
          onDeviceUpdated={handleSettingsSuccess}
        />
      )}

      {selectedDevice && (
        <DeviceDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          device={selectedDevice}
          onDeviceDeleted={handleDeleteSuccess}
        />
      )}

      <DeviceBulkActionsModal
        open={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        selectedDevices={Array.from(selectedDeviceIds).map(id => {
          // Find the device by ID
          for (const farmData of filteredFarmsWithDevices) {
            const device = farmData.devices.find(d => d.id === id);
            if (device) return device;
          }
          return null;
        }).filter(Boolean) as any[]}        onActionCompleted={handleBulkActionsSuccess}
      />
    </Box>
  );
};

export default DevicesPage;
