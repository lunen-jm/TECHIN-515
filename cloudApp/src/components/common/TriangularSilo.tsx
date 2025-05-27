import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface TriangularSiloProps {
  fillPercentage: number; // 0-100
  label?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  variant?: 'pointed' | 'curved' | 'steep' | 'gentle' | 'modern' | 'detailed' | 'minimal' | 'outlined';
}

const TriangularSilo: React.FC<TriangularSiloProps> = ({
  fillPercentage,
  label,
  height = 100,
  width = 50,
  showPercentage = true,
  variant = 'pointed'
}) => {
  const theme = useTheme();
  
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
  
  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return theme.palette.primary.main;
    if (percentage >= 40) return theme.palette.info.light;
    return theme.palette.grey[400];
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const fillColor = getFillColor(clampedPercentage);
  const statusColor = getStatusColor(clampedPercentage);
  
  // Calculate fill height for the cylindrical part
  const topHeight = height * 0.25; // Top triangle takes 25% of height
  const cylinderHeight = height - topHeight;
  const fillHeight = (clampedPercentage / 100) * cylinderHeight;

  // Pointed variant - sharp triangle with tiny rounded tip
  if (variant === 'pointed') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sharp triangular top with small rounded tip */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              clipPath: 'polygon(30% 100%, 50% 5%, 70% 100%)',
              background: 'linear-gradient(to bottom, #e0e0e0, #bdbdbd)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#9e9e9e',
              }
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#f5f5f5',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Curved variant - triangular with more rounded tip
  if (variant === 'curved') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Triangular top with curved tip */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              background: 'linear-gradient(to bottom, #e0e0e0, #bdbdbd)',
              clipPath: 'polygon(25% 100%, 45% 20%, 50% 0%, 55% 20%, 75% 100%)',
              borderRadius: '50% 50% 0 0',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#f5f5f5',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}DD)`,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Steep variant - very sharp angle
  if (variant === 'steep') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Very steep triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              background: 'linear-gradient(to bottom, #e8eaf6, #c5cae9)',
              clipPath: 'polygon(35% 100%, 48% 15%, 50% 8%, 52% 15%, 65% 100%)',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#fafafa',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Gentle variant - wider triangle with soft curve
  if (variant === 'gentle') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Gentle triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              background: 'linear-gradient(to bottom, #f3e5f5, #e1bee7)',
              clipPath: 'polygon(20% 100%, 40% 40%, 50% 20%, 60% 40%, 80% 100%)',
              borderRadius: '20% 20% 0 0',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#fafafa',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}CC)`,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Modern variant - clean triangular with minimal styling
  if (variant === 'modern') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modern triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              background: theme.palette.grey[200],
              clipPath: 'polygon(28% 100%, 47% 25%, 50% 12%, 53% 25%, 72% 100%)',
              borderRadius: '8px 8px 0 0',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: theme.palette.grey[50],
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
                borderRadius: '0 0 2px 2px',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Detailed variant - with drop shadows and more pronounced features
  if (variant === 'detailed') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: '#9e9e9e',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#f5f5f5',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Minimal variant - simple and clean design
  if (variant === 'minimal') {
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: '#e0e0e0',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: '#f5f5f5',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Outlined variant - with only outlines and shadows
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Triangular top */}
          <Box
            sx={{
              width: '100%',
              height: topHeight,
              position: 'relative',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: 'transparent',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: cylinderHeight,
              background: 'transparent',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Simple variant (default)
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Triangular top */}
        <Box
          sx={{
            width: '100%',
            height: topHeight,
            position: 'relative',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            background: `${theme.palette.grey[300]}`,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          }}
        />
        
        {/* Main cylinder */}
        <Box
          sx={{
            width: '100%',
            height: cylinderHeight,
            background: theme.palette.grey[100],
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Fill */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: fillHeight,
              background: fillColor,
              transition: 'height 0.4s ease-out',
            }}
          />
        </Box>
      </Box>
      
      {showPercentage && (
        <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={500}>
          {Math.round(clampedPercentage)}%
        </Typography>
      )}
    </Box>
  );
};

export default TriangularSilo;
