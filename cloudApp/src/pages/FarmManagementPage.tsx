import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { getFarm, getFarmMembers, removeUserFromFarm, getUserFarmRole } from '../firebase/services/farmService';
import { useAuth } from '../context/FirebaseAuthContext';
import AddUserToFarmForm from '../components/forms/AddUserToFarmForm';

interface FarmMember {
  id: string;
  userId: string;
  role: string;
  addedAt: any;
  addedBy: string;
}

interface Farm {
  id: string;
  name: string;
  description: string;
  createdBy?: string;
  createdAt?: any;
}

const FarmManagementPage: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [members, setMembers] = useState<FarmMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);  const [error, setError] = useState<string | null>(null);

  const loadFarmData = useCallback(async () => {
    if (!farmId || !currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Load farm details and user role in parallel
      const [farmData, role] = await Promise.all([
        getFarm(farmId),
        getUserFarmRole(farmId, currentUser.uid)
      ]);

      if (!farmData) {
        setError('Farm not found');
        return;
      }

      if (!role) {
        setError('You do not have access to this farm');
        return;
      }

      setFarm(farmData as Farm);
      setUserRole(role);

      // Load members if user has admin/owner permissions
      if (role === 'owner' || role === 'admin') {
        const membersData = await getFarmMembers(farmId);
        setMembers(membersData);
      }
    } catch (err) {
      console.error('Error loading farm data:', err);
      setError('Failed to load farm data');
    } finally {
      setLoading(false);
    }
  }, [farmId, currentUser]);

  useEffect(() => {
    if (farmId && currentUser) {
      loadFarmData();
    }
  }, [farmId, currentUser, loadFarmData]);

  const handleRemoveUser = async (memberId: string, memberUserId: string) => {
    if (!farmId || !currentUser) return;

    // Prevent users from removing themselves (they should use "Leave Farm" instead)
    if (memberUserId === currentUser.uid) {
      setError('Use "Leave Farm" to remove yourself from the farm');
      return;
    }

    try {
      await removeUserFromFarm(farmId, memberUserId);
      await loadFarmData(); // Refresh the members list
    } catch (err) {
      console.error('Error removing user from farm:', err);
      setError('Failed to remove user from farm');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'primary';
      case 'admin': return 'secondary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading farm data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumb Navigation HIDDEN
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
          <Typography color="text.primary">
            {farm?.name} - Management
          </Typography>
        </Breadcrumbs>
      </Box>
      */}

      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {farm?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {farm?.description}
          </Typography>
          <Chip 
            label={`Your Role: ${userRole}`} 
            color={getRoleColor(userRole || '')}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Farm Members */}
        {(userRole === 'owner' || userRole === 'admin') && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Farm Members ({members.length})
                  </Typography>
                  <Button
                    startIcon={<PersonAddIcon />}
                    variant="contained"
                    onClick={() => setShowAddUser(!showAddUser)}
                  >
                    Add User
                  </Button>
                </Box>

                {members.length === 0 ? (
                  <Typography color="text.secondary">
                    No members found.
                  </Typography>
                ) : (
                  <List>
                    {members.map((member) => (
                      <ListItem key={member.id} divider>
                        <ListItemText
                          primary={member.userId}
                          secondary={`Role: ${member.role} • Added: ${member.addedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={member.role} 
                            color={getRoleColor(member.role)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {userRole === 'owner' && member.userId !== currentUser?.uid && (
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleRemoveUser(member.id, member.userId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Add User Form */}
        {showAddUser && farm && (userRole === 'owner' || userRole === 'admin') && (
          <Grid item xs={12} md={4}>
            <AddUserToFarmForm
              farmId={farm.id}
              farmName={farm.name}
              onUserAdded={() => {
                loadFarmData(); // Refresh the members list
                setShowAddUser(false);
              }}
            />
          </Grid>
        )}

        {/* Farm Information */}
        <Grid item xs={12} md={showAddUser ? 12 : 4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Farm Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Farm Name
                </Typography>
                <Typography variant="body1">
                  {farm?.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {farm?.description || 'No description provided'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Your Access Level
                </Typography>
                <Chip 
                  label={userRole} 
                  color={getRoleColor(userRole || '')}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FarmManagementPage;
