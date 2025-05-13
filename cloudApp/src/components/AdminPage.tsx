import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  CircularProgress, 
  Alert, 
  IconButton, 
  Card, 
  CardContent, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { initializeSchema, createPredefinedUsers } from '../firebase';
import { useNavigate } from 'react-router-dom';
import TestDataSeeder from './TestDataSeeder';
import { createTestUser } from '../firebase/services/authService';

const AdminPage: React.FC = () => {
  const [initializing, setInitializing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProdUsers, setIsCreatingProdUsers] = useState(false);
  const [prodUsersCreated, setProdUsersCreated] = useState(false);
  const [prodUsersError, setProdUsersError] = useState<string | null>(null);
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

  const handleCreateTestUser = async () => {
    setIsCreatingUser(true);
    setError(null);
    
    try {
      await createTestUser();
      setUserCreated(true);
    } catch (error: any) {
      setError(error.message || 'Failed to create test user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateProdUsers = async () => {
    setIsCreatingProdUsers(true);
    setProdUsersError(null);
    
    try {
      await createPredefinedUsers();
      setProdUsersCreated(true);
    } catch (error: any) {
      setProdUsersError(error.message || 'Failed to create production users');
    } finally {
      setIsCreatingProdUsers(false);
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
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test User Management
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Create a test user with the following credentials:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  p: 2, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Email: test@example.com
                  Password: Test123!
                </Typography>
              </Box>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {userCreated && <Alert severity="success" sx={{ mb: 2 }}>Test user created successfully!</Alert>}
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCreateTestUser}
                disabled={isCreatingUser}
                startIcon={isCreatingUser ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isCreatingUser ? 'Creating...' : 'Create Test User'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Production User Management
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Create predefined user accounts for production use:
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account Type</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Password</TableCell>
                        <TableCell>Permissions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Standard User</TableCell>
                        <TableCell>user@farmsensors.com</TableCell>
                        <TableCell>FarmUser2025!</TableCell>
                        <TableCell>Basic access</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Admin User</TableCell>
                        <TableCell>admin@farmsensors.com</TableCell>
                        <TableCell>FarmAdmin2025!</TableCell>
                        <TableCell>Full admin access</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              {prodUsersError && <Alert severity="error" sx={{ mb: 2 }}>{prodUsersError}</Alert>}
              {prodUsersCreated && <Alert severity="success" sx={{ mb: 2 }}>Production users created successfully!</Alert>}
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCreateProdUsers}
                disabled={isCreatingProdUsers}
                startIcon={isCreatingProdUsers ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isCreatingProdUsers ? 'Creating...' : 'Create Production Users'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage;