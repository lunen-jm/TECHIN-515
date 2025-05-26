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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserAccessibleFarms } from '../firebase/services/farmService';
import { useAuth } from '../context/AuthContext';
import { 
  Agriculture as AgricultureIcon, 
  Add as AddIcon,
  DevicesOther as DevicesIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
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
  userRole?: string;
  memberSince?: any;
}

const FarmsPage: React.FC = () => {
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
      }

      try {
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
    return '#FFFFFF';
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
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            My Farms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all your farms from one place
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
      </Box>

      {/* Farms Grid */}
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
      ) : (
        <Grid container spacing={3} className="farm-list-container">
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
              >
                <CardActionArea onClick={() => handleFarmClick(farm.id)} sx={{ flexGrow: 1 }}>
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
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
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
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

export default FarmsPage;
