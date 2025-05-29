import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DeviceHub as DeviceHubIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { 
  bulkUpdateDevices, 
  bulkDeleteDevices, 
  updateDeviceSettings 
} from '../../firebase/services/deviceService';

interface DeviceBulkActionsModalProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: Array<{
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    registeredFarm: string;
  }>;
  onActionCompleted: () => void;
}

type BulkAction = 'update-settings' | 'delete' | 'update-basic';

const DeviceBulkActionsModal: React.FC<DeviceBulkActionsModalProps> = ({
  open,
  onClose,
  selectedDevices,
  onActionCompleted
}) => {
  const [selectedAction, setSelectedAction] = useState<BulkAction>('update-settings');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(false);

  // Settings for bulk update
  const [readingInterval, setReadingInterval] = useState(300);
  const [transmissionInterval, setTransmissionInterval] = useState(1800);
  const [sleepMode, setSleepMode] = useState(true);
  const [newDeviceType, setNewDeviceType] = useState('');

  const handleActionChange = (action: BulkAction) => {
    setSelectedAction(action);
    setConfirmationStep(false);
    setError(null);
    setSuccess(null);
  };

  const handleProceed = () => {
    setConfirmationStep(true);
  };

  const handleExecuteAction = async () => {
    try {
      setProcessing(true);
      setError(null);

      const deviceIds = selectedDevices.map(device => device.id);

      switch (selectedAction) {
        case 'update-settings':
          // Update device settings for all selected devices
          for (const deviceId of deviceIds) {
            await updateDeviceSettings(deviceId, {
              readingInterval,
              transmissionInterval,
              sleepMode
            });
          }
          setSuccess(`Updated settings for ${deviceIds.length} devices`);
          break;

        case 'update-basic':
          if (newDeviceType) {
            await bulkUpdateDevices(deviceIds, { type: newDeviceType });
            setSuccess(`Updated type for ${deviceIds.length} devices`);
          }
          break;

        case 'delete':
          await bulkDeleteDevices(deviceIds);
          setSuccess(`Deleted ${deviceIds.length} devices`);
          break;

        default:
          throw new Error('Unknown action');
      }

      onActionCompleted();
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setError(`Failed to ${selectedAction.replace('-', ' ')} devices. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setConfirmationStep(false);
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'update-settings': return 'Update Device Settings';
      case 'update-basic': return 'Update Device Information';
      case 'delete': return 'Delete Devices';
      default: return 'Bulk Actions';
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case 'update-settings': 
        return 'Update reading intervals, transmission settings, and power management for selected devices.';
      case 'update-basic': 
        return 'Update basic device information like type for selected devices.';
      case 'delete': 
        return 'Permanently delete selected devices and all their data.';
      default: 
        return '';
    }
  };

  const isActionReady = () => {
    switch (selectedAction) {
      case 'update-settings': 
        return readingInterval > 0 && transmissionInterval > 0;
      case 'update-basic': 
        return newDeviceType.trim().length > 0;
      case 'delete': 
        return true;
      default: 
        return false;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <DeviceHubIcon sx={{ mr: 1 }} />
        Bulk Device Actions - {selectedDevices.length} device{selectedDevices.length !== 1 ? 's' : ''}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
            {success}
          </Alert>
        )}

        {!confirmationStep ? (
          <Box>
            {/* Action Selection */}
            <Typography variant="h6" gutterBottom>
              Select Action
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Bulk Action</InputLabel>
              <Select
                value={selectedAction}
                label="Bulk Action"
                onChange={(e) => handleActionChange(e.target.value as BulkAction)}
              >
                <MenuItem value="update-settings">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Update Device Settings
                  </Box>
                </MenuItem>
                <MenuItem value="update-basic">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeviceHubIcon sx={{ mr: 1 }} />
                    Update Device Information
                  </Box>
                </MenuItem>
                <MenuItem value="delete">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete Devices
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {getActionDescription()}
            </Typography>

            {/* Action-specific configuration */}
            {selectedAction === 'update-settings' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Settings Configuration</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Reading Interval (seconds)"
                    type="number"
                    value={readingInterval}
                    onChange={(e) => setReadingInterval(Number(e.target.value))}
                    helperText="How often devices take sensor readings"
                  />
                  <TextField
                    label="Transmission Interval (seconds)"
                    type="number"
                    value={transmissionInterval}
                    onChange={(e) => setTransmissionInterval(Number(e.target.value))}
                    helperText="How often devices send data to the cloud"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sleepMode}
                        onChange={(e) => setSleepMode(e.target.checked)}
                      />
                    }
                    label="Enable Sleep Mode"
                  />
                </Box>
              </Box>
            )}

            {selectedAction === 'update-basic' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Device Information</Typography>
                <TextField
                  fullWidth
                  label="New Device Type"
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  helperText="This will change the device type for all selected devices"
                />
              </Box>
            )}

            {selectedAction === 'delete' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> This action cannot be undone. All device data and history will be permanently deleted.
                </Typography>
              </Alert>
            )}

            {/* Selected Devices List */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Selected Devices
            </Typography>
            <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.default', borderRadius: 1 }}>
              {selectedDevices.map((device) => (
                <ListItem key={device.id}>
                  <ListItemIcon>
                    <DeviceHubIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={device.name}
                    secondary={`${device.type} • ${device.isActive ? 'Online' : 'Offline'}`}
                  />
                  <Chip 
                    label={device.type} 
                    size="small" 
                    variant="outlined" 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            {/* Confirmation Step */}
            <Alert 
              severity={selectedAction === 'delete' ? 'error' : 'warning'} 
              sx={{ mb: 3 }}
              icon={<WarningIcon />}
            >
              <Typography variant="h6" gutterBottom>
                Confirm {getActionTitle()}
              </Typography>
              <Typography variant="body2">
                You are about to {selectedAction.replace('-', ' ')} {selectedDevices.length} device{selectedDevices.length !== 1 ? 's' : ''}. 
                {selectedAction === 'delete' && ' This action cannot be undone.'}
              </Typography>
            </Alert>

            <Typography variant="subtitle1" gutterBottom>
              Action Summary:
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 3 }}>
              <Typography variant="body2">
                <strong>Action:</strong> {getActionTitle()}
              </Typography>
              <Typography variant="body2">
                <strong>Devices:</strong> {selectedDevices.length} selected
              </Typography>
              {selectedAction === 'update-settings' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Reading Interval:</strong> {readingInterval} seconds
                  </Typography>
                  <Typography variant="body2">
                    <strong>Transmission Interval:</strong> {transmissionInterval} seconds
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sleep Mode:</strong> {sleepMode ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Box>
              )}
              {selectedAction === 'update-basic' && (
                <Typography variant="body2">
                  <strong>New Type:</strong> {newDeviceType}
                </Typography>
              )}
            </Box>

            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
              {selectedDevices.map((device) => (
                <ListItem key={device.id}>
                  <ListItemIcon>
                    <DeviceHubIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={device.name}
                    secondary={device.id}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={processing}>
          Cancel
        </Button>
        
        {!confirmationStep ? (
          <Button
            variant="contained"
            onClick={handleProceed}
            disabled={!isActionReady()}
          >
            Proceed
          </Button>
        ) : (
          <Button
            variant="contained"
            color={selectedAction === 'delete' ? 'error' : 'primary'}
            onClick={handleExecuteAction}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {processing ? 'Processing...' : `Confirm ${getActionTitle()}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeviceBulkActionsModal;
