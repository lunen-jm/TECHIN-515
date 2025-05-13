import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Box, CircularProgress } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  stats: string | number;
  description: string;
  icon: SvgIconComponent;
  onClick: () => void;
  loading?: boolean;
  timestamp?: Date;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  stats,
  description,
  icon: Icon,
  onClick,
  loading = false,
  timestamp,
}) => {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

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
          {loading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Typography variant="h4" color="primary" gutterBottom>
                {stats}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {description}
              </Typography>
              {timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Updated: {formatTimestamp(timestamp)}
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DashboardCard;