import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { addUserToFarm } from '../../firebase/services/farmService';
import { useAuth } from '../../context/FirebaseAuthContext';

interface AddUserToFarmFormProps {
  farmId: string;
  farmName: string;
  onUserAdded?: () => void;
}

const AddUserToFarmForm: React.FC<AddUserToFarmFormProps> = ({
  farmId,
  farmName,
  onUserAdded
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to add users.' });
      return;
    }

    if (!userEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user email.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Note: In a real implementation, you'd need to look up the user ID by email
      // For now, we'll assume the email is the user ID or implement a user lookup service
      await addUserToFarm(farmId, userEmail.trim(), role, currentUser.uid);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${userEmail} as ${role} to ${farmName}` 
      });
      
      setUserEmail('');
      setRole('viewer');
      
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (err) {
      console.error('Error adding user to farm:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to add user to farm' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonAddIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Add User to {farmName}
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="User Email or ID"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            placeholder="Enter user email or ID"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
              disabled={isLoading}
            >
              <MenuItem value="viewer">Viewer (Read Only)</MenuItem>
              <MenuItem value="admin">Admin (Full Access)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {isLoading ? 'Adding User...' : 'Add User'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddUserToFarmForm;
