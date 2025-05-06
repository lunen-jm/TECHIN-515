import React from 'react';
import { Grid, Container } from '@mui/material';
import DashboardCard from '../cards/DashboardCard';
import { 
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Storage as StorageIcon,
  Task as TaskIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Users',
      stats: '1,234',
      description: 'Active users in the system',
      icon: PeopleIcon,
      path: '/users'
    },
    {
      title: 'Analytics',
      stats: '85%',
      description: 'System performance metrics',
      icon: AssessmentIcon,
      path: '/analytics'
    },
    {
      title: 'Storage',
      stats: '756 GB',
      description: 'Total storage usage',
      icon: StorageIcon,
      path: '/storage'
    },
    {
      title: 'Tasks',
      stats: '23',
      description: 'Pending tasks',
      icon: TaskIcon,
      path: '/tasks'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid key={index} component="div" sx={{
            flexBasis: {
              xs: '100%',
              sm: '50%',
              md: '25%'
            },
            maxWidth: {
              xs: '100%',
              sm: '50%',
              md: '25%'
            }
          }}>
            <DashboardCard
              title={item.title}
              stats={item.stats}
              description={item.description}
              icon={item.icon}
              onClick={() => navigate(item.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Overview;