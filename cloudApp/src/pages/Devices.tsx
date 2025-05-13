import React from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DevicesOther as DeviceIcon } from '@mui/icons-material';

const devices = [
  {
    id: "DEV001",
    name: "Greenhouse #1",
    type: "ESP32-S2",
    bin_type: "soy"
  },
  {
    id: "DEV002",
    name: "Greenhouse #2",
    type: "ESP32-S2",
    bin_type: "wheat"
  }
];

const Devices = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Monitoring Devices
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} md={6} key={device.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={() => navigate(`/device/${device.id}`)}
            >
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <DeviceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{device.name}</Typography>
                    <Typography color="textSecondary">Type: {device.type}</Typography>
                    <Typography color="textSecondary">Bin Type: {device.bin_type}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Devices;
