import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  CircularProgress, 
  Alert, 
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { initializeSchema } from '../firebase';
import { useNavigate } from 'react-router-dom';
import TestDataSeeder from './TestDataSeeder';

const AdminPage: React.FC = () => {
  const [initializing, setInitializing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const navigate = useNavigate();

  const handleInitializeSchema = async () => {
    setInitializing(true);
    setResult(null);
    
    try {
      await initializeSchema();
      setResult({
        success: true,
        message: 'Database schema initialized successfully!'
      });
    } catch (error) {
      console.error('Error initializing schema:', error);
      setResult({
        success: false,
        message: 'Error initializing database. See console for details.'
      });
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          size="small"
          sx={{ mr: 2 }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Database Administration
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Use this page to manage your Firebase database. Only administrators should access this page.
        These actions are only available in development mode and should be used with caution.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Initialize Database Schema
        </Typography>
        <Typography variant="body2" paragraph>
          This will create all necessary collections and initial documents in your Firestore database.
          Only run this once when setting up a new database.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleInitializeSchema}
            disabled={initializing}
            startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {initializing ? 'Initializing...' : 'Initialize Schema'}
          </Button>
        </Box>
        
        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={result.success ? 'success' : 'error'}>
              {result.message}
            </Alert>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Seed Test Data
        </Typography>
        <Typography variant="body2" paragraph>
          This will populate your database with sample farms, devices, and sensor readings for testing purposes.
          Use this only in development mode to set up test data.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <TestDataSeeder />
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminPage;