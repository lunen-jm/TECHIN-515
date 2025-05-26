import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Grid } from '@mui/material';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedSensorData } from '../../utils/seedSensorData';

const FirebaseDebug: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const testFirebaseConnection = async () => {
    setLoading(true);
    setError(null);
    setSeedResult(null);
    try {
      console.log('Testing Firebase connection...');
      
      // Test devices collection
      const devicesQuery = query(collection(db, 'devices'), limit(5));
      const devicesSnapshot = await getDocs(devicesQuery);
      const devicesList: any[] = [];
      devicesSnapshot.forEach((doc) => {
        devicesList.push({ id: doc.id, ...doc.data() });
      });
      setDevices(devicesList);
      console.log('Devices found:', devicesList);

      // Test readings collection
      const readingsQuery = query(collection(db, 'temperature_readings'), limit(5));
      const readingsSnapshot = await getDocs(readingsQuery);
      const readingsList: any[] = [];
      readingsSnapshot.forEach((doc) => {
        readingsList.push({ id: doc.id, ...doc.data() });
      });
      setReadings(readingsList);
      console.log('Readings found:', readingsList);

    } catch (err) {
      console.error('Firebase connection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setError(null);
    setSeedResult(null);
    
    try {
      console.log('Starting data seeding...');
      const result = await seedSensorData('test-device', 'test-user');
      
      if (result.success) {
        setSeedResult(result.message || 'Data seeded successfully!');
        // Refresh the connection test to show new data
        await testFirebaseConnection();
      } else {
        setError(result.error || 'Failed to seed data');
      }
    } catch (err) {
      console.error('Seeding error:', err);
      setError(err instanceof Error ? err.message : 'Unknown seeding error');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <Box sx={{ p: 3 }}>      <Typography variant="h6" gutterBottom>
        Firebase Connection Debug
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Button 
            variant="contained" 
            onClick={testFirebaseConnection} 
            disabled={loading || seeding}
          >
            {loading ? 'Testing...' : 'Test Firebase Connection'}
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            onClick={handleSeedData} 
            disabled={loading || seeding}
            color="secondary"
          >
            {seeding ? 'Seeding Data...' : 'Seed Test Data'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {seedResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {seedResult}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Devices Found: {devices.length}
        </Typography>
        {devices.map((device, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
            • {device.id}: {device.name || 'Unnamed'} (Type: {device.type || 'Unknown'})
          </Typography>
        ))}
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Temperature Readings Found: {readings.length}
        </Typography>
        {readings.map((reading, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
            • Device: {reading.deviceId}, Value: {reading.value}, Time: {reading.timestamp?.toDate?.()?.toLocaleString() || 'No timestamp'}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default FirebaseDebug;
