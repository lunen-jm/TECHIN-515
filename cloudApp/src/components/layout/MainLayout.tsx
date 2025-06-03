import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Agriculture as AgricultureIcon,
  DevicesOther as DevicesIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';
import { signOutUser } from '../../firebase/services/authService';

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const isDevMode = process.env.NODE_ENV === 'development';

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Farms', icon: <AgricultureIcon />, path: '/farms' },
    { text: 'Devices', icon: <DevicesIcon />, path: '/devices' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
    ...(isDevMode ? [{ text: 'Admin', icon: <AdminIcon />, path: '/admin' }] : []),
  ];

  const bottomMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            ...(isMobile && !open && { display: 'none' }),
            backgroundColor: '#072B2B', // Dark green background
            color: '#BCBCBC', // Grey text
            borderRight: 'none',
            borderRadius: 0, // Remove border radius for sharp corners
            boxShadow: 'none',
          },
        }}
      >
        {/* Logo/Title Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 3,
          borderBottom: '1px solid rgba(55, 100, 82, 0.2)'
        }}>
          <Typography 
            variant="h6" 
            component="div"            sx={{ 
              fontWeight: 700, 
              color: '#BCBCBC',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AgricultureIcon sx={{ color: '#BCBCBC' }} /> Farm Monitor
          </Typography>
        </Box>        {/* Main Navigation */}
        <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
          <List>{mainMenuItems.map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    borderRadius: 0,
                    px: 2,
                    mx: 0, // Remove horizontal margin to take full width
                    ...(location.pathname === item.path ? {
                      backgroundColor: '#376452',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#376452',
                      }
                    } : {
                      color: '#BCBCBC',
                      '&:hover': {
                        backgroundColor: 'rgba(55, 100, 82, 0.1)',
                      }
                    }),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? '#FFFFFF' : '#BCBCBC'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: 1,
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        color: location.pathname === item.path ? '#FFFFFF' : '#BCBCBC',
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Bottom Section - Profile, Settings, etc. */}
        <Box sx={{ borderTop: '1px solid rgba(55, 100, 82, 0.2)', py: 2 }}>          {/* Dark Mode Toggle */}
          <Box sx={{ px: 2, py: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  icon={<LightModeIcon sx={{ color: '#BCBCBC' }} />}
                  checkedIcon={<DarkModeIcon sx={{ color: '#BCBCBC' }} />}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#BCBCBC',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#BCBCBC',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(188, 188, 188, 0.3)',
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#BCBCBC', fontWeight: 500 }}>
                  Dark Mode
                </Typography>
              }
              sx={{ margin: 0 }}
            />
          </Box>          {/* Bottom Menu Items */}
          <List sx={{ py: 0 }}>            {bottomMenuItems.map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    borderRadius: 0,
                    px: 2,
                    mx: 0, // Remove horizontal margin to take full width
                    ...(location.pathname === item.path ? {
                      backgroundColor: '#376452',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#376452',
                      }
                    } : {
                      color: '#BCBCBC',
                      '&:hover': {
                        backgroundColor: 'rgba(55, 100, 82, 0.1)',
                      }
                    }),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? '#FFFFFF' : '#BCBCBC'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: 1,
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        color: location.pathname === item.path ? '#FFFFFF' : '#BCBCBC',
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
            
            {/* Logout Button */}            <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  borderRadius: 0,
                  px: 2,
                  mx: 0, // Remove horizontal margin to take full width
                  color: '#BCBCBC',
                  '&:hover': {
                    backgroundColor: 'rgba(55, 100, 82, 0.1)',
                  }
                }}
                onClick={handleLogout}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: 'center',
                    color: '#BCBCBC'
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  sx={{ 
                    opacity: 1,
                    '& .MuiTypography-root': {
                      fontWeight: 400,
                      color: '#BCBCBC',
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </List>          {/* Version Info */}
          {!isMobile && (
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(188, 188, 188, 0.7)' }}>
                Farm Sensor Dashboard v1.0
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(188, 188, 188, 0.5)' }}>
                &copy; {new Date().getFullYear()} Farm Monitor
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
      
      {/* Mobile Menu Toggle - Only show when sidebar is closed */}
      {isMobile && !open && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <IconButton
            color="primary"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: 'background.default',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;