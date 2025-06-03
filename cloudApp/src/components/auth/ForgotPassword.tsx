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
import { Link as RouterLink } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>      {/* Left side - Password Reset Form */}      <Grid        item 
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
            Reset Password
          </Typography>
          
          <Typography component="h2" variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Enter your email to receive password reset instructions
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Sign In
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                Create an account
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

export default ForgotPassword;