import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Google as GoogleIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth0Firebase } from '../../auth0/Auth0FirebaseProvider';
import { Link as RouterLink } from 'react-router-dom';

const EnhancedLogin: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    auth0Error, 
    loginWithRedirect 
  } = useAuth0Firebase();

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }
  const handleAuth0Login = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'Username-Password-Authentication',
        prompt: 'select_account' // Allow users to choose account
      }
    });
  };

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2'
      }
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
      </Box>
    );
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6, lg: 8 },
          bgcolor: 'background.default'
        }}
      >
        {/* Logo and App Name */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: '50%' }}></Box>
          <Typography variant="h6" fontWeight="600">
            Farm Sensor Dashboard
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 480, width: '100%' }}>
          <Typography component="h1" variant="h4" gutterBottom fontWeight="700">
            Welcome Back
          </Typography>
          
          <Typography component="h2" variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Sign in to continue to your dashboard
          </Typography>
          
          {auth0Error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Authentication error: {auth0Error.message}
            </Alert>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enterprise Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Secure authentication powered by Auth0 with Firebase integration
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleAuth0Login}
                sx={{ mb: 2 }}
                size="large"
              >
                Sign In with Auth0
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                size="large"
              >
                Sign In with Google
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Legacy Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Continue using the original Firebase authentication
              </Typography>
              
              <Button
                component={RouterLink}
                to="/login/firebase"
                fullWidth
                variant="outlined"
                size="large"
              >
                Use Firebase Login
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button 
                onClick={() => loginWithRedirect({ 
                  authorizationParams: { screen_hint: 'signup' } 
                })}
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Right side - Farm Photo */}
      <Grid 
        item 
        md={6} 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/images/farm-photo-by-matt-benson.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 24,
            right: 24,
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)'
          }}
        >
          <Typography variant="caption">
            Photo by Matt Benson
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default EnhancedLogin;
