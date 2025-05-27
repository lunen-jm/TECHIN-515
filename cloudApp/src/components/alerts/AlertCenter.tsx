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
        return <InfoIcon color="info" />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon color="warning" />;
      case AlertSeverity.HIGH:
        return <ErrorIcon color="error" />;
      case AlertSeverity.CRITICAL:
        return <DangerousIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return <CancelIcon color="error" />;
      case AlertStatus.ACKNOWLEDGED:
        return <ScheduleIcon color="warning" />;
      case AlertStatus.RESOLVED:
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const formatValue = (alert: Alert) => {
    if (alert.value !== undefined && alert.unit) {
      return `${alert.value}${alert.unit}`;
    }
    return null;
  };

  const renderAlertCard = (alert: Alert) => (    <Card
      key={alert.id}
      sx={{
        mb: 2,
        elevation: 0,
        boxShadow: `0 2px 8px ${AlertService.getSeverityColor(alert.severity)}20`,
        borderLeft: `4px solid ${AlertService.getSeverityColor(alert.severity)}`,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${AlertService.getSeverityColor(alert.severity)}30`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            <Box sx={{ mt: 0.5 }}>
              {getSeverityIcon(alert.severity)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {alert.title}
                </Typography>
                <Chip
                  size="small"
                  label={alert.severity.toUpperCase()}
                  sx={{
                    backgroundColor: `${AlertService.getSeverityColor(alert.severity)}20`,
                    color: AlertService.getSeverityColor(alert.severity),
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  icon={getStatusIcon(alert.status)}
                  label={alert.status.toUpperCase()}
                  sx={{
                    backgroundColor: `${AlertService.getStatusColor(alert.status)}20`,
                    color: AlertService.getStatusColor(alert.status),
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {alert.message}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {alert.farmName && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Farm</Typography>
                    <Typography variant="body2" fontWeight={500}>{alert.farmName}</Typography>
                  </Grid>
                )}
                {alert.deviceName && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Device</Typography>
                    <Typography variant="body2" fontWeight={500}>{alert.deviceName}</Typography>
                  </Grid>
                )}
                {alert.sensorType && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Sensor</Typography>
                    <Typography variant="body2" fontWeight={500}>{alert.sensorType}</Typography>
                  </Grid>
                )}
                {formatValue(alert) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Current Value {alert.threshold && `(Threshold: ${alert.threshold}${alert.unit})`}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color={AlertService.getSeverityColor(alert.severity)}>
                      {formatValue(alert)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              <Typography variant="caption" color="text.secondary">
                Created: {AlertService.formatTimeAgo(alert.createdAt)}
                {alert.acknowledgedBy && ` • Acknowledged by ${alert.acknowledgedBy}`}
                {alert.resolvedBy && ` • Resolved by ${alert.resolvedBy}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {alert.status === AlertStatus.ACTIVE && (
              <Tooltip title="Acknowledge">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setActionDialog({ open: true, action: 'acknowledge' });
                  }}
                  sx={{ color: 'warning.main' }}
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
                  sx={{ color: 'success.main' }}
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
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderStatsCard = (title: string, value: number, color: string, icon: React.ReactNode) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
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
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Total Alerts', stats.total, '#2196F3', <NotificationsIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Active', stats.active, '#F44336', <CancelIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Acknowledged', stats.acknowledged, '#FFA726', <ScheduleIcon fontSize="large" />)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard('Resolved', stats.resolved, '#4CAF50', <CheckCircleIcon fontSize="large" />)}
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterIcon color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
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
      </Paper>      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                All Alerts
                <Badge badgeContent={stats?.total || 0} color="primary" sx={{ ml: 2 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Active
                <Badge badgeContent={stats?.active || 0} color="error" sx={{ ml: 2 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Acknowledged
                <Badge badgeContent={stats?.acknowledged || 0} color="warning" sx={{ ml: 2 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Resolved
                <Badge badgeContent={stats?.resolved || 0} color="success" sx={{ ml: 2 }} />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Alert List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TabPanel value={tabValue} index={tabValue}>
          {filteredAlerts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No alerts found
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
        <DialogTitle>
          Confirm {actionDialog.action === 'acknowledge' ? 'Acknowledgment' : 
                   actionDialog.action === 'resolve' ? 'Resolution' : 'Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionDialog.action === 'acknowledge' && 
              'Are you sure you want to acknowledge this alert? This will mark it as seen but not resolved.'}
            {actionDialog.action === 'resolve' && 
              'Are you sure you want to resolve this alert? This will mark it as completed.'}
            {actionDialog.action === 'delete' && 
              'Are you sure you want to delete this alert? This action cannot be undone.'}
          </DialogContentText>
          {selectedAlert && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {selectedAlert.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAlert.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => actionDialog.action && handleAction(actionDialog.action)}
            variant="contained"
            color={actionDialog.action === 'delete' ? 'error' : 'primary'}
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
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default AlertCenter;
