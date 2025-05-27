import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFarm, updateFarm, deleteFarm, getUserFarmRole } from '../firebase/services/farmService';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface FarmSettings {
  name: string;
  description: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  size: string;
  farmType: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Farm name is required')
    .min(3, 'Farm name must be at least 3 characters')
    .max(50, 'Farm name must be less than 50 characters'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
  location: Yup.string()
    .required('Location is required')
    .max(100, 'Location must be less than 100 characters'),  contactPhone: Yup.string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  contactEmail: Yup.string()
    .email('Please enter a valid email address'),
  size: Yup.string()
    .max(50, 'Size must be less than 50 characters'),
  farmType: Yup.string()
    .required('Farm type is required')
});

const farmTypeOptions = [
  'Grain Farm',
  'Dairy Farm',
  'Livestock Farm',
  'Poultry Farm',
  'Crop Farm',
  'Mixed Farm',
  'Organic Farm',
  'Other'
];

const FarmSettingsPage: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [farmData, setFarmData] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formik = useFormik<FarmSettings>({
    initialValues: {
      name: '',
      description: '',
      location: '',
      contactPhone: '',
      contactEmail: '',
      size: '',
      farmType: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!farmId || !currentUser) return;

      setSaving(true);
      setError(null);

      try {
        await updateFarm(farmId, values);
        setSuccessMessage('Farm settings updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error updating farm:', error);
        setError(error instanceof Error ? error.message : 'Failed to update farm settings');
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    const loadFarmData = async () => {
      if (!farmId || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Check user's role in this farm
        const role = await getUserFarmRole(farmId, currentUser.uid);
        setUserRole(role);

        // Only owners and admins can access settings
        if (role !== 'owner' && role !== 'admin') {
          setError('You do not have permission to access farm settings');
          setLoading(false);
          return;
        }        // Load farm data
        const farm = await getFarm(farmId);
        if (farm) {
          setFarmData(farm);
        } else {
          setError('Farm not found');
        }
      } catch (error) {
        console.error('Error loading farm data:', error);
        setError('Failed to load farm data');
      } finally {
        setLoading(false);
      }
    };

    loadFarmData();
  }, [farmId, currentUser]);

  // Update form values when farmData changes
  useEffect(() => {
    if (farmData) {
      formik.setValues({
        name: farmData.name || '',
        description: farmData.description || '',
        location: farmData.location || '',
        contactPhone: farmData.contactPhone || '',
        contactEmail: farmData.contactEmail || '',
        size: farmData.size || '',
        farmType: farmData.farmType || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmData]);

  const handleDeleteFarm = async () => {
    if (!farmId || !currentUser || userRole !== 'owner') return;

    setDeleting(true);
    setError(null);

    try {
      await deleteFarm(farmId);
      setSuccessMessage('Farm deleted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error deleting farm:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete farm');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !farmData) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Breadcrumb Navigation HIDDEN
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
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
          <Link
            color="inherit"
            href={`/farms/${farmId}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/farms/${farmId}`);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {farmData?.name || 'Farm'}
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>
      </Box>
      */}

      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <SettingsIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Farm Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your farm information and configuration
          </Typography>
        </Box>
      </Box>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Settings Form */}
      <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Farm Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.farmType && Boolean(formik.errors.farmType)}>
                <InputLabel id="farmType-label">Farm Type *</InputLabel>
                <Select
                  labelId="farmType-label"
                  id="farmType"
                  name="farmType"
                  value={formik.values.farmType}
                  label="Farm Type *"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {farmTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.farmType && formik.errors.farmType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.farmType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="size"
                name="size"
                label="Farm Size"
                placeholder="e.g. 100 acres"
                value={formik.values.size}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.size && Boolean(formik.errors.size)}
                helperText={formik.touched.size && formik.errors.size}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="contactPhone"
                name="contactPhone"
                label="Phone Number"
                value={formik.values.contactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactPhone && Boolean(formik.errors.contactPhone)}
                helperText={formik.touched.contactPhone && formik.errors.contactPhone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="contactEmail"
                name="contactEmail"
                label="Email Address"
                type="email"
                value={formik.values.contactEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                helperText={formik.touched.contactEmail && formik.errors.contactEmail}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving || !formik.isValid}
                  sx={{ minWidth: 140 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>

                {userRole === 'owner' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={saving}
                    sx={{ ml: 'auto' }}
                  >
                    Delete Farm
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Farm
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{farmData?.name}"? This action cannot be undone and will:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2, mb: 1 }}>
            <li>Delete all farm data and settings</li>
            <li>Remove all user access to this farm</li>
            <li>Delete all associated devices and sensor data</li>
          </Box>
          <DialogContentText color="error">
            This action is permanent and cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteFarm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Farm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FarmSettingsPage;
