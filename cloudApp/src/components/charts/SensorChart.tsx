import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface DataPoint {
  timestamp: Date | any;
  value: number;
}

interface SensorChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color: string;
  icon?: React.ReactNode;
  loading?: boolean;
  height?: number;
}

const SensorChart: React.FC<SensorChartProps> = ({
  data,
  title,
  unit,
  color,
  icon,
  loading = false,
  height = 300
}) => {  // Use only real data from Firebase
  const displayData = data || [];
  
  // Format data for Recharts
  const chartData = displayData.map((point) => {
    const timestamp = point.timestamp?.toDate ? point.timestamp.toDate() : new Date(point.timestamp);
    return {
      time: timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullTime: timestamp.toLocaleString(),
      value: Math.round(point.value * 100) / 100, // Round to 2 decimal places
    };
  }).reverse(); // Reverse to show oldest first (left to right)

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {data.fullTime}
          </Typography>
          <Typography variant="body1" fontWeight="600" color={color}>
            {payload[0].value} {unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };  if (loading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'text.secondary'
        }}
      >
        {icon && <Box sx={{ mb: 1, opacity: 0.5 }}>{icon}</Box>}
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No {title.toLowerCase()} readings found for this device
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon && <Box sx={{ mr: 1, color }}>{icon}</Box>}
        <Typography variant="h6" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({data.length} readings)
        </Typography>
      </Box>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tick={{ fill: '#666' }}
            label={{ 
              value: unit, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#666', fontSize: '12px' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
            name={`${title} (${unit})`}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Summary stats */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Latest
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {chartData[chartData.length - 1]?.value} {unit}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Average
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {Math.round((chartData.reduce((sum, point) => sum + point.value, 0) / chartData.length) * 100) / 100} {unit}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Range
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {Math.min(...chartData.map(p => p.value))} - {Math.max(...chartData.map(p => p.value))} {unit}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SensorChart;
