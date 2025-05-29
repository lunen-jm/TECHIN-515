import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { deleteDevice } from '../../firebase/services/deviceService';

interface DeviceDeleteModalProps {
  open: boolean;
  onClose: () => void;
  device: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    registeredFarm: string;
  };
  onDeviceDeleted: () => void;
}

const DeviceDeleteModal: React.FC<DeviceDeleteModalProps> = ({
  open,
  onClose,
  device,
  onDeviceDeleted
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (confirmationText !== device.name) {
      setError('Device name confirmation does not match');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      await deleteDevice(device.id);
      onDeviceDeleted();
      onClose();
    } catch (error) {
      setError('Failed to delete device. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setConfirmationText('');
      setError(null);
      onClose();
    }
  };

  const isConfirmationValid = confirmationText === device.name;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="device-delete-dialog-title"
    >
      <DialogTitle 
        id="device-delete-dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'error.main' 
        }}
      >
        <WarningIcon sx={{ mr: 1 }} />
        Delete Device
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DialogContentText sx={{ mb: 3 }}>
          You are about to permanently delete the following device:
        </DialogContentText>

        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 1, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" gutterBottom>
            {device.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={device.type} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={device.isActive ? 'Online' : 'Offline'} 
              size="small" 
              color={device.isActive ? 'success' : 'error'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Device ID: {device.id}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> This action cannot be undone. Deleting this device will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
            <li>Permanently remove the device from your farm</li>
            <li>Delete all historical sensor data</li>
            <li>Remove any alerts associated with this device</li>
            <li>Prevent the device from sending future data</li>
          </Box>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          To confirm deletion, please type the device name exactly as shown above:
        </Typography>

        <TextField
          fullWidth
          placeholder={device.name}
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          variant="outlined"
          disabled={deleting}
          error={confirmationText.length > 0 && !isConfirmationValid}
          helperText={
            confirmationText.length > 0 && !isConfirmationValid 
              ? 'Device name does not match' 
              : ''
          }
          sx={{ mb: 2 }}
        />

        <Typography variant="caption" color="text.secondary">
          Note: The device hardware will need to be re-registered if you want to use it again in the future.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={deleting}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={!isConfirmationValid || deleting}
          startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        >
          {deleting ? 'Deleting...' : 'Delete Device'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDeleteModal;
