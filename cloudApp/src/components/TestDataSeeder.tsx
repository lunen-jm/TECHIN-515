import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, AlertColor } from '@mui/material';
import { seedTestData } from '../firebase/seedTestData';

const TestDataSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; severity: AlertColor} | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      await seedTestData();
      setResult({
        success: true,
        message: 'Successfully added test data to the database!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error seeding test data:', error);
      setResult({
        success: false,
        message: 'Error adding test data. See console for details.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ mt: 3, p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', bgcolor: 'background.default' }}>
      <Typography variant="h6" gutterBottom>
        Development Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add test data to the database for development purposes.
      </Typography>
      
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSeedData}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Adding Test Data...' : 'Add Test Data'}
      </Button>
      
      {result && (
        <Alert 
          severity={result.severity}
          sx={{ mt: 2 }}
        >
          {result.message}
        </Alert>
      )}
    </Box>
  );
};

export default TestDataSeeder;