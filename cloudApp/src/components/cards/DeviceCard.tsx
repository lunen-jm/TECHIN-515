import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography,
  Box, 
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Checkbox
} from '@mui/material';
import { 
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Co2 as Co2Icon,
  Height as HeightIcon,
  Battery20 as BatteryLowIcon,
  Battery90 as BatteryGoodIcon,
  Cloud as CloudIcon,
  SignalWifi4Bar as SignalGoodIcon,
  SignalWifiOff as SignalBadIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import SiloIndicator from '../common/SiloIndicator';
import { getDeviceAlerts } from '../../firebase/services/alertService';

interface DeviceProps {
  device: {
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
  };
  onClick: () => void;
  onSettingsClick?: (device: any) => void;
  onDeleteClick?: (device: any) => void;
  onDiagnosticsClick?: (device: any) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (deviceId: string, selected: boolean) => void;
}

const DeviceCard: React.FC<DeviceProps> = ({ 
  device, 
  onClick, 
  onSettingsClick,
  onDeleteClick,
  onDiagnosticsClick,
  selectable = false,
  selected = false,
  onSelectionChange
}) => {
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Check for active alerts on component mount
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const alerts = await getDeviceAlerts(device.id);
        const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
        setHasActiveAlerts(unresolvedAlerts.length > 0);
      } catch (error) {
        console.error('Error checking device alerts:', error);
        setHasActiveAlerts(false);
      }
    };

    checkAlerts();
  }, [device.id]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSettingsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    if (onSettingsClick) {
      onSettingsClick(device);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    if (onDeleteClick) {
      onDeleteClick(device);
    }
  };

  const handleDiagnosticsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    if (onDiagnosticsClick) {
      onDiagnosticsClick(device);
    }
  };

  // Selection handlers
  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange(device.id, event.target.checked);
    }
  };

  const handleCardClick = () => {
    if (!selectable) {
      onClick();
    }
  };

  const getStatusColor = () => {
    if (!device.isActive) return '#f44336'; // Red for offline
    if (device.lowBattery) return '#ff9800'; // Orange for low battery
    return '#4caf50'; // Green for online
  };

  const getStatusText = () => {
    if (!device.isActive) return 'Offline';
    if (device.lowBattery) return 'Low Battery';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!device.isActive) return <SignalBadIcon sx={{ fontSize: 16 }} />;
    return <SignalGoodIcon sx={{ fontSize: 16 }} />;
  };

  const formatValue = (value: number | undefined, suffix: string = '') => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(1)}${suffix}`;
  };

  // Convert lidar reading to fill percentage for silo indicator
  const getLidarFillPercentage = (lidarReading: number) => {
    // Assuming max depth is 300cm, convert to percentage (inverted because lower readings = higher fill)
    const maxDepth = 300;
    const minDepth = 10; // Minimum sensor reading
    const clampedReading = Math.max(minDepth, Math.min(maxDepth, lidarReading));
    return Math.round(((maxDepth - clampedReading) / (maxDepth - minDepth)) * 100);
  };

  return (
    <Tooltip 
      title={hasActiveAlerts ? "This device has active alerts" : "Device status: " + getStatusText()}
      placement="top"
    >
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          border: hasActiveAlerts ? '2px solid #ff5722' : '1px solid',
          borderColor: hasActiveAlerts ? '#ff5722' : 'divider',
          boxShadow: hasActiveAlerts ? '0 4px 12px rgba(255, 87, 34, 0.2)' : 1,
          cursor: selectable ? 'default' : 'pointer',
          transition: 'all 0.2s ease-in-out',
          opacity: selected ? 0.8 : 1,
          transform: selected ? 'scale(0.98)' : 'scale(1)',
          '&:hover': {
            boxShadow: hasActiveAlerts ? '0 6px 16px rgba(255, 87, 34, 0.3)' : 3,
            transform: selected ? 'scale(0.98)' : 'scale(1.02)'
          }
        }}
      >        <CardActionArea 
          onClick={handleCardClick}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Three-column layout: Menu | Device Info | Silo */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {/* Left column - Menu and selection */}
              <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                {/* Menu button */}
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                
                {/* Selection checkbox */}
                {selectable && (
                  <Checkbox
                    checked={selected}
                    onChange={handleSelectionChange}
                    size="small"
                    sx={{ p: 0 }}
                  />
                )}
              </Box>

              {/* Middle column - Device information */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Device name and type */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {device.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {device.type}
                  </Typography>
                </Box>

                {/* Status and device type chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  <Chip
                    icon={getStatusIcon()}
                    label={getStatusText()}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24
                    }}
                  />
                  <Chip
                    icon={<CloudIcon />}
                    label={device.type}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                </Box>

                {/* Battery indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {device.lowBattery ? (
                    <BatteryLowIcon sx={{ color: '#ff9800', mr: 1, fontSize: 20 }} />
                  ) : (
                    <BatteryGoodIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {device.lowBattery ? 'Low Battery' : 'Battery OK'}
                  </Typography>
                </Box>
              </Box>              {/* Right column - Silo indicator */}
              {device.latestReadings?.lidar !== undefined ? (
                <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', pr: 2 }}>
                  <SiloIndicator 
                    fillPercentage={getLidarFillPercentage(device.latestReadings.lidar)}
                    label="Fill Level"
                    variant="basic"
                    height={160}
                    width={80}
                  />
                </Box>
              ) : (
                <Box sx={{ flex: '0 0 auto', width: 80, pr: 2 }}>
                  {/* Empty space placeholder when no silo */}
                </Box>
              )}
            </Box>

            {/* Sensor readings card-within-card */}
            {device.latestReadings ? (
              <Box sx={{ 
                p: 1.5,
                bgcolor: '#F8F9FA',
                borderRadius: 1,
                border: '1px solid #E9ECEF'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                  Sensor Readings
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                  {device.latestReadings.temperature !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThermostatIcon sx={{ fontSize: 20, mr: 0.8, color: '#2196f3' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(device.latestReadings.temperature, '°C')}
                      </Typography>
                    </Box>
                  )}
                  {device.latestReadings.humidity !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WaterDropIcon sx={{ fontSize: 20, mr: 0.8, color: '#03a9f4' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(device.latestReadings.humidity, '%')}
                      </Typography>
                    </Box>
                  )}
                  {device.latestReadings.co2 !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Co2Icon sx={{ fontSize: 20, mr: 0.8, color: '#607d8b' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(device.latestReadings.co2, ' ppm')}
                      </Typography>
                    </Box>
                  )}
                  {device.latestReadings.lidar !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HeightIcon sx={{ fontSize: 20, mr: 0.8, color: '#795548' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(device.latestReadings.lidar, ' cm')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                p: 1.5,
                bgcolor: '#F8F9FA',
                borderRadius: 1,
                border: '1px solid #E9ECEF',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 60,
                color: 'text.secondary'
              }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  No recent readings
                </Typography>
              </Box>
            )}

            {/* Alert indicator */}
            {hasActiveAlerts && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                p: 1,
                bgcolor: 'error.light',
                borderRadius: 1
              }}>
                <CheckIcon sx={{ fontSize: 16, mr: 0.5, color: 'error.main' }} />
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                  Active Alerts
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardActionArea>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleDiagnosticsClick}>
            <ListItemIcon>
              <BuildIcon fontSize="small" />
            </ListItemIcon>
            Diagnostics
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </Tooltip>
  );
};

export default DeviceCard;