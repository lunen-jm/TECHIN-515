import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tabs,
  Tab,
  Typography,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,  // List,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ContentCopy,
  Wifi,
  Smartphone,  CheckCircle,
  // Warning,
  AccessTime,
  QrCode,
  Router,
  Settings,
  CloudUpload
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { generateRegistrationCode } from '../firebase/services/deviceService';
import { getFarms } from '../firebase/services/farmService';
import { useAuth } from '../context/FirebaseAuthContext';

interface Farm {
  id: string;
  name: string;
}

interface RegistrationCode {
  registrationCode: string;
  expiresAt: any;
  deviceName: string;
  farmName: string;
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
      id={`provisioning-tabpanel-${index}`}
      aria-labelledby={`provisioning-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DeviceProvisioning: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const farmIdFromUrl = searchParams.get('farmId');
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [registrationCode, setRegistrationCode] = useState<RegistrationCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');  const loadFarms = useCallback(async () => {
    try {
      if (currentUser) {
        const farmsData = await getFarms(currentUser.uid);
        setFarms(farmsData);
        
        // Pre-select farm if farmId is provided in URL
        if (farmIdFromUrl && farmsData.some(farm => farm.id === farmIdFromUrl)) {
          setSelectedFarm(farmIdFromUrl);
        } else if (farmsData.length > 0) {
          setSelectedFarm(farmsData[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load farms');
    }
  }, [currentUser, farmIdFromUrl]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const handleGenerateCode = async () => {
    if (!selectedFarm || !deviceName.trim()) {
      setError('Please select a farm and enter a device name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateRegistrationCode({
        farmId: selectedFarm,
        deviceName: deviceName.trim(),
        location: location.trim() ? { name: location.trim(), coordinates: null } : undefined
      });

      setRegistrationCode(result);
      setActiveTab(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate registration code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard!');
    setSnackbarOpen(true);
  };

  const formatExpiryTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeUntilExpiry = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const expiryDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const setupSteps = [
    {
      label: 'Power on ESP32 device',
      description: 'The device will create a WiFi hotspot for setup',
      icon: <Settings />
    },
    {
      label: 'Connect to device WiFi',
      description: 'Network: FarmSensor_Setup, Password: setup123',
      icon: <Wifi />
    },
    {
      label: 'Open setup page',
      description: 'Visit http://192.168.4.1 in your browser',
      icon: <Router />
    },
    {
      label: 'Configure WiFi',
      description: 'Enter your farm\'s WiFi network credentials',
      icon: <Settings />
    },
    {
      label: 'Enter registration code',
      description: 'Use the generated code to register the device',
      icon: <CloudUpload />
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Add New Farm Sensor
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Generate a registration code to set up a new ESP32 sensor device
      </Typography>

      <Card>        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="device provisioning tabs"
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab 
            icon={<Smartphone />} 
            label="Generate Code" 
            iconPosition="start"
          />
          <Tab 
            icon={<Wifi />} 
            label="Device Setup" 
            disabled={!registrationCode}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Device Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Farm</InputLabel>
                <Select
                  value={selectedFarm}
                  label="Farm"
                  onChange={(e) => setSelectedFarm(e.target.value)}
                >
                  {farms.map((farm) => (
                    <MenuItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Field A Sensor"
                fullWidth
                required
              />

              <TextField
                label="Location (Optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., North Field, Greenhouse 2"
                fullWidth
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateCode}
                disabled={loading || !selectedFarm || !deviceName.trim()}
                sx={{ mt: 2 }}
              >
                {loading ? 'Generating...' : 'Generate Registration Code'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {registrationCode && (
            <Box>
              {/* Registration Code Display */}
              <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle />
                    Registration Code Generated
                  </Typography>
                  <Chip
                    icon={<AccessTime />}
                    label={getTimeUntilExpiry(registrationCode.expiresAt)}
                    variant="outlined"
                    sx={{ color: 'inherit', borderColor: 'currentColor' }}
                  />
                </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'primary.main' }}>
                    <Typography variant="h4" component="code" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {registrationCode.registrationCode}
                    </Typography>
                  </Paper>
                  <IconButton
                    onClick={() => copyToClipboard(registrationCode.registrationCode)}
                    sx={{ color: 'inherit' }}
                  >
                    <ContentCopy />
                  </IconButton>
                  <IconButton
                    onClick={() => setQrDialogOpen(true)}
                    sx={{ color: 'inherit' }}
                  >
                    <QrCode />
                  </IconButton>
                </Box>
                
                <Typography variant="body2">
                  Device: {registrationCode.deviceName} • Farm: {registrationCode.farmName}
                </Typography>
                <Typography variant="caption">
                  Expires: {formatExpiryTime(registrationCode.expiresAt)}
                </Typography>
              </Paper>

              {/* Setup Instructions */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
                <Card>
                  <CardHeader title="Setup Instructions" />
                  <CardContent>
                    <Stepper orientation="vertical">
                      {setupSteps.map((step, index) => (
                        <Step key={index} active>
                          <StepLabel icon={step.icon}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {step.label}
                            </Typography>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              {step.description}
                            </Typography>
                            {index === 4 && (
                              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2" component="code">
                                  Code: {registrationCode.registrationCode}
                                </Typography>
                              </Box>
                            )}
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Quick Actions" />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<QrCode />}
                        onClick={() => setQrDialogOpen(true)}
                        fullWidth
                      >
                        Show QR Code
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={() => copyToClipboard(registrationCode.registrationCode)}
                        fullWidth
                      >
                        Copy Code
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setActiveTab(0);
                          setRegistrationCode(null);
                          setDeviceName('');
                          setLocation('');
                          setError(null);
                        }}
                        fullWidth
                      >
                        Generate Another
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Alert severity="info" sx={{ mt: 4 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> The registration code expires in 24 hours. 
                  If setup is not completed within this time, you'll need to generate a new code.
                  The device must be powered on and in setup mode to complete registration.
                </Typography>
              </Alert>
            </Box>
          )}
        </TabPanel>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code for Mobile Setup</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          {registrationCode && (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <QRCodeSVG
                  value={JSON.stringify({
                    code: registrationCode.registrationCode,
                    device: registrationCode.deviceName,
                    farm: registrationCode.farmName,
                    type: 'farm-sensor-registration'
                  })}
                  size={250}
                  level="M"
                  includeMargin={true}
                />
              </Paper>
              <Typography variant="body2" color="text.secondary" align="center">
                Scan with your phone to quickly access the registration code
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default DeviceProvisioning;
