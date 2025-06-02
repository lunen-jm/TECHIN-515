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
import { useAuth } from '../../context/AuthContext';

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
  const [tabValue, setTabValue] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'acknowledge' | 'resolve' | 'delete' | null }>({
    open: false,
    action: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
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
        return <InfoIcon sx={{ color: '#50C800' }} />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon sx={{ color: '#4CB610' }} />;
      case AlertSeverity.HIGH:
        return <ErrorIcon sx={{ color: '#D42700' }} />;
      case AlertSeverity.CRITICAL:
        return <DangerousIcon sx={{ color: '#D42700' }} />;
      default:
        return <InfoIcon sx={{ color: '#376452' }} />;
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return <CancelIcon sx={{ color: '#D42700' }} />;
      case AlertStatus.ACKNOWLEDGED:
        return <ScheduleIcon sx={{ color: '#4CB610' }} />;
      case AlertStatus.RESOLVED:
        return <CheckCircleIcon sx={{ color: '#50C800' }} />;
      default:
        return <InfoIcon sx={{ color: '#376452' }} />;
    }
  };

  const formatValue = (alert: Alert) => {
    if (alert.value !== undefined && alert.unit) {
      return `${alert.value}${alert.unit}`;
    }
    return null;
  };

  const renderAlertCard = (alert: Alert) => {
    const severityColor = AlertService.getSeverityColor(alert.severity);
    const statusColor = AlertService.getStatusColor(alert.status);
    const isHighPriority = alert.severity === AlertSeverity.HIGH || alert.severity === AlertSeverity.CRITICAL;
    
    return (
      <Card
        key={alert.id}
        className={`alert-card ${alert.severity.toLowerCase()} ${isHighPriority ? 'critical' : ''}`}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${severityColor}30`,
          background: isHighPriority 
            ? `linear-gradient(135deg, #FFFFFF 0%, ${severityColor}08 100%)`
            : `linear-gradient(135deg, #FFFFFF 0%, ${severityColor}05 100%)`,
          boxShadow: `0 4px 12px ${severityColor}20`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${severityColor}30`,
            borderColor: `${severityColor}60`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: isHighPriority 
              ? 'linear-gradient(180deg, #D42700 0%, #428F2F 100%)'
              : `linear-gradient(180deg, ${severityColor} 0%, #50C800 100%)`,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Modern header with improved styling */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2,
            gap: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box 
                className="alert-icon"
                sx={{ 
                  p: 1, 
                  borderRadius: '8px', 
                  backgroundColor: `${severityColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getSeverityIcon(alert.severity)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  className="alert-message"
                  sx={{
                    fontWeight: 600,
                    color: '#000000',
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                  }}
                >
                  {alert.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  className="alert-timestamp"
                  sx={{ 
                    color: '#376452',                  fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {new Date(alert.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                size="small"
                icon={getStatusIcon(alert.status)}
                label={alert.status.replace('_', ' ').toUpperCase()}
                className="alert-badge"
                sx={{
                  backgroundColor: `${statusColor}15`,
                  borderColor: `${statusColor}40`,
                  color: statusColor,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  borderRadius: '20px',
                  border: `1px solid ${statusColor}40`,
                }}
              />
              <Chip
                size="small"
                label={alert.severity.toUpperCase()}
                sx={{
                  backgroundColor: `${severityColor}15`,
                  color: severityColor,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  borderRadius: '20px',
                  border: `1px solid ${severityColor}40`,
                }}
              />
            </Box>
          </Box>

          {/* Enhanced message with better spacing */}
          <Typography 
            variant="body1" 
            className="alert-message"
            sx={{ 
              mb: 3,
              lineHeight: 1.6,
              fontSize: '0.95rem',
              color: '#072B2B',
            }}
          >
            {alert.message}
          </Typography>

          {/* Modern grid layout for metadata with style guide colors */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {alert.farmName && (
              <Grid item xs={12} sm={6} md={3}>
                <Box className="alert-device-info" sx={{ 
                  p: 2, 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(66, 143, 47, 0.05)',
                  border: '1px solid rgba(66, 143, 47, 0.1)',
                }}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    color: '#376452',
                    letterSpacing: '0.5px',
                  }}>
                    FARM
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: '#072B2B' }}>
                    {alert.farmName}
                  </Typography>
                </Box>
              </Grid>
            )}
            {alert.deviceName && (
              <Grid item xs={12} sm={6} md={3}>
                <Box className="alert-device-info" sx={{ 
                  p: 2, 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(66, 143, 47, 0.05)',
                  border: '1px solid rgba(66, 143, 47, 0.1)',
                }}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    color: '#376452',
                    letterSpacing: '0.5px',
                  }}>
                    DEVICE
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: '#072B2B' }}>
                    {alert.deviceName}
                  </Typography>
                </Box>
              </Grid>
            )}
            {alert.sensorType && (
              <Grid item xs={12} sm={6} md={3}>
                <Box className="alert-device-info" sx={{ 
                  p: 2, 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(66, 143, 47, 0.05)',
                  border: '1px solid rgba(66, 143, 47, 0.1)',
                }}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    color: '#376452',
                    letterSpacing: '0.5px',
                  }}>
                    SENSOR
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: '#072B2B' }}>
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
                    color: '#376452',
                    letterSpacing: '0.5px',
                  }}>
                    CURRENT VALUE
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: severityColor }}>
                    {formatValue(alert)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Modern action buttons with style guide colors */}
          <Box className="alert-actions" sx={{ 
            display: 'flex', 
            gap: 1.5, 
            mt: 3,
            pt: 2,
            borderTop: '1px solid rgba(66, 143, 47, 0.1)',
          }}>
            {alert.status === AlertStatus.ACTIVE && (
              <Button
                variant="contained"
                size="small"
                className="alert-action-button"
                startIcon={<CheckIcon />}
                onClick={() => {
                  setSelectedAlert(alert);
                  setActionDialog({ open: true, action: 'acknowledge' });
                }}
                sx={{
                  background: 'linear-gradient(135deg, #428F2F 0%, #4CB610 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #376452 0%, #428F2F 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(66, 143, 47, 0.3)',
                  }
                }}
              >
                Acknowledge
              </Button>
            )}
            {alert.status === AlertStatus.ACKNOWLEDGED && (
              <Button
                variant="contained"
                size="small"
                className="alert-action-button"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  setSelectedAlert(alert);
                  setActionDialog({ open: true, action: 'resolve' });
                }}
                sx={{
                  background: 'linear-gradient(135deg, #50C800 0%, #4CB610 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4CB610 0%, #428F2F 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(80, 200, 0, 0.3)',
                  }
                }}
              >
                Resolve
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              className="alert-action-button secondary"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setSelectedAlert(alert);
                setActionDialog({ open: true, action: 'delete' });
              }}
              sx={{
                background: 'linear-gradient(135deg, #F2F2F2 0%, #F4F4F4 100%)',
                color: '#072B2B',
                border: '1px solid rgba(66, 143, 47, 0.2)',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #EFFFE9 0%, #F2F2F2 100%)',
                  borderColor: 'rgba(66, 143, 47, 0.4)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStatsCard = (title: string, value: number, color: string, icon: React.ReactNode) => (
    <Card sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(66, 143, 47, 0.02) 100%)',
      border: '1px solid rgba(66, 143, 47, 0.1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(66, 143, 47, 0.15)',
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#376452', fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="alert-center-container" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box className="alert-center-header" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: '#428F2F' }} />
          <Typography variant="h4" fontWeight={700} className="alert-center-title" sx={{ color: '#072B2B' }}>
            Alert Center
          </Typography>
          {stats && stats.active > 0 && (
            <Chip
              label={`${stats.active} Active`}
              className="alert-badge"
              sx={{
                background: 'linear-gradient(135deg, #D42700 0%, #B71C1C 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                animation: 'alertPulse 2s ease-in-out infinite',
              }}
            />
          )}
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
            borderColor: '#428F2F',
            color: '#428F2F',
            '&:hover': {
              borderColor: '#376452',
              backgroundColor: 'rgba(66, 143, 47, 0.05)',
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
            {renderStatsCard('Total Alerts', stats.total, '#376452', <NotificationsIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Active', stats.active, '#D42700', <CancelIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Acknowledged', stats.acknowledged, '#4CB610', <ScheduleIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Resolved', stats.resolved, '#50C800', <CheckCircleIcon fontSize="large" />)}
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(66, 143, 47, 0.02) 100%)',
        border: '1px solid rgba(66, 143, 47, 0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterIcon sx={{ color: '#376452' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#072B2B' }}>
            Filters:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
      <Box sx={{ borderBottom: '1px solid rgba(66, 143, 47, 0.2)', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#376452',
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: '#072B2B !important',
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
                      backgroundColor: '#376452',
                      color: '#FFFFFF'
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
                      backgroundColor: '#D42700',
                      color: '#FFFFFF'
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
                      backgroundColor: '#4CB610',
                      color: '#FFFFFF'
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
                      backgroundColor: '#50C800',
                      color: '#FFFFFF'
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
          <CircularProgress sx={{ color: '#428F2F' }} />
        </Box>
      ) : (
        <TabPanel value={tabValue} index={tabValue}>
          {filteredAlerts.length === 0 ? (
            <Paper className="alert-empty-state" sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(66, 143, 47, 0.02) 100%)',
              border: '1px solid rgba(66, 143, 47, 0.1)',
            }}>
              <NotificationsIcon className="alert-empty-icon" sx={{ fontSize: 64, color: '#50C800', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#072B2B', fontWeight: 600 }}>
                No alerts found
              </Typography>
              <Typography variant="body2" sx={{ color: '#376452' }}>
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
      >
        <DialogTitle sx={{ color: '#072B2B', fontWeight: 600 }}>
          Confirm {actionDialog.action === 'acknowledge' ? 'Acknowledgment' : 
                   actionDialog.action === 'resolve' ? 'Resolution' : 'Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#376452' }}>
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
              bgcolor: 'rgba(66, 143, 47, 0.05)', 
              borderRadius: 1,
              border: '1px solid rgba(66, 143, 47, 0.1)'
            }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#072B2B' }}>
                {selectedAlert.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#376452' }}>
                {selectedAlert.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, action: null })}
            sx={{ color: '#376452' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => actionDialog.action && handleAction(actionDialog.action)}
            variant="contained"
            sx={{
              backgroundColor: actionDialog.action === 'delete' ? '#D42700' : '#428F2F',
              '&:hover': {
                backgroundColor: actionDialog.action === 'delete' ? '#B71C1C' : '#376452',
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
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#50C800',
              color: '#FFFFFF',
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#D42700',
              color: '#FFFFFF',
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
