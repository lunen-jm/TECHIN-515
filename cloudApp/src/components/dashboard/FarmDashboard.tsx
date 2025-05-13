import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserFarms } from '../../firebase/services/farmService';
import { Agriculture as AgricultureIcon, Add as AddIcon } from '@mui/icons-material';

interface Farm {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
}

const FarmDashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        // In a real app, you'd get the current user ID from authentication
        // For now, we'll use a placeholder user ID that matches the test data
        const userId = 'test-user-1';
        const farmsData = await getUserFarms(userId);
        setFarms(farmsData);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleFarmClick = (farmId: string) => {
    navigate(`/farms/${farmId}`);
  };

  const getFarmBackground = (index: number) => {
    const colors = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5', '#e0f7fa', '#fff8e1'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Farms
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/farms/create')}
        >
          Add Farm
        </Button>
      </Box>

      {farms.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
          <AgricultureIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Farms Found
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
            You don't have any farms set up yet. Add your first farm to start monitoring your devices.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/farms/create')}
          >
            Add Your First Farm
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {farms.map((farm, index) => (
            <Grid item xs={12} sm={6} md={4} key={farm.id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: getFarmBackground(index),
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardActionArea onClick={() => handleFarmClick(farm.id)} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <AgricultureIcon />
                      </Avatar>
                      <Typography variant="h5" component="div">
                        {farm.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {farm.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Created: {farm.createdAt ? new Date(farm.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </Typography>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FarmDashboard;