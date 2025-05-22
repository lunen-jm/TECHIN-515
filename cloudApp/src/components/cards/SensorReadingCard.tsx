import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box,
  Divider,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Info as InfoIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface SensorReadingCardProps {
  title: string;
  value: string;
  data: { timestamp: Date; value: number }[];
  icon: React.ReactNode;
  color: string;
  unit: string;
  timestamp: Date;
  description: string;
  onClick: () => void;
  percentValue?: number; // Percentage for progress bar
  sensorType?: 'temperature' | 'humidity' | 'co2' | 'lidar' | 'outdoorTemp';
  rawValue?: number; // The numeric value without unit for calculations
}

// Enhanced sparkline component with dots at each data point
const Sparkline = styled('div')<{ data: number[], color: string, height: number }>(
  ({ data, color, height }) => {
    // Normalize data to fit in our display area
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid division by zero
    
    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x}% ${y}%`;
    }).join(', ');
    
    return {
      height: `${height}px`,
      position: 'relative',
      marginTop: '8px',
      marginBottom: '8px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: `${color}10`, // 10% opacity of the main color
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        backgroundImage: `linear-gradient(to right, ${color}00, ${color}20)`,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `radial-gradient(circle at ${points}, ${color} 3px, transparent 3px)`,
        maskImage: 'linear-gradient(to right, transparent, black)',
      }
    };
  }
);

const SensorReadingCard: React.FC<SensorReadingCardProps> = ({ 
  title, 
  value, 
  data, 
  icon, 
  color,
  unit,
  timestamp,
  description,
  onClick,
  percentValue,
  sensorType = 'temperature',
  rawValue
}) => {
  const theme = useTheme();
  // Extract just the values for the sparkline
  const values = data.map(item => item.value);

  // Format the timestamp in a more readable way
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  // Determine status based on sensor type and value
  const getStatusColor = (type: string, value: number | undefined) => {
    if (value === undefined) return theme.palette.statusColors.neutral;
    
    switch(type) {
      case 'temperature':
        if (value < 10) return theme.palette.statusColors.critical;
        if (value > 30) return theme.palette.statusColors.critical;
        if (value < 15 || value > 25) return theme.palette.statusColors.warning;
        return theme.palette.statusColors.optimal;
      
      case 'humidity':
        if (value < 30) return theme.palette.statusColors.critical;
        if (value > 80) return theme.palette.statusColors.critical;
        if (value < 40 || value > 70) return theme.palette.statusColors.warning;
        return theme.palette.statusColors.optimal;
        
      case 'co2':
        if (value > 1000) return theme.palette.statusColors.critical;
        if (value > 800) return theme.palette.statusColors.warning;
        return theme.palette.statusColors.optimal;
        
      case 'lidar':
        if (value < 50) return theme.palette.statusColors.fillLow;
        if (value < 150) return theme.palette.statusColors.fillMedium;
        return theme.palette.statusColors.fillHigh;
        
      case 'outdoorTemp':
        // Less stringent thresholds for outdoor temperature
        if (value < 0) return theme.palette.statusColors.critical;
        if (value > 35) return theme.palette.statusColors.critical;
        if (value < 5 || value > 30) return theme.palette.statusColors.warning;
        return theme.palette.statusColors.optimal;
        
      default:
        return theme.palette.statusColors.neutral;
    }
  };

  // Get tooltip text based on sensor type and value
  const getTooltipText = (type: string, value: number | undefined) => {
    if (value === undefined) return 'No data available';
    
    switch(type) {
      case 'temperature':
        if (value < 10) return 'Critical: Temperature too low';
        if (value > 30) return 'Critical: Temperature too high';
        if (value < 15) return 'Warning: Temperature slightly low';
        if (value > 25) return 'Warning: Temperature slightly high';
        return 'Optimal temperature range';
      
      case 'humidity':
        if (value < 30) return 'Critical: Humidity too low';
        if (value > 80) return 'Critical: Humidity too high';
        if (value < 40) return 'Warning: Humidity slightly low';
        if (value > 70) return 'Warning: Humidity slightly high';
        return 'Optimal humidity range';
        
      case 'co2':
        if (value > 1000) return 'Critical: CO₂ levels too high';
        if (value > 800) return 'Warning: CO₂ levels elevated';
        return 'Optimal CO₂ levels';
        
      case 'lidar':
        const fillPercent = value < 300 ? Math.round((300 - value) / 3) : 0; // Assuming 0-300cm range is 0-100%
        if (fillPercent < 30) return `Low fill level (${fillPercent}%)`;
        if (fillPercent < 70) return `Medium fill level (${fillPercent}%)`;
        return `High fill level (${fillPercent}%)`;
      
      case 'outdoorTemp':
        if (value < 0) return 'Very cold outdoor conditions';
        if (value > 35) return 'Very hot outdoor conditions';
        if (value < 5) return 'Cold outdoor conditions';
        if (value > 30) return 'Hot outdoor conditions';
        return 'Moderate outdoor temperature';
        
      default:
        return `Value: ${value}`;
    }
  };

  // Get status icon based on value
  const getStatusIcon = (type: string, value: number | undefined) => {
    if (value === undefined) return <InfoIcon fontSize="small" />;
    
    // For lidar, different logic applies
    if (type === 'lidar') {
      const fillPercent = value < 300 ? Math.round((300 - value) / 3) : 0;
      return <InfoIcon fontSize="small" />;
    }
    
    switch(type) {
      case 'temperature':
      case 'humidity':
      case 'co2':
      case 'outdoorTemp':
        if ((type === 'temperature' && (value < 10 || value > 30)) || 
            (type === 'humidity' && (value < 30 || value > 80)) ||
            (type === 'co2' && value > 1000) ||
            (type === 'outdoorTemp' && (value < 0 || value > 35))) {
          return <ErrorIcon fontSize="small" color="error" />;
        }
        if ((type === 'temperature' && (value < 15 || value > 25)) || 
            (type === 'humidity' && (value < 40 || value > 70)) ||
            (type === 'co2' && value > 800) ||
            (type === 'outdoorTemp' && (value < 5 || value > 30))) {
          return <WarningIcon fontSize="small" color="warning" />;
        }
        return <CheckIcon fontSize="small" color="success" />;
      
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // Calculate fill level percentage for LiDAR
  const calculateFillLevel = (type: string, value: number | undefined) => {
    if (type === 'lidar' && value !== undefined) {
      return Math.min(100, Math.max(0, Math.round((300 - value) / 3))); // Assuming 0-300cm range
    }
    return undefined;
  };

  // Determine the actual color to use (either the statusColor or the provided color)
  const statusColor = rawValue !== undefined ? getStatusColor(sensorType, rawValue) : color;
  const calculatedFillLevel = sensorType === 'lidar' && rawValue !== undefined ? 
    calculateFillLevel(sensorType, rawValue) : percentValue;

  return (
    <Card 
      elevation={1}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
        },
        bgcolor: 'background.paper'
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={rawValue !== undefined ? getTooltipText(sensorType, rawValue) : ''} arrow>
                <Box sx={{ 
                  mr: 1.5, 
                  color: 'white', 
                  bgcolor: statusColor,
                  p: 1, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40
                }}>
                  {icon}
                </Box>
              </Tooltip>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
                {rawValue !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    {getStatusIcon(sensorType, rawValue)}
                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500, color: statusColor }}>
                      {getTooltipText(sensorType, rawValue).split(':')[0]}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: statusColor
                }}
              >
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unit}
              </Typography>
            </Box>
          </Box>
          
          {calculatedFillLevel !== undefined && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  {sensorType === 'lidar' ? 'Fill Level' : 'Current Level'}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {calculatedFillLevel}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculatedFillLevel} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: `${statusColor}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: statusColor,
                  }
                }} 
              />
            </Box>
          )}
          
          <Tooltip title="View detailed data" arrow>
            <Sparkline data={values} color={statusColor} height={50} />
          </Tooltip>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {description}
            </Typography>
            <Box sx={{ 
              bgcolor: 'background.default', 
              p: 0.75, 
              px: 1.5, 
              borderRadius: 10,
              border: '1px solid',
              borderColor: 'divider' 
            }}>
              <Typography variant="caption" color="text.secondary">
                {formattedTime}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SensorReadingCard;