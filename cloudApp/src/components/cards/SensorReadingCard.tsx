import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

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
}

// Simple sparkline component for showing reading trends
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
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        backgroundImage: `linear-gradient(to right, ${color}00, ${color}40)`,
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
  onClick 
}) => {
  // Extract just the values for the sparkline
  const values = data.map(item => item.value);

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                mr: 1.5, 
                color: 'white', 
                bgcolor: color, 
                p: 0.5, 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32
              }}>
                {icon}
              </Box>
              <Typography variant="h6">
                {title}
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color
              }}
            >
              {value}
            </Typography>
          </Box>
          
          <Tooltip title="View detailed data" arrow>
            <Sparkline data={values} color={color} height={40} />
          </Tooltip>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {timestamp.toLocaleTimeString()}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SensorReadingCard;