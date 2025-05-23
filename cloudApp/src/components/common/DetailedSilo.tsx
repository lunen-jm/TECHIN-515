import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface DetailedSiloProps {
  fillPercentage: number; // 0-100
  label?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  variant?: 'industrial' | 'classic' | 'modern' | 'vintage' | 'technical';
  capacity?: string;
}

const DetailedSilo: React.FC<DetailedSiloProps> = ({
  fillPercentage,
  label,
  height = 120,
  width = 60,
  showPercentage = true,
  variant = 'industrial',
  capacity
}) => {
  const theme = useTheme();
  
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
  
  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return theme.palette.statusColors?.fillHigh || '#2196F3';
    if (percentage >= 40) return theme.palette.statusColors?.fillMedium || '#90CAF9';
    return theme.palette.statusColors?.fillLow || '#BBDEFB';
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.statusColors?.critical || '#EF5350';
    if (percentage >= 75) return theme.palette.statusColors?.warning || '#FFA726';
    return theme.palette.statusColors?.optimal || '#4CAF50';
  };

  const fillColor = getFillColor(clampedPercentage);
  const statusColor = getStatusColor(clampedPercentage);
  const fillHeight = (clampedPercentage / 100) * (height - 25);

  // Industrial variant - heavy-duty look with supports
  if (variant === 'industrial') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
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
          {/* Industrial cone top */}
          <Box
            sx={{
              width: '100%',
              height: 25,
              background: 'linear-gradient(to bottom, #757575, #616161)',
              clipPath: 'polygon(20% 100%, 35% 40%, 50% 10%, 65% 40%, 80% 100%)',
              position: 'relative',
              zIndex: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '15%',
                right: '15%',
                height: '2px',
                background: '#424242',
              }
            }}
          />
          
          {/* Main cylinder with industrial details */}
          <Box
            sx={{
              width: '100%',
              height: height - 25,
              background: 'linear-gradient(to right, #fafafa, #f0f0f0, #fafafa)',
              border: '2px solid #757575',
              borderTop: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '10%',
                right: '10%',
                top: '20%',
                height: '1px',
                background: '#bdbdbd',
                zIndex: 2,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: '10%',
                right: '10%',
                top: '60%',
                height: '1px',
                background: '#bdbdbd',
                zIndex: 2,
              }
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
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}DD, ${fillColor}AA)`,
                transition: 'height 0.6s ease-in-out',
              }}
            />
            
            {/* Level indicators */}
            {[25, 50, 75].map((level) => (
              <Box
                key={level}
                sx={{
                  position: 'absolute',
                  bottom: `${level}%`,
                  left: 2,
                  right: 2,
                  height: '1px',
                  background: '#9e9e9e',
                  opacity: 0.7,
                  '&::after': {
                    content: `"${level}%"`,
                    position: 'absolute',
                    right: -20,
                    top: -6,
                    fontSize: '7px',
                    color: '#666',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '1px 2px',
                    borderRadius: 1,
                  }
                }}
              />
            ))}
          </Box>
          
          {/* Support legs */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -8,
              left: '15%',
              width: '8%',
              height: 10,
              background: '#757575',
              borderRadius: '0 0 2px 2px',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -8,
              right: '15%',
              width: '8%',
              height: 10,
              background: '#757575',
              borderRadius: '0 0 2px 2px',
            }}
          />
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          {showPercentage && (
            <Typography variant="body2" fontWeight={700} color={statusColor}>
              {Math.round(clampedPercentage)}%
            </Typography>
          )}
          {capacity && (
            <Typography variant="caption" color="text.secondary">
              {capacity}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Classic variant - traditional grain silo look
  if (variant === 'classic') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {label && (
          <Typography variant="body2" fontWeight={500} textAlign="center">
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
          {/* Classic dome top */}
          <Box
            sx={{
              width: '100%',
              height: 22,
              background: 'linear-gradient(to bottom, #e8eaf6, #c5cae9)',
              borderRadius: '50% 50% 0 0',
              border: '2px solid #9c27b0',
              borderBottom: 'none',
              position: 'relative',
              zIndex: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '70%',
                left: '20%',
                right: '20%',
                height: '2px',
                background: '#7b1fa2',
                borderRadius: 1,
              }
            }}
          />
          
          {/* Main cylinder with bands */}
          <Box
            sx={{
              width: '100%',
              height: height - 22,
              background: '#f8f9fa',
              border: '2px solid #9c27b0',
              borderTop: 'none',
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
                height: fillHeight,
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}DD, ${fillColor}BB)`,
                transition: 'height 0.5s ease-in-out',
              }}
            />
            
            {/* Horizontal bands */}
            {[20, 40, 60, 80].map((level) => (
              <Box
                key={level}
                sx={{
                  position: 'absolute',
                  bottom: `${level}%`,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#9c27b0',
                  opacity: 0.3,
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {showPercentage && (
            <Typography variant="body2" fontWeight={600} color={statusColor}>
              {Math.round(clampedPercentage)}%
            </Typography>
          )}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              border: '1px solid white',
            }}
          />
        </Box>
      </Box>
    );
  }

  // Modern variant - sleek contemporary design
  if (variant === 'modern') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {label && (
          <Typography variant="body2" fontWeight={500} textAlign="center">
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
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          {/* Modern flat top */}
          <Box
            sx={{
              width: '100%',
              height: 18,
              background: 'linear-gradient(135deg, #263238, #37474f)',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              zIndex: 2,
            }}
          />
          
          {/* Main cylinder */}
          <Box
            sx={{
              width: '100%',
              height: height - 18,
              background: 'linear-gradient(to right, #ffffff, #f5f5f5)',
              border: '1px solid #e0e0e0',
              borderTop: 'none',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0 0 4px 4px',
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
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}E6)`,
                transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '0 0 2px 2px',
              }}
            />
            
            {/* Minimal level indicators */}
            {[50].map((level) => (
              <Box
                key={level}
                sx={{
                  position: 'absolute',
                  bottom: `${level}%`,
                  left: 4,
                  right: 4,
                  height: '1px',
                  background: 'rgba(0,0,0,0.1)',
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={600}>
          {showPercentage && `${Math.round(clampedPercentage)}%`}
        </Typography>
      </Box>
    );
  }

  // Vintage variant - old-style grain elevator
  if (variant === 'vintage') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {label && (
          <Typography variant="body2" fontWeight={500} textAlign="center" sx={{ fontFamily: 'serif' }}>
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
          {/* Vintage peaked roof */}
          <Box
            sx={{
              width: '100%',
              height: 24,
              background: 'linear-gradient(to bottom, #8d6e63, #6d4c41)',
              clipPath: 'polygon(15% 100%, 25% 60%, 50% 20%, 75% 60%, 85% 100%)',
              position: 'relative',
              zIndex: 2,
            }}
          />
          
          {/* Main cylinder with wood texture effect */}
          <Box
            sx={{
              width: '100%',
              height: height - 24,
              background: 'linear-gradient(to right, #f3e5ab, #ede7b1, #f3e5ab)',
              border: '2px solid #8d6e63',
              borderTop: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                top: '33%',
                height: '2px',
                background: '#8d6e63',
                opacity: 0.5,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                top: '66%',
                height: '2px',
                background: '#8d6e63',
                opacity: 0.5,
              }
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
                transition: 'height 0.5s ease-in-out',
              }}
            />
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {showPercentage && (
            <Typography variant="body2" fontWeight={600} color={statusColor} sx={{ fontFamily: 'serif' }}>
              {Math.round(clampedPercentage)}%
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Technical variant - engineering/blueprint style
  if (variant === 'technical') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {label && (
          <Typography variant="body2" fontWeight={500} textAlign="center" sx={{ fontFamily: 'monospace' }}>
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
          {/* Technical flat top with details */}
          <Box
            sx={{
              width: '100%',
              height: 20,
              background: '#37474f',
              border: '1px solid #263238',
              position: 'relative',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '25%',
                right: '25%',
                top: '50%',
                height: '1px',
                background: '#90a4ae',
              }
            }}
          />
          
          {/* Main cylinder with technical markings */}
          <Box
            sx={{
              width: '100%',
              height: height - 20,
              background: '#fafafa',
              border: '1px solid #263238',
              borderTop: 'none',
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
                height: fillHeight,
                background: fillColor,
                transition: 'height 0.4s ease-out',
              }}
            />
            
            {/* Technical measurement lines */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((level) => (
              <Box
                key={level}
                sx={{
                  position: 'absolute',
                  bottom: `${level}%`,
                  left: level % 20 === 0 ? 0 : 2,
                  width: level % 20 === 0 ? '100%' : '30%',
                  height: '1px',
                  background: level % 20 === 0 ? '#263238' : '#90a4ae',
                  opacity: 0.6,
                  '&::after': level % 20 === 0 ? {
                    content: `"${level}"`,
                    position: 'absolute',
                    right: -15,
                    top: -6,
                    fontSize: '6px',
                    color: '#263238',
                    fontFamily: 'monospace',
                  } : {},
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Typography variant="caption" color={statusColor} fontSize="0.7rem" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          {showPercentage && `${Math.round(clampedPercentage)}%`}
        </Typography>
      </Box>
    );
  }

  return null;
};

export default DetailedSilo;
