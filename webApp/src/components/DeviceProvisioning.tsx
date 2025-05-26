import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Wifi, Smartphone, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { generateRegistrationCode } from '../services/deviceService';
import { getFarms } from '../services/farmService';

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

const DeviceProvisioning: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [registrationCode, setRegistrationCode] = useState<RegistrationCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const farmsData = await getFarms();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setSelectedFarm(farmsData[0].id);
      }
    } catch (err) {
      setError('Failed to load farms');
    }
  };

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
      setActiveTab('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate registration code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Farm Sensor</h1>
        <p className="text-gray-600">Generate a registration code to set up a new ESP32 sensor device</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Generate Code
          </TabsTrigger>
          <TabsTrigger value="setup" disabled={!registrationCode} className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Device Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm">Farm</Label>
                  <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g., Field A Sensor"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., North Field, Greenhouse 2"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerateCode} 
                disabled={loading || !selectedFarm || !deviceName.trim()}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Registration Code'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {registrationCode && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Registration Code Generated
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Registration Code</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeUntilExpiry(registrationCode.expiresAt)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-mono font-bold text-green-900 bg-white px-3 py-2 rounded border">
                        {registrationCode.registrationCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(registrationCode.registrationCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Device: {registrationCode.deviceName} • Farm: {registrationCode.farmName}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Expires: {formatExpiryTime(registrationCode.expiresAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wifi className="w-5 h-5" />
                      Setup Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Power on your ESP32 device</p>
                          <p className="text-sm text-gray-600">The device will create a WiFi hotspot for setup</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Connect to WiFi network</p>
                          <p className="text-sm text-gray-600">
                            Network: <code className="bg-gray-100 px-1 rounded">FarmSensor_Setup</code><br/>
                            Password: <code className="bg-gray-100 px-1 rounded">setup123</code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Open setup page</p>
                          <p className="text-sm text-gray-600">
                            Visit <code className="bg-gray-100 px-1 rounded">http://192.168.4.1</code> in your browser
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          4
                        </div>
                        <div>
                          <p className="font-medium">Configure WiFi</p>
                          <p className="text-sm text-gray-600">Enter your farm's WiFi network credentials</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          5
                        </div>
                        <div>
                          <p className="font-medium">Enter registration code</p>
                          <p className="text-sm text-gray-600">
                            Use the code: <code className="bg-gray-100 px-1 rounded font-mono">
                              {registrationCode.registrationCode}
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="font-medium">Setup complete!</p>
                          <p className="text-sm text-gray-600">Your device will restart and begin sending data</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>QR Code for Mobile Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          code: registrationCode.registrationCode,
                          device: registrationCode.deviceName,
                          farm: registrationCode.farmName
                        })}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Scan with your phone to quickly access the registration code
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The registration code expires in 24 hours. 
                  If setup is not completed within this time, you'll need to generate a new code.
                  The device must be powered on and in setup mode to complete registration.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setActiveTab('generate');
                    setRegistrationCode(null);
                    setDeviceName('');
                    setLocation('');
                    setError(null);
                  }}
                >
                  Generate Another Code
                </Button>
                <Button 
                  onClick={() => window.location.href = '/devices'}
                >
                  View All Devices
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceProvisioning;
