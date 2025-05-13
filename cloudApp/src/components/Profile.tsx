import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      // Update profile in Firebase Auth
      if (displayName !== currentUser.displayName) {
        await updateProfile(currentUser as User, { displayName });
      }
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(currentUser as User, email);
      }
      
      // Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await updatePassword(currentUser as User, password);
      }
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        username: displayName
      });
      
      setMessage('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
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
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={currentUser.photoURL || undefined} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">{currentUser.displayName || 'User'}</Typography>
              <Typography variant="body2" color="text.secondary">{currentUser.email}</Typography>
              
              {userDetails && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Account Type</Typography>
                      <Typography variant="body1">
                        {userDetails.globalAdmin ? 'Global Admin' : 
                         userDetails.localAdmin ? 'Local Admin' : 'Standard User'}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                      <Typography variant="body1">
                        {userDetails.createdAt ? new Date(userDetails.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
              
              <Box component="form" onSubmit={handleUpdateProfile}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="displayName"
                  label="Display Name"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Leave blank to keep your current password
                </Typography>
                
                <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  label="New Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;