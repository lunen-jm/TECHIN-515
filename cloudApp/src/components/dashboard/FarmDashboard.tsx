import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserAccessibleFarms } from '../../firebase/services/farmService';
import { useAuth } from '../../context/AuthContext';
import { 
  Agriculture as AgricultureIcon, 
  Add as AddIcon,
  DevicesOther as DevicesIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface Farm {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
  userRole?: string; // New field for user's role in the farm
  memberSince?: any; // New field for when user joined
}

const FarmDashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFarms = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }      try {
        // Use new multi-user farm access function  
        const farmsData = await getUserAccessibleFarms(currentUser.uid);
        setFarms(farmsData as Farm[]);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, [currentUser]);
  const handleFarmClick = (farmId: string) => {
    navigate(`/farms/${farmId}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, farmId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFarmId(farmId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFarmId(null);
  };

  const handleManageUsers = () => {
    if (selectedFarmId) {
      navigate(`/farms/${selectedFarmId}/manage`);
    }
    handleMenuClose();
  };

  const handleFarmSettings = () => {
    if (selectedFarmId) {
      navigate(`/farms/${selectedFarmId}/settings`);
    }
    handleMenuClose();
  };
  const getFarmBackground = (index: number) => {
    // Always return white for farm cards as per design guidelines
    return '#FFFFFF';
  };

  // Mock alert counts for the dashboard
  const alertCounts = {
    devices: 2,
    co2: 1,
    temperature: 3,
    humidity: 0
  };

  // Mock capacity data
  const capacityData = {
    totalTanks: farms.length * 4, // Assuming 4 tanks/devices per farm on average
    locations: farms.length,
    totalCapacity: 35000, // kg
    currentFill: 22400, // kg
    fillPercentage: 64 // %
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header with timestamp */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/farms/create')}
          sx={{ borderRadius: 2 }}
        >
          Add Farm
        </Button>
      </Box>      {/* Dashboard Summary Section */}
      {farms.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Capacity Overview */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="dashboard-section" sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Storage Capacity Overview</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Total Bins
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: 'text.primary' }}>
                      {capacityData.totalTanks}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Locations
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: 'text.primary' }}>
                      {capacityData.locations}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Available (kg)
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: 'text.primary' }}>
                      {(capacityData.totalCapacity - capacityData.currentFill).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Current (kg)
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: 'text.primary' }}>
                      {capacityData.currentFill.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>Fill Level</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {capacityData.fillPercentage}%
                  </Typography>
                </Box>                <LinearProgress 
                  variant="determinate" 
                  value={capacityData.fillPercentage} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: capacityData.fillPercentage > 85 ? 'warning.main' : 
                              capacityData.fillPercentage > 95 ? 'error.main' : 'success.main',
                    }
                  }} 
                />                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {capacityData.fillPercentage > 85 ? 'Storage capacity is getting limited' : 
                   capacityData.fillPercentage > 95 ? 'Critical: Storage almost full' : 
                   'Good storage capacity available'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
            {/* Alerts Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="dashboard-section" sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Alerts Center</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.default', 
                      border: '1px solid', 
                      borderColor: alertCounts.devices > 0 ? 'error.light' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: alertCounts.devices > 0 ? '0 4px 12px rgba(244, 67, 54, 0.15)' : 'none'
                      }
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Device Alerts
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: alertCounts.devices > 0 ? 'error.main' : 'success.main' }}>
                      {alertCounts.devices}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alertCounts.devices === 1 ? '1 location' : `${Math.min(alertCounts.devices, farms.length)} locations`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.default', 
                      border: '1px solid', 
                      borderColor: alertCounts.co2 > 0 ? 'error.light' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: alertCounts.co2 > 0 ? '0 4px 12px rgba(244, 67, 54, 0.15)' : 'none'
                      }
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      CO₂ Alerts
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: alertCounts.co2 > 0 ? 'error.main' : 'success.main' }}>
                      {alertCounts.co2}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alertCounts.co2 === 1 ? '1 location' : `${Math.min(alertCounts.co2, farms.length)} locations`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.default', 
                      border: '1px solid', 
                      borderColor: alertCounts.temperature > 0 ? 'error.light' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: alertCounts.temperature > 0 ? '0 4px 12px rgba(244, 67, 54, 0.15)' : 'none'
                      }
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Temp Alerts
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: alertCounts.temperature > 0 ? 'error.main' : 'success.main' }}>
                      {alertCounts.temperature}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alertCounts.temperature === 1 ? '1 location' : `${Math.min(alertCounts.temperature, farms.length)} locations`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.default', 
                      border: '1px solid', 
                      borderColor: alertCounts.humidity > 0 ? 'error.light' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: alertCounts.humidity > 0 ? '0 4px 12px rgba(244, 67, 54, 0.15)' : 'none'
                      }
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Humidity Alerts
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: 600, color: alertCounts.humidity > 0 ? 'error.main' : 'success.main' }}>
                      {alertCounts.humidity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alertCounts.humidity === 1 ? '1 location' : `${Math.min(alertCounts.humidity, farms.length)} locations`}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="warning"
                  startIcon={<WarningIcon />}
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s',
                    px: 3
                  }}
                >
                  View All Alerts ({alertCounts.devices + alertCounts.co2 + alertCounts.temperature + alertCounts.humidity})
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}      {/* Farms Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          My Farms
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a farm to view detailed sensor data and device information
        </Typography>
      </Box>

      {farms.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <AgricultureIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
            No Farms Found
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            You don't have any farms set up yet. Add your first farm to start monitoring your devices.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/farms/create')}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Add Your First Farm
          </Button>
        </Paper>
      ) : (        <Grid container spacing={3} className="farm-list-container">
          {farms.map((farm, index) => (
            <Grid item xs={12} sm={6} md={4} key={farm.id}>
              <Card
                elevation={1}
                className="farm-card"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: getFarmBackground(index),
                  transition: 'all 0.3s',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >                <CardActionArea onClick={() => handleFarmClick(farm.id)} sx={{ flexGrow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
                        <AgricultureIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                          {farm.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            Farm Location
                          </Typography>
                        </Box>
                      </Box>
                      {/* Dropdown Menu for Farm Actions */}
                      {(farm.userRole === 'owner' || farm.userRole === 'admin') && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, farm.id)}
                          sx={{ 
                            ml: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {farm.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                        <DevicesIcon sx={{ color: 'primary.main', fontSize: 20, mb: 0.5 }} />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Devices
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {4 + (index % 3)} {/* Mock device count */}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                        <WarningIcon sx={{ color: 'warning.main', fontSize: 20, mb: 0.5 }} />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Alerts
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {index % 4} {/* Mock alert count */}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {farm.createdAt ? new Date(farm.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </Typography>
                      {farm.userRole && (
                        <Typography variant="caption" sx={{ 
                          color: farm.userRole === 'owner' ? 'primary.main' : 
                                 farm.userRole === 'admin' ? 'secondary.main' : 'text.secondary',
                          fontWeight: 600 
                        }}>
                          {farm.userRole}
                        </Typography>
                      )}
                    </Box>                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}        </Grid>
      )}

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleManageUsers}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Users</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleFarmSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Farm Settings</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FarmDashboard;