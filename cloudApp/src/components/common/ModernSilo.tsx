import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

const waveAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const bubbleFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

interface ModernSiloProps {
  fillPercentage: number; // 0-100
  label?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  animated?: boolean;
  capacity?: string; // e.g., "500 tons"
}

const ModernSilo: React.FC<ModernSiloProps> = ({
  fillPercentage,
    label,
  height = 140,
  width = 70,
  showPercentage = true,
  animated = true,
  capacity
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
  
  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return '#1976D2'; // Blue for high
    if (percentage >= 40) return '#42A5F5'; // Medium blue
    return '#90CAF9'; // Light blue for low
  };

  const getStatusInfo = (percentage: number) => {
    if (percentage >= 95) return { color: '#D32F2F', text: 'FULL', bg: '#FFEBEE' };
    if (percentage >= 85) return { color: '#F57C00', text: 'HIGH', bg: '#FFF3E0' };
    if (percentage >= 50) return { color: '#388E3C', text: 'GOOD', bg: '#E8F5E8' };
    if (percentage >= 25) return { color: '#FFA726', text: 'LOW', bg: '#FFF8E1' };
    return { color: '#D32F2F', text: 'CRITICAL', bg: '#FFEBEE' };
  };

  const fillColor = getFillColor(clampedPercentage);
  const statusInfo = getStatusInfo(clampedPercentage);
  const fillHeight = (clampedPercentage / 100) * (height - 30); // Account for dome and base

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      gap={1}
      sx={{
        p: 2,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        }
      }}
    >
      {label && (
        <Typography variant="subtitle2" fontWeight={600} textAlign="center" color="text.primary">
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
        {/* Support legs */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            left: '20%',
            right: '20%',
            height: 8,
            background: '#757575',
            borderRadius: '0 0 4px 4px',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -4,
              right: -4,
              bottom: -2,
              height: 3,
              background: '#616161',
              borderRadius: 2,
            }
          }}
        />
        
        {/* Cone top */}
        <Box
          sx={{
            width: '100%',
            height: 25,
            background: 'linear-gradient(to bottom, #bdbdbd, #9e9e9e)',
            clipPath: 'polygon(20% 100%, 50% 0%, 80% 100%)',
            position: 'relative',
            zIndex: 2,
          }}
        />
        
        {/* Main cylinder */}
        <Box
          sx={{
            width: '100%',
            height: height - 30,
            background: 'linear-gradient(to right, #fafafa, #f0f0f0, #fafafa)',
            border: '2px solid #9e9e9e',
            borderTop: 'none',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '0 0 4px 4px',
          }}
        >
          {/* Fill with gradient and animation */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: fillHeight,
              background: `linear-gradient(to top, ${fillColor}, ${fillColor}CC, ${fillColor}AA)`,
              transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
          >
            {/* Animated surface waves */}
            {animated && clampedPercentage > 5 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, transparent, ${fillColor}FF, transparent)`,
                  animation: `${waveAnimation} 3s ease-in-out infinite`,
                }}
              />
            )}
            
            {/* Floating particles/bubbles */}
            {animated && clampedPercentage > 20 && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '30%',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.6)',
                    animation: `${bubbleFloat} 2s ease-in-out infinite`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '60%',
                    right: '25%',
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.4)',
                    animation: `${bubbleFloat} 2.5s ease-in-out infinite 0.5s`,
                  }}
                />
              </>
            )}
          </Box>
          
          {/* Level markers */}
          {[25, 50, 75].map((level) => (
            <Box
              key={level}
              sx={{
                position: 'absolute',
                bottom: `${level}%`,
                left: 4,
                right: 4,
                height: '1px',
                background: 'rgba(0,0,0,0.2)',
                '&::after': {
                  content: `"${level}%"`,
                  position: 'absolute',
                  right: -25,
                  top: -6,
                  fontSize: '8px',
                  color: 'rgba(0,0,0,0.6)',
                  background: 'rgba(255,255,255,0.8)',
                  padding: '1px 3px',
                  borderRadius: 2,
                }
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Status and percentage display */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        {showPercentage && (
          <Typography variant="h6" fontWeight={700} color={statusInfo.color}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
        
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            background: statusInfo.bg,
            border: `1px solid ${statusInfo.color}40`,
          }}
        >
          <Typography variant="caption" fontWeight={600} color={statusInfo.color}>
            {statusInfo.text}
          </Typography>
        </Box>
        
        {capacity && (
          <Typography variant="caption" color="text.secondary">
            {capacity}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ModernSilo;
