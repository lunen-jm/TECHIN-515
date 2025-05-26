import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import FarmCreateForm from '../components/forms/FarmCreateForm';
import { createFarmWithMembership } from '../firebase/services/farmService';
import { FarmFormData } from '../utils/validation/farmValidation';
import { useAuth } from '../context/AuthContext';

const FarmCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FarmFormData) => {
    if (!currentUser) {
      setError('You must be logged in to create a farm.');
      return;
    }

    setIsLoading(true);
    setError(null);    try {
      // Transform form data to match farmService expected format
      const farmData = {
        name: formData.name,
        description: formData.description || '',
        user_id: currentUser.uid,
      };

      await createFarmWithMembership(farmData);
      
      setSuccessMessage('Farm created successfully!');
      
      // Navigate to the farm dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { message: `Farm "${formData.name}" has been created successfully!` }
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error creating farm:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred while creating the farm. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Create Farm</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Create New Farm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Register a new farm in the system to start monitoring and managing agricultural operations.
        </Typography>
      </Box>

      {/* Farm Creation Form */}
      <FarmCreateForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        onCancel={handleCancel}
      />

      {/* Success Message Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Message Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={8000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FarmCreatePage;
