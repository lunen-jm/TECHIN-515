import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Container, 
  Box, 
  IconButton,
  Grid,
  LinearProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface MetricProps {
  label: string;
  value: string | number;
  progress?: number;
}

const Metric: React.FC<MetricProps> = ({ label, value, progress }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" sx={{ mt: 1 }}>
      {value}
    </Typography>
    {progress !== undefined && (
      <Box sx={{ mt: 1 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
    )}
  </Box>
);

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mockData = {
    users: {
      title: 'User Analytics',
      metrics: [
        { label: 'Active Users', value: '1,234', progress: 85 },
        { label: 'New Users (Today)', value: '45' },
        { label: 'Average Session Time', value: '24m' },
        { label: 'User Satisfaction', value: '4.5/5', progress: 90 }
      ]
    },
    analytics: {
      title: 'System Analytics',
      metrics: [
        { label: 'System Uptime', value: '99.9%', progress: 99.9 },
        { label: 'Response Time', value: '0.3s' },
        { label: 'Error Rate', value: '0.1%', progress: 0.1 },
        { label: 'CPU Usage', value: '45%', progress: 45 }
      ]
    }
  };

  const data = mockData[id as keyof typeof mockData];

  if (!data) {
    return <Typography>Section not found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{data.title}</Typography>
      </Box>
      
      <Grid container spacing={3}>
        {data.metrics.map((metric, index) => (
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
            <Paper sx={{ p: 3 }}>
              <Metric {...metric} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DetailView;