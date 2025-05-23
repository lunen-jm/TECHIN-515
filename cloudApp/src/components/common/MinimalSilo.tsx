import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface MinimalSiloProps {
  fillPercentage: number; // 0-100
  label?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  variant?: 'clean' | 'rounded' | 'flat' | 'outlined';
}

const MinimalSilo: React.FC<MinimalSiloProps> = ({
  fillPercentage,
  label,
  height = 80,
  width = 40,
  showPercentage = true,
  variant = 'clean'
}) => {
  const theme = useTheme();
  
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
  
  // Very simple color logic
  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return theme.palette.primary.main;
    if (percentage >= 40) return theme.palette.info.light;
    return theme.palette.grey[300];
  };

  const fillColor = getFillColor(clampedPercentage);

  // Clean variant - simple rectangle with rounded top
  if (variant === 'clean') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width,
            height,
            position: 'relative',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px 12px 4px 4px',
            border: '1px solid #e9ecef',
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
              borderRadius: '8px 8px 2px 2px',
              transition: 'height 0.4s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.primary" fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Rounded variant - pill shape
  if (variant === 'rounded') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width,
            height,
            position: 'relative',
            backgroundColor: '#f1f3f4',
            borderRadius: width / 2,
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
              borderRadius: width / 2,
              transition: 'height 0.4s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.primary" fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Flat variant - simple rectangle
  if (variant === 'flat') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width,
            height,
            position: 'relative',
            backgroundColor: '#f5f5f5',
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
              transition: 'height 0.4s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.primary" fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Outlined variant - just borders
  if (variant === 'outlined') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {label && (
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            {label}
          </Typography>
        )}
        
        <Box
          sx={{
            width,
            height,
            position: 'relative',
            border: '2px solid #e0e0e0',
            borderRadius: '8px 8px 2px 2px',
            overflow: 'hidden',
            backgroundColor: 'transparent',
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
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.4s ease-out',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.primary" fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  return null;
};

export default MinimalSilo;
