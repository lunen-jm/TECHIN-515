import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Agriculture as FarmIcon, 
  Sync as SyncIcon,
  Group as GroupIcon 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { createTestFarmForUser } from '../../utils/createTestFarm';
import { 
  migrateFarmsToMultiUser, 
  createTestFarmForUser as createMultiUserTestFarm, 
  checkUserHasFarms 
} from '../../firebase/services/migrationService';

const TestFarmCreator: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [creatingMultiUser, setCreatingMultiUser] = useState(false);  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    farmId?: string;
    deviceIds?: string[];
    recordsCreated?: number;
  } | null>(null);

  const handleCreateTestFarm = async () => {
    if (!currentUser) {
      setResult({
        success: false,
        message: 'You must be logged in to create a test farm.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await createTestFarmForUser(currentUser.uid);
      setResult(result);
    } catch (error) {
      console.error('Error creating test farm:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateFarms = async () => {
    setMigrating(true);
    setResult(null);

    try {
      const migrationResult = await migrateFarmsToMultiUser();
      setResult({
        success: true,
        message: `Migration completed! Migrated ${migrationResult.migratedCount} farms, skipped ${migrationResult.skippedCount} farms.`
      });
    } catch (error) {
      console.error('Migration error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to migrate farms'
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleCreateMultiUserTestFarm = async () => {
    if (!currentUser) {
      setResult({
        success: false,
        message: 'You must be logged in to create a test farm.'
      });
      return;
    }

    setCreatingMultiUser(true);
    setResult(null);

    try {
      // Check if user already has farms
      const hasFarms = await checkUserHasFarms(currentUser.uid);
      
      if (hasFarms) {
        setResult({
          success: false,
          message: 'You already have access to farms. No need to create a test farm.'
        });
        setCreatingMultiUser(false);
        return;
      }

      const farmId = await createMultiUserTestFarm(currentUser.uid);
      setResult({
        success: true,
        message: `Multi-user test farm created successfully! Farm ID: ${farmId}. Refresh the dashboard to see it.`
      });
    } catch (error) {
      console.error('Error creating multi-user test farm:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create test farm'
      });
    } finally {
      setCreatingMultiUser(false);
    }
  };
  return (
    <Box>      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
          onClose={() => setResult(null)}
        >
          <Typography variant="body2">
            {result.message || result.error}
          </Typography>
          {result.success && result.farmId && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Farm ID: {result.farmId}<br />
              Devices: {result.deviceIds?.length || 0}<br />
              Records: {result.recordsCreated || 0}
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SyncIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Migrate Farms
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Convert existing single-user farms to support multiple users. One-time operation.
              </Typography>

              <Button
                variant="outlined"
                onClick={handleMigrateFarms}
                disabled={migrating}
                startIcon={migrating ? <CircularProgress size={20} /> : <SyncIcon />}
                fullWidth
              >
                {migrating ? 'Migrating...' : 'Migrate Existing Farms'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">
                  Multi-User Test Farm
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a simple test farm with multi-user support enabled.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateMultiUserTestFarm}
                disabled={creatingMultiUser || !currentUser}
                startIcon={creatingMultiUser ? <CircularProgress size={20} /> : <GroupIcon />}
                fullWidth
              >
                {creatingMultiUser ? 'Creating...' : 'Create Multi-User Farm'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FarmIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Full Test Farm
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a complete test farm with devices and sensor data.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateTestFarm}
                disabled={loading || !currentUser}
                startIcon={loading ? <CircularProgress size={20} /> : <FarmIcon />}
                fullWidth
              >
                {loading ? 'Creating...' : 'Create Full Test Farm'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!currentUser && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please log in to create test farms or migrate data.
        </Alert>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Multi-User Farm System:</strong> Farms can now be shared among multiple users with different roles:
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
          <li><strong>Owner:</strong> Full control including adding/removing users</li>
          <li><strong>Admin:</strong> Can manage farm settings and add viewers</li>
          <li><strong>Viewer:</strong> Read-only access to farm data</li>
        </Box>
      </Box>
    </Box>
  );
};

export default TestFarmCreator;
