import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signInWithEmail, signInWithGoogle } from '../../firebase/services/authService';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const isDevMode = process.env.NODE_ENV === 'development';

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const useTestAccount = () => {
    setEmail('test@example.com');
    setPassword('Test123!');
  };
  return (
    <Grid container sx={{ minHeight: '100vh' }}>      {/* Left side - Login Form */}      <Grid        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6, lg: 8 },
          bgcolor: 'background.default',
          position: 'relative',
          zIndex: 1,
          boxShadow: '10px 0 30px -5px rgba(0, 0, 0, 0.3)'
        }}
      >        
        {/* Logo and App Name in top left */}
        <Box sx={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: '50%' }}></Box>
          <Typography variant="subtitle1" fontWeight="600">
            Farm Sensor Dashboard
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 480, width: '100%', mx: 'auto' }}>
          <Typography component="h1" variant="h4" gutterBottom fontWeight="700">
            Welcome Back
          </Typography>
          
          <Typography component="h2" variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Sign in to continue to your dashboard
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleEmailSignIn} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Sign In with Google
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
          
          {isDevMode && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Account
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Use the following test account to sign in:
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    <strong>Email:</strong> test@example.com<br />
                    <strong>Password:</strong> Test123!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={useTestAccount}
                    fullWidth
                  >
                    Use Test Account
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Grid>
        {/* Right side - Farm Photo (hidden on mobile) */}
      {!isMobile && (
        <Grid 
          item 
          md={6} 
          sx={{ 
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
      )}
    </Grid>  );
};

export default Login;