import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import { Google as GoogleIcon, Email as EmailIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';
import { useAuth as useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth0 } from '@auth0/auth0-react';

// Check if Auth0 is configured
const isAuth0Configured = process.env.REACT_APP_AUTH0_DOMAIN && 
  process.env.REACT_APP_AUTH0_CLIENT_ID && 
  !process.env.REACT_APP_AUTH0_DOMAIN.includes('your-domain') && 
  !process.env.REACT_APP_AUTH0_CLIENT_ID.includes('your-client-id');

const HybridLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Auth0 hooks (only used if Auth0 is configured)
  const { loginWithRedirect, isAuthenticated: auth0IsAuthenticated, isLoading: auth0Loading, error: auth0Error } = isAuth0Configured ? useAuth0() : { loginWithRedirect: null, isAuthenticated: false, isLoading: false, error: null };
  
  // Firebase hooks (used as fallback)
  const firebaseAuth = useFirebaseAuth();
  
  // Use Auth0 if configured, otherwise use Firebase
  const { isAuthenticated, loading: contextLoading } = isAuth0Configured ? { isAuthenticated: auth0IsAuthenticated, loading: auth0Loading } : firebaseAuth;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Handle Auth0 errors
  useEffect(() => {
    if (auth0Error) {
      setError(auth0Error.message || 'Authentication failed');
    }
  }, [auth0Error]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      if (isAuth0Configured && loginWithRedirect) {
        // Use Auth0 for authentication
        await loginWithRedirect({
          authorizationParams: {
            connection: 'Username-Password-Authentication',
            login_hint: email
          }
        });
      } else {
        // Use Firebase authentication directly
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (isAuth0Configured && loginWithRedirect) {
        // Use Auth0 Google connection
        await loginWithRedirect({
          authorizationParams: {
            connection: 'google-oauth2'
          }
        });
      } else {
        // Use Firebase Google authentication
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
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
            {isAuth0Configured 
              ? 'Sign in with your Auth0 account' 
              : 'Sign in to continue to your dashboard'
            }
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!isAuth0Configured && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Using Firebase authentication (Auth0 not configured)
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
            {/* Google Sign In Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ 
                mb: 2,
                py: 1.5,
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.100'
                }
              }}
              size="large"
            >
              Continue with Google
            </Button>

            {!isAuth0Configured && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    or continue with email
                  </Typography>
                </Divider>

                {/* Email/Password Form */}
                <Box component="form" onSubmit={handleEmailSignIn}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    variant="outlined"
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
                    sx={{ py: 1.5 }}
                    size="large"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button 
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Typography>
            {!isAuth0Configured && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  sx={{ textTransform: 'none' }}
                >
                  Forgot Password?
                </Button>
              </Typography>
            )}
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

export default HybridLogin;
