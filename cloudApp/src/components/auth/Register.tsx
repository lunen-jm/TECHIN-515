import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerWithEmail } from '../../firebase/services/authService';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await registerWithEmail(email, password, name);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>      {/* Left side - Registration Form */}      <Grid        item 
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
            Create Account
          </Typography>
          
          <Typography component="h2" variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Sign up to start monitoring your farm sensors
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
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
    </Grid>
  );
};

export default Register;