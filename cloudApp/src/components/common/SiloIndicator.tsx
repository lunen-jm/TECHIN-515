import React from 'react';
import { Box, Typography } from '@mui/material';

interface SiloIndicatorProps {
  fillPercentage: number; // 0-100
  label?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  variant?: 'basic' | 'detailed' | 'minimal';
}

const SiloIndicator: React.FC<SiloIndicatorProps> = ({
  fillPercentage,
  label,
  height = 120,
  width = 60,
  showPercentage = true,
  variant = 'basic'
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
    // Get fill color based on percentage - minimal design
  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return '#3B82F6'; // Blue-500
    if (percentage >= 40) return '#6366F1'; // Indigo-500
    return '#8B5CF6'; // Violet-500
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444'; // Red-500
    if (percentage >= 75) return '#F59E0B'; // Amber-500
    return '#10B981'; // Emerald-500
  };
  const fillColor = getFillColor(clampedPercentage);
  const statusColor = getStatusColor(clampedPercentage);
  
  if (variant === 'minimal') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>        <Box
          sx={{
            width: width * 0.9,
            height: height * 0.85,
            position: 'relative',
            background: '#FAFAFA',
            borderRadius: '8px 8px 4px 4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Fill */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${clampedPercentage}%`,
              background: fillColor,
              borderRadius: '0 0 2px 2px',
              transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          
          {/* Subtle level lines */}
          {[25, 50, 75].map((level) => (
            <Box
              key={level}
              sx={{
                position: 'absolute',
                bottom: `${level}%`,
                left: '8px',
                right: '8px',
                height: '1px',
                background: '#E5E7EB',
                opacity: 0.4,
              }}
            />
          ))}
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }
  if (variant === 'detailed') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {label && (
          <Typography variant="body2" fontWeight={600} textAlign="center" color="text.primary">
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
          {/* Simplified top */}            <Box
            sx={{
              width: '100%',
              height: 16,
              background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
              borderRadius: '12px 12px 0 0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              zIndex: 2,
            }}
          />
          
          {/* Main container */}
          <Box            sx={{              width: '100%',
              height: height - 16,
              background: 'background.paper',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderRadius: '0 0 8px 8px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: (clampedPercentage / 100) * (height - 16),
                background: `linear-gradient(180deg, ${fillColor}DD, ${fillColor})`,
                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '0 0 6px 6px',
              }}
            />
            
            {/* Minimal level indicators */}
            {[25, 50, 75].map((level) => (
              <Box
                key={level}
                sx={{
                  position: 'absolute',
                  bottom: `${level}%`,
                  left: '12px',
                  right: '12px',
                  height: '1px',
                  background: '#E5E7EB',
                  opacity: 0.6,
                }}
              />
            ))}
          </Box>
        </Box>
        
        {showPercentage && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700} color={statusColor}>
              {Math.round(clampedPercentage)}%
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusColor,
              }}
            />
          </Box>
        )}
      </Box>
    );
  }
  // Basic variant (default) - Clean minimal design
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
      {label && (
        <Typography variant="body2" fontWeight={500} textAlign="center" color="text.primary">
          {label}
        </Typography>
      )}
      
      <Box
        sx={{          width,
          height,
          position: 'relative',
          background: 'background.paper',
          borderRadius: '8px 8px 6px 6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${clampedPercentage}%`,
            background: `linear-gradient(180deg, ${fillColor}DD, ${fillColor})`,
            borderRadius: '0 0 4px 4px',
            transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Subtle level lines */}
        {[25, 50, 75].map((level) => (
          <Box
            key={level}
            sx={{
              position: 'absolute',
              bottom: `${level}%`,
              left: '8px',
              right: '8px',
              height: '1px',
              background: '#E5E7EB',
              opacity: 0.4,
            }}
          />
        ))}
      </Box>
      
      {showPercentage && (
        <Typography variant="body2" fontWeight={600} color={statusColor}>
          {Math.round(clampedPercentage)}%
        </Typography>
      )}
    </Box>
  );
};

export default SiloIndicator;
