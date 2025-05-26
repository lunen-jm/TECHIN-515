import React, { useState } from 'react';
import { Box, Typography, Button, Alert, TextField } from '@mui/material';
import { 
  addTemperatureReading, 
  addHumidityReading, 
  addCO2Reading, 
  addLidarReading, 
  addOutdoorTempReading 
} from '../../firebase/services/readingsService';

const DataSeeder: React.FC = () => {
  const [deviceId, setDeviceId] = useState('test-device-1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const generateSampleData = async () => {
    if (!deviceId.trim()) {
      setMessage('Please enter a device ID');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const now = new Date();
      const promises = [];

      // Generate 20 data points over the last 20 hours
      for (let i = 0; i < 20; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // Temperature readings (20-30°C)
        promises.push(addTemperatureReading({
          device_id: deviceId,
          temperature_value: Math.round((Math.random() * 10 + 20) * 10) / 10,
          timestamp
        }));

        // Humidity readings (40-80%)
        promises.push(addHumidityReading({
          device_id: deviceId,
          humidity_value: Math.round((Math.random() * 40 + 40) * 10) / 10,
          timestamp
        }));

        // CO2 readings (400-1200 ppm)
        promises.push(addCO2Reading({
          device_id: deviceId,
          co2_value: Math.round(Math.random() * 800 + 400),
          timestamp
        }));

        // Lidar readings (50-200 cm)
        promises.push(addLidarReading({
          device_id: deviceId,
          distance_value: Math.round((Math.random() * 150 + 50) * 10) / 10,
          timestamp
        }));

        // Outdoor temperature readings (5-25°C)
        promises.push(addOutdoorTempReading({
          device_id: deviceId,
          outdoor_temp_value: Math.round((Math.random() * 20 + 5) * 10) / 10,
          timestamp
        }));
      }

      await Promise.all(promises);
      setMessage(`Successfully added 100 sample readings for device ${deviceId}`);
      setIsError(false);
      console.log('Sample data seeded successfully');
      
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage(`Error seeding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Seeder - Add Sample Sensor Data
      </Typography>
      
      <TextField
        label="Device ID"
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        placeholder="Enter device ID (e.g., test-device-1)"
      />
      
      <Button 
        variant="contained" 
        onClick={generateSampleData} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Adding Sample Data...' : 'Add 100 Sample Readings'}
      </Button>

      {message && (
        <Alert severity={isError ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary">
        This will add 20 readings for each sensor type (temperature, humidity, CO2, lidar, outdoor temperature) 
        with timestamps spread over the last 20 hours for the specified device ID.
      </Typography>
    </Box>
  );
};

export default DataSeeder;
