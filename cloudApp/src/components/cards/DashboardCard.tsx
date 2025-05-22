import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  stats: string | number;
  description: string;
  icon: SvgIconComponent;
  onClick: () => void;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  stats,
  description,
  icon: Icon,
  onClick,
  color = 'primary.main',
}) => {
  return (
    <Card 
      elevation={1} 
      sx={{ 
        minWidth: 275, 
        maxWidth: 345, 
        m: 2, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        },
        bgcolor: 'background.paper'
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box 
              sx={{ 
                bgcolor: `${color}10`, // 10% opacity of the main color
                borderRadius: 2,
                p: 1.5,
                mr: 2
              }}
            >
              <Icon sx={{ fontSize: 32, color: color }} />
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: color, fontWeight: 700, mb: 1 }}>
            {stats}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DashboardCard;