import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getActiveRegistrationCodes, revokeRegistrationCode } from '../firebase/services/deviceService';

interface RegistrationCode {
  id: string;
  code: string;
  device_name: string;
  farm_id: string;
  user_id: string;
  created_at: any;
  expires_at: any;
  used: boolean;
  revoked_at?: any;
  location?: {
    name: string;
    coordinates?: any;
  };
}

const RegistrationCodeManagement: React.FC = () => {
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<RegistrationCode | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeCodes = await getActiveRegistrationCodes();
      setCodes(activeCodes as RegistrationCode[]);
    } catch (error) {
      console.error('Error fetching registration codes:', error);
      setError('Failed to fetch registration codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a snackbar notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleRevokeClick = (code: RegistrationCode) => {
    setSelectedCode(code);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedCode) return;

    try {
      setRevoking(true);
      await revokeRegistrationCode(selectedCode.id);
      await fetchCodes(); // Refresh the list
      setRevokeDialogOpen(false);
      setSelectedCode(null);
    } catch (error) {
      console.error('Error revoking code:', error);
      setError('Failed to revoke registration code');
    } finally {
      setRevoking(false);
    }
  };

  const getTimeUntilExpiry = (expiresAt: any) => {
    if (!expiresAt) return 'Never';
    
    const now = new Date();
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getCodeStatus = (code: RegistrationCode) => {
    if (code.used) return 'used';
    if (code.revoked_at) return 'revoked';
    
    const now = new Date();
    const expiry = code.expires_at.toDate ? code.expires_at.toDate() : new Date(code.expires_at);
    
    if (expiry.getTime() <= now.getTime()) return 'expired';
    return 'active';
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
      case 'expired':
        return <Chip icon={<AccessTimeIcon />} label="Expired" color="warning" size="small" />;
      case 'used':
        return <Chip icon={<CheckCircleIcon />} label="Used" color="info" size="small" />;
      case 'revoked':
        return <Chip icon={<CancelIcon />} label="Revoked" color="error" size="small" />;
      default:
        return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeCodes = codes.filter(code => getCodeStatus(code) === 'active');
  const expiredCodes = codes.filter(code => getCodeStatus(code) === 'expired');
  const usedCodes = codes.filter(code => getCodeStatus(code) === 'used');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            Registration Code Management
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchCodes}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {activeCodes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {expiredCodes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {usedCodes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Used Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {codes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Registration Codes Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Device Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No registration codes found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((code) => {
                  const status = getCodeStatus(code);
                  return (
                    <TableRow key={code.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                            {code.code}
                          </Typography>
                          <Tooltip title="Copy code">
                            <IconButton size="small" onClick={() => handleCopyCode(code.code)} sx={{ ml: 1 }}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {code.device_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {code.created_at?.toDate ? 
                            code.created_at.toDate().toLocaleDateString() : 
                            'Unknown'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={status === 'expired' ? 'error.main' : 'text.primary'}>
                          {getTimeUntilExpiry(code.expires_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {code.location?.name || 'Not specified'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {status === 'active' && (
                          <Tooltip title="Revoke code">
                            <IconButton 
                              size="small" 
                              onClick={() => handleRevokeClick(code)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revoke Registration Code</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke the registration code <strong>{selectedCode?.code}</strong>?
            This action cannot be undone and the code will no longer be usable for device registration.
          </DialogContentText>
          {selectedCode && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Device:</strong> {selectedCode.device_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Location:</strong> {selectedCode.location?.name || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Expires:</strong> {getTimeUntilExpiry(selectedCode.expires_at)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)} disabled={revoking}>
            Cancel
          </Button>
          <Button 
            onClick={handleRevokeConfirm} 
            color="error" 
            variant="contained"
            disabled={revoking}
          >
            {revoking ? 'Revoking...' : 'Revoke Code'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrationCodeManagement;
