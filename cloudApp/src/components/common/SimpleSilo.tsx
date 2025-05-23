import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface SimpleSiloProps {
  fillPercentage: number; // 0-100
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  variant?: 'capsule' | 'square' | 'circle' | 'thin';
  color?: 'primary' | 'success' | 'info' | 'warning' | 'auto';
}

const SimpleSilo: React.FC<SimpleSiloProps> = ({
  fillPercentage,
  label,
  size = 'md',
  showPercentage = true,
  variant = 'capsule',
  color = 'auto'
}) => {
  const theme = useTheme();
  
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
  
  // Size configurations
  const sizeConfig = {
    xs: { width: 24, height: 48 },
    sm: { width: 32, height: 64 },
    md: { width: 40, height: 80 },
    lg: { width: 48, height: 96 }
  };

  const { width, height } = sizeConfig[size];

  // Color logic
  const getFillColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'success') return theme.palette.success.main;
    if (color === 'info') return theme.palette.info.main;
    if (color === 'warning') return theme.palette.warning.main;
    
    // Auto color based on percentage
    if (clampedPercentage >= 80) return theme.palette.success.main;
    if (clampedPercentage >= 60) return theme.palette.info.main;
    if (clampedPercentage >= 30) return theme.palette.warning.main;
    return theme.palette.error.light;
  };

  const fillColor = getFillColor();

  // Capsule variant - rounded ends
  if (variant === 'capsule') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            textAlign="center"
          >
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width,
            height,
            position: 'relative',
            backgroundColor: theme.palette.grey[100],
            borderRadius: width / 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.grey[200]}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedPercentage}%`,
              backgroundColor: fillColor,
              borderRadius: width / 2,
              transition: 'height 0.3s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography 
            variant="caption" 
            color="text.primary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            fontWeight={500}
          >
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Square variant
  if (variant === 'square') {
    const squareSize = Math.min(width, height * 0.8);
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            textAlign="center"
          >
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width: squareSize,
            height: squareSize,
            position: 'relative',
            backgroundColor: theme.palette.grey[50],
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedPercentage}%`,
              backgroundColor: fillColor,
              transition: 'height 0.3s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography 
            variant="caption" 
            color="text.primary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            fontWeight={500}
          >
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Circle variant
  if (variant === 'circle') {
    const circleSize = Math.min(width, height * 0.8);
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            textAlign="center"
          >
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width: circleSize,
            height: circleSize,
            position: 'relative',
            backgroundColor: theme.palette.grey[50],
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedPercentage}%`,
              backgroundColor: fillColor,
              borderRadius: '50%',
              transition: 'height 0.3s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography 
            variant="caption" 
            color="text.primary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            fontWeight={500}
          >
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Thin variant - very narrow
  if (variant === 'thin') {
    const thinWidth = width * 0.6;
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            textAlign="center"
          >
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width: thinWidth,
            height,
            position: 'relative',
            backgroundColor: theme.palette.grey[100],
            borderRadius: thinWidth / 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedPercentage}%`,
              backgroundColor: fillColor,
              borderRadius: thinWidth / 2,
              transition: 'height 0.3s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography 
            variant="caption" 
            color="text.primary" 
            fontSize={size === 'xs' ? '0.6rem' : '0.7rem'}
            fontWeight={500}
          >
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  return null;
};

export default SimpleSilo;
