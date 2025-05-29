import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  updateDevice, 
  updateDeviceSettings, 
  updateDeviceCalibration,
  getDeviceDiagnostics 
} from '../../firebase/services/deviceService';

interface DeviceSettingsModalProps {
  open: boolean;
  onClose: () => void;
  device: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    lowBattery: boolean;
    registeredFarm: string;
    settings?: {
      readingInterval?: number;
      transmissionInterval?: number;
      sleepMode?: boolean;
      alertThresholds?: {
        temperature?: { min?: number; max?: number };
        humidity?: { min?: number; max?: number };
        co2?: { max?: number };
        batteryLevel?: { min?: number };
      };
    };
    calibration?: {
      temperature?: { offset?: number; scale?: number };
      humidity?: { offset?: number; scale?: number };
      co2?: { offset?: number; scale?: number };
      lidar?: { offset?: number; scale?: number };
    };
  };
  onDeviceUpdated?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`device-settings-tabpanel-${index}`}
      aria-labelledby={`device-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  open,
  onClose,
  device,
  onDeviceUpdated
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  // Form state for general settings
  const [deviceName, setDeviceName] = useState(device.name);
  const [deviceType, setDeviceType] = useState(device.type);
  // Form state for device settings
  const [readingInterval, setReadingInterval] = useState(device.settings?.readingInterval || 300);
  const [transmissionInterval, setTransmissionInterval] = useState(device.settings?.transmissionInterval || 1800);
  const [sleepMode, setSleepMode] = useState<boolean>(device.settings?.sleepMode ?? true);

  // Alert thresholds
  const [tempMin, setTempMin] = useState(device.settings?.alertThresholds?.temperature?.min || 0);
  const [tempMax, setTempMax] = useState(device.settings?.alertThresholds?.temperature?.max || 50);
  const [humidityMin, setHumidityMin] = useState(device.settings?.alertThresholds?.humidity?.min || 20);
  const [humidityMax, setHumidityMax] = useState(device.settings?.alertThresholds?.humidity?.max || 80);
  const [co2Max, setCo2Max] = useState(device.settings?.alertThresholds?.co2?.max || 1000);
  const [batteryMin, setBatteryMin] = useState(device.settings?.alertThresholds?.batteryLevel?.min || 20);

  // Calibration state
  const [tempOffset, setTempOffset] = useState(device.calibration?.temperature?.offset || 0);
  const [tempScale, setTempScale] = useState(device.calibration?.temperature?.scale || 1);
  const [humidityOffset, setHumidityOffset] = useState(device.calibration?.humidity?.offset || 0);
  const [humidityScale, setHumidityScale] = useState(device.calibration?.humidity?.scale || 1);
  const [co2Offset, setCo2Offset] = useState(device.calibration?.co2?.offset || 0);
  const [co2Scale, setCo2Scale] = useState(device.calibration?.co2?.scale || 1);
  const [lidarOffset, setLidarOffset] = useState(device.calibration?.lidar?.offset || 0);
  const [lidarScale, setLidarScale] = useState(device.calibration?.lidar?.scale || 1);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setDeviceName(device.name);
      setDeviceType(device.type);
      setTabValue(0);
      setError(null);
      setSuccess(null);
    }
  }, [open, device]);

  const loadDiagnostics = async () => {
    try {
      setLoadingDiagnostics(true);
      const diagnosticData = await getDeviceDiagnostics(device.id);
      setDiagnostics(diagnosticData);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    if (open && tabValue === 3) { // Diagnostics tab
      loadDiagnostics();
    }
  }, [open, tabValue, device.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateDevice(device.id, {
        name: deviceName,
        type: deviceType
      });

      setSuccess('Device information updated successfully');
      onDeviceUpdated?.();
    } catch (error) {
      setError('Failed to update device information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateDeviceSettings(device.id, {
        readingInterval,
        transmissionInterval,
        sleepMode,
        alertThresholds: {
          temperature: { min: tempMin, max: tempMax },
          humidity: { min: humidityMin, max: humidityMax },
          co2: { max: co2Max },
          batteryLevel: { min: batteryMin }
        }
      });

      setSuccess('Device settings updated successfully');
      onDeviceUpdated?.();
    } catch (error) {
      setError('Failed to update device settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCalibration = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateDeviceCalibration(device.id, {
        temperature: { offset: tempOffset, scale: tempScale },
        humidity: { offset: humidityOffset, scale: humidityScale },
        co2: { offset: co2Offset, scale: co2Scale },
        lidar: { offset: lidarOffset, scale: lidarScale }
      });

      setSuccess('Device calibration updated successfully');
      onDeviceUpdated?.();
    } catch (error) {
      setError('Failed to update device calibration');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'success';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Device Settings - {device.name}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="device settings tabs">
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<TuneIcon />} label="Settings" />
          <Tab icon={<BuildIcon />} label="Calibration" />
          <Tab icon={<RefreshIcon />} label="Diagnostics" />
        </Tabs>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Device Type"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Device ID: {device.id}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveGeneral}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </TabPanel>

        {/* Device Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reading Interval (seconds)"
                type="number"
                value={readingInterval}
                onChange={(e) => setReadingInterval(Number(e.target.value))}
                helperText="How often the device takes sensor readings"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transmission Interval (seconds)"
                type="number"
                value={transmissionInterval}
                onChange={(e) => setTransmissionInterval(Number(e.target.value))}
                helperText="How often the device sends data to the cloud"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sleepMode}
                    onChange={(e) => setSleepMode(e.target.checked)}
                  />
                }
                label="Enable Sleep Mode"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Sleep mode reduces power consumption between readings
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Alert Thresholds</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Min Temperature (°C)"
                type="number"
                value={tempMin}
                onChange={(e) => setTempMin(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Max Temperature (°C)"
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Min Humidity (%)"
                type="number"
                value={humidityMin}
                onChange={(e) => setHumidityMin(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Max Humidity (%)"
                type="number"
                value={humidityMax}
                onChange={(e) => setHumidityMax(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Max CO2 (ppm)"
                type="number"
                value={co2Max}
                onChange={(e) => setCo2Max(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Min Battery (%)"
                type="number"
                value={batteryMin}
                onChange={(e) => setBatteryMin(Number(e.target.value))}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </TabPanel>

        {/* Calibration Tab */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Calibration changes should only be made by qualified technicians. 
              Incorrect calibration can lead to inaccurate sensor readings.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Temperature Sensor</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Offset (°C)"
                type="number"
                inputProps={{ step: 0.1 }}
                value={tempOffset}
                onChange={(e) => setTempOffset(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Scale Factor"
                type="number"
                inputProps={{ step: 0.01 }}
                value={tempScale}
                onChange={(e) => setTempScale(Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Humidity Sensor</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Offset (%)"
                type="number"
                inputProps={{ step: 0.1 }}
                value={humidityOffset}
                onChange={(e) => setHumidityOffset(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Scale Factor"
                type="number"
                inputProps={{ step: 0.01 }}
                value={humidityScale}
                onChange={(e) => setHumidityScale(Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>CO2 Sensor</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Offset (ppm)"
                type="number"
                inputProps={{ step: 1 }}
                value={co2Offset}
                onChange={(e) => setCo2Offset(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Scale Factor"
                type="number"
                inputProps={{ step: 0.01 }}
                value={co2Scale}
                onChange={(e) => setCo2Scale(Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Lidar Sensor</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Offset (cm)"
                type="number"
                inputProps={{ step: 0.1 }}
                value={lidarOffset}
                onChange={(e) => setLidarOffset(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Scale Factor"
                type="number"
                inputProps={{ step: 0.01 }}
                value={lidarScale}
                onChange={(e) => setLidarScale(Number(e.target.value))}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveCalibration}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Calibration'}
            </Button>
          </Box>
        </TabPanel>

        {/* Diagnostics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Device Diagnostics</Typography>
            <Button
              variant="outlined"
              startIcon={loadingDiagnostics ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={loadDiagnostics}
              disabled={loadingDiagnostics}
            >
              Refresh
            </Button>
          </Box>

          {diagnostics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Connectivity</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`Status: ${diagnostics.connectivity.connectionStatus}`}
                    color={getStatusColor(diagnostics.connectivity.connectionStatus)}
                    sx={{ mb: 1, mr: 1 }}
                  />
                  <Chip 
                    label={diagnostics.connectivity.isOnline ? 'Online' : 'Offline'}
                    color={diagnostics.connectivity.isOnline ? 'success' : 'error'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Last seen: {diagnostics.connectivity.lastSeen?.toDate?.()?.toLocaleString() || 'Unknown'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Data Flow</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`Quality: ${diagnostics.dataFlow.dataQuality}`}
                    color={getStatusColor(diagnostics.dataFlow.dataQuality)}
                    sx={{ mb: 1, mr: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Recent readings: {diagnostics.dataFlow.recentReadingsCount}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Hardware</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`Battery: ${diagnostics.hardware.batteryStatus}`}
                    color={getStatusColor(diagnostics.hardware.batteryStatus)}
                    sx={{ mb: 1, mr: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Firmware: {diagnostics.hardware.firmwareVersion}
                </Typography>
              </Grid>

              {diagnostics.recommendations.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Recommendations
                  </Typography>
                  {diagnostics.recommendations.map((recommendation: string, index: number) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      {recommendation}
                    </Alert>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceSettingsModal;
