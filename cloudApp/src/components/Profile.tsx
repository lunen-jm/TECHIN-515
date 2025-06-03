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
import { useAuth } from '../context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { user, logout } = useAuth0();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Auth0 User:', user);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (!isAuthenticated || !user) {
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
                src={user.picture || undefined} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">{user.name || user.nickname || 'User'}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              
              <Box sx={{ mt: 2, width: '100%' }}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Email Verified</Typography>
                    <Typography variant="body1">
                      {user.email_verified ? 'Yes' : 'No'}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>

                {user.sub && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {user.sub}
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
                  <strong>Name:</strong> {user.name || 'Not provided'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong> {user.email || 'Not provided'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Nickname:</strong> {user.nickname || 'Not provided'}
                </Typography>
                {user.locale && (
                  <Typography variant="body1" paragraph>
                    <strong>Locale:</strong> {user.locale}
                  </Typography>
                )}
                
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
                    onClick={() => setMessage('Profile management is handled through Auth0')}
                  >
                    Manage Profile
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