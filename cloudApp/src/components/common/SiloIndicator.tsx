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

  // Calculate which zones should be visible based on fill percentage
  const getVisibleZones = (percentage: number) => {
    return {
      bottom: percentage > 0,
      second: percentage > 25,
      third: percentage > 50,
      top: percentage > 75
    };
  };

  const visibleZones = getVisibleZones(clampedPercentage);
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
              background: visibleZones.top ? siloColors.top : 'transparent',
              borderRadius: '12px 12px 0 0',
              opacity: visibleZones.top ? 1 : 0.1,
              transition: 'opacity 0.6s ease',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />
          
          {/* Third zone (50-75%) - Leaf Green */}
          <Box
            sx={{
              height: '25%',
              background: visibleZones.third ? siloColors.third : 'transparent',
              opacity: visibleZones.third ? 1 : 0.1,
              transition: 'opacity 0.6s ease',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />
          
          {/* Second zone (25-50%) - Forest Green */}
          <Box
            sx={{
              height: '25%',
              background: visibleZones.second ? siloColors.second : 'transparent',
              opacity: visibleZones.second ? 1 : 0.1,
              transition: 'opacity 0.6s ease',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />
          
          {/* Bottom zone (0-25%) - Dark Green */}
          <Box
            sx={{
              height: '25%',
              background: visibleZones.bottom ? siloColors.bottom : 'transparent',
              borderRadius: '0 0 4px 4px',
              opacity: visibleZones.bottom ? 1 : 0.1,
              transition: 'opacity 0.6s ease',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />
        </Box>
        
        {showPercentage && (
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {Math.round(clampedPercentage)}%
          </Typography>
        )}
      </Box>
    );
  }  if (variant === 'detailed') {
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
          
          {/* Main container with stacked zones */}
          <Box
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
                background: visibleZones.top ? siloColors.top : 'transparent',
                opacity: visibleZones.top ? 1 : 0.1,
                transition: 'opacity 0.6s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '0 0 0 0', // No radius since it's connected to the curved top
              }}
            />
            
            {/* Third zone (50-75%) - Leaf Green */}
            <Box
              sx={{
                height: '25%',
                background: visibleZones.third ? siloColors.third : 'transparent',
                opacity: visibleZones.third ? 1 : 0.1,
                transition: 'opacity 0.6s ease',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            />
            
            {/* Second zone (25-50%) - Forest Green */}
            <Box
              sx={{
                height: '25%',
                background: visibleZones.second ? siloColors.second : 'transparent',
                opacity: visibleZones.second ? 1 : 0.1,
                transition: 'opacity 0.6s ease',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            />
            
            {/* Bottom zone (0-25%) - Dark Green */}
            <Box
              sx={{
                height: '25%',
                background: visibleZones.bottom ? siloColors.bottom : 'transparent',
                borderRadius: '0 0 6px 6px',
                opacity: visibleZones.bottom ? 1 : 0.1,
                transition: 'opacity 0.6s ease',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            />
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
            background: visibleZones.top ? siloColors.top : 'transparent',
            borderRadius: '8px 8px 0 0',
            opacity: visibleZones.top ? 1 : 0.1,
            transition: 'opacity 0.5s ease',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        />
        
        {/* Third zone (50-75%) - Leaf Green */}
        <Box
          sx={{
            height: '25%',
            background: visibleZones.third ? siloColors.third : 'transparent',
            opacity: visibleZones.third ? 1 : 0.1,
            transition: 'opacity 0.5s ease',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        />
        
        {/* Second zone (25-50%) - Forest Green */}
        <Box
          sx={{
            height: '25%',
            background: visibleZones.second ? siloColors.second : 'transparent',
            opacity: visibleZones.second ? 1 : 0.1,
            transition: 'opacity 0.5s ease',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        />
        
        {/* Bottom zone (0-25%) - Dark Green */}
        <Box
          sx={{
            height: '25%',
            background: visibleZones.bottom ? siloColors.bottom : 'transparent',
            borderRadius: '0 0 4px 4px',
            opacity: visibleZones.bottom ? 1 : 0.1,
            transition: 'opacity 0.5s ease',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        />
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
