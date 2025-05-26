import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SensorChart from './charts/SensorChart';
import { generateTestData } from '../utils/testDataGenerator';
import { ThermostatOutlined } from '@mui/icons-material';

const ChartTestPage: React.FC = () => {
  const testData = generateTestData();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chart Test Page
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Temperature Chart Test
        </Typography>
        <SensorChart
          data={testData.temperature}
          title="Temperature"
          unit="°C"
          color="#EF4444"
          icon={<ThermostatOutlined />}
          loading={false}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Humidity Chart Test
        </Typography>
        <SensorChart
          data={testData.humidity}
          title="Humidity"
          unit="%"
          color="#3B82F6"
          loading={false}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          No Data Chart Test
        </Typography>
        <SensorChart
          data={[]}
          title="Empty Data"
          unit="units"
          color="#6B7280"
          loading={false}
        />
      </Paper>
    </Box>
  );
};

export default ChartTestPage;
