import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  stats: string | number;
  description: string;
  icon: SvgIconComponent;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  stats,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <Card sx={{ minWidth: 275, maxWidth: 345, m: 2 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Icon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" component="div">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" color="primary" gutterBottom>
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