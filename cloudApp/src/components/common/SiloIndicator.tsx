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
    // Define the 4 color zones for realistic silo appearance (bottom to top)
  const siloColors = {
    bottom: '#376452',     // Forest Green (0-25%)
    second: '#428F2F',     // Leaf Green (25-50%) 
    third: '#4CB610',      // Bright Green (50-75%)
    top: '#50C800'         // Neon Green (75-100%)
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444'; // Red-500
    if (percentage >= 75) return '#F59E0B'; // Amber-500
    return '#10B981'; // Emerald-500
  };
  
  const statusColor = getStatusColor(clampedPercentage);
  // Calculate fill heights for each zone based on actual percentage
  const getZoneFills = (percentage: number) => {
    const zones = {
      bottom: { start: 0, end: 25 },
      second: { start: 25, end: 50 },
      third: { start: 50, end: 75 },
      top: { start: 75, end: 100 }
    };

    const fillHeights: { [key: string]: number } = {};
    
    Object.entries(zones).forEach(([zoneName, zone]) => {
      if (percentage <= zone.start) {
        fillHeights[zoneName] = 0;
      } else if (percentage >= zone.end) {
        fillHeights[zoneName] = 100;
      } else {
        // Calculate partial fill within this zone
        const zoneProgress = (percentage - zone.start) / (zone.end - zone.start);
        fillHeights[zoneName] = zoneProgress * 100;
      }
    });

    return fillHeights;
  };

  const zoneFills = getZoneFills(clampedPercentage);
  if (variant === 'minimal') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>        
        <Box
          sx={{
            width: width * 0.9,
            height: height * 0.85,
            position: 'relative',
            background: '#FAFAFA',
            borderRadius: '12px 12px 4px 4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Four stacked rectangles representing grain levels */}
          {/* Top zone (75-100%) - Bright Green with curved top */}
          <Box
            sx={{
              height: '25%',
              position: 'relative',
              borderRadius: '12px 12px 0 0',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#F0F0F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${zoneFills.top}%`,
                background: siloColors.top,
                transition: 'height 0.6s ease',
              }}
            />
          </Box>
          
          {/* Third zone (50-75%) - Leaf Green */}
          <Box
            sx={{
              height: '25%',
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#F0F0F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${zoneFills.third}%`,
                background: siloColors.third,
                transition: 'height 0.6s ease',
              }}
            />
          </Box>
          
          {/* Second zone (25-50%) - Forest Green */}
          <Box
            sx={{
              height: '25%',
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#F0F0F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${zoneFills.second}%`,
                background: siloColors.second,
                transition: 'height 0.6s ease',
              }}
            />
          </Box>
          
          {/* Bottom zone (0-25%) - Dark Green */}
          <Box
            sx={{
              height: '25%',
              position: 'relative',
              borderRadius: '0 0 4px 4px',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#F0F0F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${zoneFills.bottom}%`,
                background: siloColors.bottom,
                transition: 'height 0.6s ease',
              }}
            />
          </Box>
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }if (variant === 'detailed') {
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
          {/* Curved top for realistic silo appearance */}
          <Box
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
          
          {/* Main container with stacked zones */}          <Box
            sx={{
              width: '100%',
              height: height - 16,
              background: 'background.paper',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderRadius: '0 0 8px 8px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Four stacked rectangles representing grain levels */}
            
            {/* Top zone (75-100%) - Bright Green with curved top half */}
            <Box
              sx={{
                height: '25%',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '0 0 0 0',
                background: '#F0F0F0',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${zoneFills.top}%`,
                  background: siloColors.top,
                  transition: 'height 0.6s ease',
                }}
              />
            </Box>
            
            {/* Third zone (50-75%) - Leaf Green */}
            <Box
              sx={{
                height: '25%',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#F0F0F0',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${zoneFills.third}%`,
                  background: siloColors.third,
                  transition: 'height 0.6s ease',
                }}
              />
            </Box>
            
            {/* Second zone (25-50%) - Forest Green */}
            <Box
              sx={{
                height: '25%',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#F0F0F0',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${zoneFills.second}%`,
                  background: siloColors.second,
                  transition: 'height 0.6s ease',
                }}
              />
            </Box>
            
            {/* Bottom zone (0-25%) - Dark Green */}
            <Box
              sx={{
                height: '25%',
                position: 'relative',
                borderRadius: '0 0 6px 6px',
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#F0F0F0',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${zoneFills.bottom}%`,
                  background: siloColors.bottom,
                  transition: 'height 0.6s ease',
                }}
              />
            </Box>
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
  }  // Basic variant (default) - Clean minimal design with stacked colors
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
      {label && (
        <Typography variant="body2" fontWeight={500} textAlign="center" color="text.primary">
          {label}
        </Typography>
      )}
      
      <Box
        sx={{
          width,
          height,
          position: 'relative',
          background: 'background.paper',
          borderRadius: '8px 8px 6px 6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Four stacked rectangles representing grain levels */}
        
        {/* Top zone (75-100%) - Bright Green with curved top */}
        <Box
          sx={{
            height: '25%',
            position: 'relative',
            borderRadius: '8px 8px 0 0',
            border: '1px solid rgba(0,0,0,0.05)',
            background: '#F0F0F0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${zoneFills.top}%`,
              background: siloColors.top,
              transition: 'height 0.5s ease',
            }}
          />
        </Box>
        
        {/* Third zone (50-75%) - Leaf Green */}
        <Box
          sx={{
            height: '25%',
            position: 'relative',
            border: '1px solid rgba(0,0,0,0.05)',
            background: '#F0F0F0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${zoneFills.third}%`,
              background: siloColors.third,
              transition: 'height 0.5s ease',
            }}
          />
        </Box>
        
        {/* Second zone (25-50%) - Forest Green */}
        <Box
          sx={{
            height: '25%',
            position: 'relative',
            border: '1px solid rgba(0,0,0,0.05)',
            background: '#F0F0F0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${zoneFills.second}%`,
              background: siloColors.second,
              transition: 'height 0.5s ease',
            }}
          />
        </Box>
        
        {/* Bottom zone (0-25%) - Dark Green */}
        <Box
          sx={{
            height: '25%',
            position: 'relative',
            borderRadius: '0 0 4px 4px',
            border: '1px solid rgba(0,0,0,0.05)',
            background: '#F0F0F0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${zoneFills.bottom}%`,
              background: siloColors.bottom,
              transition: 'height 0.5s ease',
            }}
          />
        </Box>
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
