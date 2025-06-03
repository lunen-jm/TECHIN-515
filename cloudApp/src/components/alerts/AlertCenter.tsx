import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Badge,
  Paper,
  Tooltip,
  CircularProgress,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Dangerous as DangerousIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Alert, AlertSeverity, AlertStatus, AlertStats } from '../../types/alerts';
import { AlertService } from '../../services/alertService';
import { useAuth } from '../../context/FirebaseAuthContext';

// Style guide colors
const STYLE_COLORS = {
  primary: {
    dark: '#072B2B',
    medium: '#376452',
    bright: '#428F2F',
  },
  secondary: {
    success1: '#4CB610',
    success2: '#50C800',
    error: '#D42700',
  },
  background: {
    light: '#EFFFE9',
    gray1: '#F2F2F2',
    gray2: '#F4F4F4',
  },
  text: {
    light: '#BCBCBC',
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`alerts-tabpanel-${index}`}
      aria-labelledby={`alerts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AlertCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'acknowledge' | 'resolve' | 'delete' | null }>({
    open: false,
    action: null
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const alertsData = await AlertService.getAllAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
      showSnackbar('Error loading alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await AlertService.getAlertStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading alert stats:', error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [loadAlerts, loadStats]);

  const filterAlerts = useCallback(() => {
    let filtered = [...alerts];

    // Filter by tab (status)
    if (tabValue === 1) filtered = filtered.filter(alert => alert.status === AlertStatus.ACTIVE);
    if (tabValue === 2) filtered = filtered.filter(alert => alert.status === AlertStatus.ACKNOWLEDGED);
    if (tabValue === 3) filtered = filtered.filter(alert => alert.status === AlertStatus.RESOLVED);

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Filter by status (additional filter)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, tabValue, severityFilter, statusFilter]);

  useEffect(() => {
    filterAlerts();
  }, [filterAlerts]);

  const handleAction = async (action: 'acknowledge' | 'resolve' | 'delete') => {
    if (!selectedAlert || !currentUser) return;

    try {
      let success = false;
      const userName = currentUser.displayName || currentUser.email || 'Unknown User';

      switch (action) {
        case 'acknowledge':
          const acknowledgedAlert = await AlertService.acknowledgeAlert(selectedAlert.id, userName);
          success = !!acknowledgedAlert;
          break;
        case 'resolve':
          const resolvedAlert = await AlertService.resolveAlert(selectedAlert.id, userName);
          success = !!resolvedAlert;
          break;
        case 'delete':
          success = await AlertService.deleteAlert(selectedAlert.id);
          break;
      }

      if (success) {
        await loadAlerts();
        await loadStats();
        showSnackbar(`Alert ${action}d successfully`, 'success');
      } else {
        showSnackbar(`Failed to ${action} alert`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
      showSnackbar(`Error ${action}ing alert`, 'error');
    }

    setActionDialog({ open: false, action: null });
    setSelectedAlert(null);
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.LOW:
        return <InfoIcon sx={{ color: STYLE_COLORS.secondary.success2 }} />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon sx={{ color: STYLE_COLORS.primary.bright }} />;
      case AlertSeverity.HIGH:
        return <ErrorIcon sx={{ color: STYLE_COLORS.secondary.success1 }} />;
      case AlertSeverity.CRITICAL:
        return <DangerousIcon sx={{ color: STYLE_COLORS.secondary.error }} />;
      default:
        return <InfoIcon sx={{ color: STYLE_COLORS.primary.medium }} />;
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return <CancelIcon sx={{ color: STYLE_COLORS.secondary.error }} />;
      case AlertStatus.ACKNOWLEDGED:
        return <ScheduleIcon sx={{ color: STYLE_COLORS.primary.bright }} />;
      case AlertStatus.RESOLVED:
        return <CheckCircleIcon sx={{ color: STYLE_COLORS.secondary.success2 }} />;
      default:
        return <InfoIcon sx={{ color: STYLE_COLORS.primary.medium }} />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.LOW:
        return STYLE_COLORS.secondary.success2;
      case AlertSeverity.MEDIUM:
        return STYLE_COLORS.primary.bright;
      case AlertSeverity.HIGH:
        return STYLE_COLORS.secondary.success1;
      case AlertSeverity.CRITICAL:
        return STYLE_COLORS.secondary.error;
      default:
        return STYLE_COLORS.primary.medium;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return STYLE_COLORS.secondary.error;
      case AlertStatus.ACKNOWLEDGED:
        return STYLE_COLORS.primary.bright;
      case AlertStatus.RESOLVED:
        return STYLE_COLORS.secondary.success2;
      default:
        return STYLE_COLORS.primary.medium;
    }
  };

  const formatValue = (alert: Alert) => {
    if (alert.value !== undefined && alert.unit) {
      return `${alert.value}${alert.unit}`;
    }
    return null;
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - alertDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const renderAlertCard = (alert: Alert) => {
    const severityColor = getSeverityColor(alert.severity);
    const severity = alert.severity.toLowerCase();
    
    return (
      <Card
        key={alert.id}
        className={`alert-card-enter ${alert.severity === AlertSeverity.CRITICAL ? 'alert-card-critical' : ''}`}
        sx={{
          mb: 3,
          position: 'relative',
          overflow: 'visible',
          background: severity === 'critical' 
            ? `linear-gradient(135deg, ${STYLE_COLORS.secondary.error}08 0%, ${STYLE_COLORS.secondary.error}03 100%)`
            : severity === 'high' 
            ? `linear-gradient(135deg, ${STYLE_COLORS.secondary.success1}08 0%, ${STYLE_COLORS.secondary.success1}03 100%)`
            : severity === 'medium' 
            ? `linear-gradient(135deg, ${STYLE_COLORS.primary.bright}08 0%, ${STYLE_COLORS.primary.bright}03 100%)`
            : `linear-gradient(135deg, ${STYLE_COLORS.secondary.success2}08 0%, ${STYLE_COLORS.secondary.success2}03 100%)`,
          border: `1px solid ${severityColor}20`,
          borderLeft: `6px solid ${severityColor}`,
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 20px 25px -5px ${severityColor}15, 0 10px 10px -5px ${severityColor}10`,
            borderColor: `${severityColor}40`,
          },
          '&::before': alert.severity === AlertSeverity.CRITICAL ? {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: `linear-gradient(45deg, ${severityColor}30, transparent, ${severityColor}30)`,
            borderRadius: '18px',
            zIndex: -1,
            opacity: 0.6,
          } : {},
        }}
      >
        {/* Floating severity badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            zIndex: 2,
          }}
        >
          <Chip
            size="small"
            label={alert.severity.toUpperCase()}
            sx={{
              background: `linear-gradient(135deg, ${severityColor} 0%, ${severityColor}CC 100%)`,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              boxShadow: `0 4px 8px ${severityColor}40`,
              border: `2px solid white`,
            }}
          />
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
              {/* Enhanced severity icon with gradient background */}
              <Box 
                sx={{ 
                  mt: 0.5,
                  p: 1.5,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${severityColor}15 0%, ${severityColor}08 100%)`,
                  border: `1px solid ${severityColor}20`,
                }}
              >
                {getSeverityIcon(alert.severity)}
              </Box>
              
              <Box sx={{ flex: 1 }}>
                {/* Enhanced header with better typography */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ 
                      color: STYLE_COLORS.primary.dark,
                      fontSize: '1.1rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {alert.title}
                  </Typography>
                  <Chip
                    size="small"
                    icon={getStatusIcon(alert.status)}
                    label={alert.status.replace('_', ' ').toUpperCase()}
                    variant="outlined"
                    sx={{
                      backgroundColor: `${getStatusColor(alert.status)}10`,
                      borderColor: `${getStatusColor(alert.status)}40`,
                      color: getStatusColor(alert.status),
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}
                  />
                </Box>

                {/* Enhanced message with better spacing */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    color: STYLE_COLORS.primary.medium,
                  }}
                >
                  {alert.message}
                </Typography>

                {/* Modern grid layout for metadata */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {alert.farmName && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        backgroundColor: STYLE_COLORS.background.light,
                        border: `1px solid ${STYLE_COLORS.primary.medium}20`,
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.7rem',
                          color: STYLE_COLORS.text.light,
                        }}>
                          FARM
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ 
                          mt: 0.5,
                          color: STYLE_COLORS.primary.dark,
                        }}>
                          {alert.farmName}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {alert.deviceName && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        backgroundColor: STYLE_COLORS.background.light,
                        border: `1px solid ${STYLE_COLORS.primary.medium}20`,
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.7rem',
                          color: STYLE_COLORS.text.light,
                        }}>
                          DEVICE
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ 
                          mt: 0.5,
                          color: STYLE_COLORS.primary.dark,
                        }}>
                          {alert.deviceName}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {alert.sensorType && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        backgroundColor: STYLE_COLORS.background.light,
                        border: `1px solid ${STYLE_COLORS.primary.medium}20`,
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.7rem',
                          color: STYLE_COLORS.text.light,
                        }}>
                          SENSOR
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ 
                          mt: 0.5,
                          color: STYLE_COLORS.primary.dark,
                        }}>
                          {alert.sensorType}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {formatValue(alert) && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        backgroundColor: `${severityColor}08`,
                        border: `1px solid ${severityColor}20`,
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.7rem',
                          color: STYLE_COLORS.text.light,
                        }}>
                          CURRENT VALUE
                          {alert.threshold && ` (Threshold: ${alert.threshold}${alert.unit})`}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={700} 
                          sx={{ 
                            mt: 0.5,
                            color: severityColor,
                            fontSize: '1rem',
                          }}
                        >
                          {formatValue(alert)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Enhanced timestamp styling */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '8px', 
                  backgroundColor: STYLE_COLORS.background.gray1,
                  border: `1px solid ${STYLE_COLORS.primary.medium}20`,
                }}>
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.8rem', 
                    lineHeight: 1.5,
                    color: STYLE_COLORS.primary.medium,
                  }}>
                    <strong>Created:</strong> {formatTimeAgo(alert.createdAt)}
                    {alert.acknowledgedBy && (
                      <><br /><strong>Acknowledged by:</strong> {alert.acknowledgedBy}</>
                    )}
                    {alert.resolvedBy && (
                      <><br /><strong>Resolved by:</strong> {alert.resolvedBy}</>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {alert.status === AlertStatus.ACTIVE && (
                <Tooltip title="Acknowledge">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setActionDialog({ open: true, action: 'acknowledge' });
                    }}
                    sx={{ color: STYLE_COLORS.primary.bright }}
                  >
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
              )}
              {(alert.status === AlertStatus.ACTIVE || alert.status === AlertStatus.ACKNOWLEDGED) && (
                <Tooltip title="Resolve">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setActionDialog({ open: true, action: 'resolve' });
                    }}
                    sx={{ color: STYLE_COLORS.secondary.success2 }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setActionDialog({ open: true, action: 'delete' });
                  }}
                  sx={{ color: STYLE_COLORS.secondary.error }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStatsCard = (title: string, value: number, color: string, icon: React.ReactNode) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${STYLE_COLORS.background.light} 0%, ${STYLE_COLORS.background.gray1} 100%)`,
      border: `1px solid ${STYLE_COLORS.primary.medium}20`,
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${color}15`,
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: STYLE_COLORS.primary.medium }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: 3,
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${STYLE_COLORS.background.light} 0%, ${STYLE_COLORS.background.gray2} 100%)`,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box className="alert-center-header" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: STYLE_COLORS.primary.bright }} />
          <Typography variant="h4" fontWeight={700} className="alert-center-title" sx={{ 
            color: STYLE_COLORS.primary.dark,
            background: `linear-gradient(135deg, ${STYLE_COLORS.primary.dark} 0%, ${STYLE_COLORS.primary.medium} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Alert Center
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadAlerts();
            loadStats();
          }}
          disabled={loading}
          sx={{
            borderColor: STYLE_COLORS.primary.bright,
            color: STYLE_COLORS.primary.bright,
            borderRadius: '12px',
            px: 3,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              borderColor: STYLE_COLORS.primary.medium,
              backgroundColor: `${STYLE_COLORS.primary.bright}08`,
              transform: 'translateY(-1px)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Total Alerts', stats.total, STYLE_COLORS.primary.medium, <NotificationsIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Active', stats.active, STYLE_COLORS.secondary.error, <CancelIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Acknowledged', stats.acknowledged, STYLE_COLORS.secondary.success1, <ScheduleIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Resolved', stats.resolved, STYLE_COLORS.secondary.success2, <CheckCircleIcon fontSize="large" />)}
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: STYLE_COLORS.background.light,
        border: `1px solid ${STYLE_COLORS.primary.medium}20`,
        borderRadius: '16px',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterIcon sx={{ color: STYLE_COLORS.primary.bright }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: STYLE_COLORS.primary.dark }}>
            Filters:
          </Typography>
          <FormControl size="small" sx={{ 
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: STYLE_COLORS.primary.bright,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: STYLE_COLORS.primary.medium,
              }
            }
          }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={AlertSeverity.LOW}>Low</MenuItem>
              <MenuItem value={AlertSeverity.MEDIUM}>Medium</MenuItem>
              <MenuItem value={AlertSeverity.HIGH}>High</MenuItem>
              <MenuItem value={AlertSeverity.CRITICAL}>Critical</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ 
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: STYLE_COLORS.primary.bright,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: STYLE_COLORS.primary.medium,
              }
            }
          }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={AlertStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={AlertStatus.ACKNOWLEDGED}>Acknowledged</MenuItem>
              <MenuItem value={AlertStatus.RESOLVED}>Resolved</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ 
        borderBottom: `2px solid ${STYLE_COLORS.primary.medium}20`, 
        mb: 2,
        backgroundColor: STYLE_COLORS.background.light,
        borderRadius: '16px 16px 0 0',
        px: 2,
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              color: STYLE_COLORS.primary.medium,
              '&.Mui-selected': {
                color: STYLE_COLORS.primary.bright,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: STYLE_COLORS.primary.bright,
              height: 3,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                All Alerts
                <Badge 
                  badgeContent={stats?.total || 0} 
                  sx={{ 
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: STYLE_COLORS.primary.medium,
                      color: 'white',
                    }
                  }} 
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Active
                <Badge 
                  badgeContent={stats?.active || 0} 
                  sx={{ 
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: STYLE_COLORS.secondary.error,
                      color: 'white',
                    }
                  }} 
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Acknowledged
                <Badge 
                  badgeContent={stats?.acknowledged || 0} 
                  sx={{ 
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: STYLE_COLORS.secondary.success1,
                      color: 'white',
                    }
                  }} 
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Resolved
                <Badge 
                  badgeContent={stats?.resolved || 0} 
                  sx={{ 
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: STYLE_COLORS.secondary.success2,
                      color: 'white',
                    }
                  }} 
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Alert List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: STYLE_COLORS.primary.bright }} />
        </Box>
      ) : (
        <TabPanel value={tabValue} index={tabValue}>
          {filteredAlerts.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: STYLE_COLORS.background.light,
              border: `1px solid ${STYLE_COLORS.primary.medium}20`,
              borderRadius: '16px',
            }}>
              <NotificationsIcon sx={{ fontSize: 64, color: STYLE_COLORS.text.light, mb: 2 }} />
              <Typography variant="h6" sx={{ color: STYLE_COLORS.primary.medium }}>
                No alerts found
              </Typography>
              <Typography variant="body2" sx={{ color: STYLE_COLORS.text.light }}>
                {tabValue === 0 && 'There are currently no alerts in the system.'}
                {tabValue === 1 && 'No active alerts requiring attention.'}
                {tabValue === 2 && 'No acknowledged alerts awaiting resolution.'}
                {tabValue === 3 && 'No resolved alerts to display.'}
              </Typography>
            </Paper>
          ) : (
            filteredAlerts.map(renderAlertCard)
          )}
        </TabPanel>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: null })}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${STYLE_COLORS.primary.medium}20`,
          }
        }}
      >
        <DialogTitle sx={{ color: STYLE_COLORS.primary.dark }}>
          Confirm {actionDialog.action === 'acknowledge' ? 'Acknowledgment' : 
                   actionDialog.action === 'resolve' ? 'Resolution' : 'Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: STYLE_COLORS.primary.medium }}>
            {actionDialog.action === 'acknowledge' && 
              'Are you sure you want to acknowledge this alert? This will mark it as seen but not resolved.'}
            {actionDialog.action === 'resolve' && 
              'Are you sure you want to resolve this alert? This will mark it as completed.'}
            {actionDialog.action === 'delete' && 
              'Are you sure you want to delete this alert? This action cannot be undone.'}
          </DialogContentText>
          {selectedAlert && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: STYLE_COLORS.background.light, 
              borderRadius: '12px',
              border: `1px solid ${STYLE_COLORS.primary.medium}20`,
            }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: STYLE_COLORS.primary.dark }}>
                {selectedAlert.title}
              </Typography>
              <Typography variant="body2" sx={{ color: STYLE_COLORS.primary.medium }}>
                {selectedAlert.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, action: null })}
            sx={{ 
              color: STYLE_COLORS.text.light,
              borderRadius: '8px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => actionDialog.action && handleAction(actionDialog.action)}
            variant="contained"
            sx={{
              backgroundColor: actionDialog.action === 'delete' ? STYLE_COLORS.secondary.error : STYLE_COLORS.primary.bright,
              borderRadius: '8px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: actionDialog.action === 'delete' 
                  ? `${STYLE_COLORS.secondary.error}CC` 
                  : `${STYLE_COLORS.primary.bright}CC`,
              }
            }}
          >
            {actionDialog.action === 'acknowledge' ? 'Acknowledge' : 
             actionDialog.action === 'resolve' ? 'Resolve' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            borderRadius: '12px',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: STYLE_COLORS.secondary.success2,
              color: 'white',
            },
            '&.MuiAlert-standardError': {
              backgroundColor: STYLE_COLORS.secondary.error,
              color: 'white',
            }
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default AlertCenter;