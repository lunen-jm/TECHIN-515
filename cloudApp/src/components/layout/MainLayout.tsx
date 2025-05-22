import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Agriculture as AgricultureIcon,
  DevicesOther as DevicesIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOutUser } from '../../firebase/services/authService';

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const isDevMode = process.env.NODE_ENV === 'development';

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Farms', icon: <AgricultureIcon />, path: '/farms' },
    { text: 'Devices', icon: <DevicesIcon />, path: '/devices' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ...(isDevMode ? [{ text: 'Admin', icon: <AdminIcon />, path: '/admin' }] : []),
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          backgroundColor: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Farm Sensor Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Tooltip title="Admin Panel">
                <IconButton color="inherit" onClick={() => navigate('/admin')}>
                  <AdminIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Alerts Center">
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton color="inherit" onClick={handleProfileMenu} sx={{ ml: 1 }}>
                {currentUser?.photoURL ? (
                  <Avatar src={currentUser.photoURL} alt={currentUser.displayName || 'User'} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, color: 'white' }}>
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: { borderRadius: 2, mt: 1 }
            }}
          >
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/profile'); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleCloseMenu(); handleLogout(); }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            ...(isMobile && !open && { display: 'none' }),
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: 'none',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AgricultureIcon /> Farm Monitor
          </Typography>
        </Toolbar>
        <Divider sx={{ mx: 2 }} />
        <Box sx={{ overflow: 'auto', py: 2, px: 1 }}>
          <List>
            {menuItems.map((item) => (
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
                    borderRadius: 2,
                    px: 2,
                    ...(location.pathname === item.path && {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    }),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary'
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
                        color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2, mx: 2 }} />
          {!isMobile && (
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Farm Sensor Dashboard v1.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                &copy; {new Date().getFullYear()} Farm Monitor
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;