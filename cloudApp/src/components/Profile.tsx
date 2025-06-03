import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Avatar, 
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../context/useAuth';
import { signOutUser } from '../firebase/services/authService';

const Profile: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Firebase User:', currentUser);
    }
  }, [isAuthenticated, currentUser]);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <Container>
        <Typography>You must be logged in to view this page.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
          <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={currentUser.photoURL || undefined} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">{currentUser.displayName || 'User'}</Typography>
              <Typography variant="body2" color="text.secondary">{currentUser.email}</Typography>
              
              <Box sx={{ mt: 2, width: '100%' }}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Email Verified</Typography>
                    <Typography variant="body1">
                      {currentUser.emailVerified ? 'Yes' : 'No'}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Account Created</Typography>
                    <Typography variant="body1">
                      {currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>

                {currentUser.uid && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {currentUser.uid}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" paragraph>
                  <strong>Name:</strong> {currentUser.displayName || 'Not provided'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong> {currentUser.email || 'Not provided'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Provider:</strong> {currentUser.providerData?.[0]?.providerId || 'Firebase'}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    sx={{ mr: 2 }}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setMessage('Profile updates can be made through Firebase')}
                  >
                    Update Profile
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;